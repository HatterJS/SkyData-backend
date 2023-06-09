import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserEntity, UserDocument } from './entities/user.entity';
import { UpdateUserCommonDto, UpdateUserPassDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserEntity.name)
    private userModel: Model<UserDocument>,
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
}
