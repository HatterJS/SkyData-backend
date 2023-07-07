import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { UserEntity, UserDocument } from './entities/user.entity';
import { UpdateUserCommonDto, UpdateUserPassDto } from './dto/update-user.dto';
import { FileDocument, FileEntity } from 'src/files/entities/file.entity';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import { destination } from '../files/storage';
import { avatarDestination } from './storage';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserEntity.name)
    private userModel: Model<UserDocument>,

    @InjectModel(FileEntity.name)
    private fileModel: Model<FileDocument>,
  ) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(_id: string) {
    return this.userModel.findById(_id).exec();
  }

  async create(dto: CreateUserDto) {
    const findUser = await this.findByEmail(dto.email);

    if (findUser) {
      throw new ForbiddenException(
        'Користувач з таким email вже зареєстрований',
      );
    }

    const password = dto.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const createdUser = new this.userModel({ ...dto, password: hash });
    return createdUser.save();
  }

  async confirmEmail(id: string) {
    const userData = await this.userModel.findByIdAndUpdate(
      id,
      {
        isConfirmed: true,
      },
      { new: true },
    );
    userData.save();
    return userData.isConfirmed;
  }

  async updateCommon(_id: Types.ObjectId, dto: UpdateUserCommonDto) {
    const updateUser = await this.userModel.findByIdAndUpdate(
      _id,
      {
        fullName: dto.fullName,
      },
      { new: true },
    );
    return updateUser.fullName;
  }

  async updatePass(_id: Types.ObjectId, dto: UpdateUserPassDto) {
    const password = dto.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const updateUser = await this.userModel.findByIdAndUpdate(
      _id,
      {
        password: hash,
      },
      { new: true },
    );
    return updateUser.save();
  }

  async deleteUser(_id: Types.ObjectId) {
    try {
      const user = await this.userModel.findById(_id);

      const filesToDelete = await this.fileModel.find({ user: _id });
      const deleteFilesResult = await this.fileModel.deleteMany({ user: _id });

      user.avatar !== 'default-avatar.webp' &&
        fs.unlink(`${avatarDestination}/${user.avatar}`, (err) => {
          if (err) {
            console.error(`Failed to delete file "${user.avatar}": ${err}`);
          } else {
            console.log(`Successfully deleted file "${user.avatar}"`);
          }
        });

      filesToDelete.forEach((file) => {
        fs.unlink(`${destination}/${file.filename}`, (err) => {
          if (err) {
            console.error(`Failed to delete file "${file.filename}": ${err}`);
          } else {
            console.log(`Successfully deleted file "${file.filename}"`);
          }
        });
      });

      const deleteUserResult = await this.userModel.findByIdAndDelete(_id);

      return {
        userName: deleteUserResult?.email ?? '',
        fileCount: deleteFilesResult?.deletedCount ?? 0,
      };
    } catch (err) {
      throw new HttpException(
        'Під час видалення виникла помилка',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createAvatar(file: Express.Multer.File, userId: ObjectId) {
    try {
      const updateUser = await this.userModel.findByIdAndUpdate(
        userId,
        {
          avatar: file.filename,
        },
        { new: true },
      );
      return updateUser.avatar;
    } catch (err) {
      throw new HttpException(
        'Під час видалення виникла помилка',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeAvatar(userId: ObjectId) {
    try {
      const user = await this.userModel.findById(userId);

      user.avatar !== 'default-avatar.webp' &&
        fs.unlink(`${avatarDestination}/${user.avatar}`, (err) => {
          if (err) {
            console.error(`Failed to delete file "${user.avatar}": ${err}`);
          } else {
            console.log(`Successfully deleted file "${user.avatar}"`);
          }
        });
      user.avatar = 'default-avatar.webp';
      user.save();
    } catch (err) {
      throw new HttpException(
        'Під час видалення виникла помилка',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return 'default-avatar.webp';
  }
}
