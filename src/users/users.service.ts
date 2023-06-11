import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserEntity, UserDocument } from './entities/user.entity';
import { UpdateUserCommonDto, UpdateUserPassDto } from './dto/update-user.dto';
import { FileDocument, FileEntity } from 'src/files/entities/file.entity';
import * as fs from 'fs';
import { destination } from '../files/storage';

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
    const createdUser = new this.userModel(dto);
    return createdUser.save();
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
    const updateUser = await this.userModel.findByIdAndUpdate(
      _id,
      {
        password: dto.password,
      },
      { new: true },
    );
    return updateUser.save();
  }

  async deleteUser(_id: Types.ObjectId) {
    try {
      const filesToDelete = await this.fileModel.find({ user: _id });
      const deleteFilesResult = await this.fileModel.deleteMany({ user: _id });

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
      throw new Error('Під час видалення виникли помилки');
    }
  }
}
