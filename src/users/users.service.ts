import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string) {
    return this.repository.findOneBy({
      email,
    });
  }

  async findById(_id: ObjectId) {
    const objectId = new ObjectId(_id);
    return this.repository.findOne({ where: { _id: objectId } });
  }

  create(dto: CreateUserDto) {
    return this.repository.save(dto);
  }
}
