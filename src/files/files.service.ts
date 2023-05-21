import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity, FileType } from './entities/file.entity';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { destination } from './storage';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private repository: MongoRepository<FileEntity>,
  ) {}

  async findAll(userId: ObjectId, fileType: FileType) {
    const findOptions: any = {
      where: {
        user: { _id: userId },
      },
    };

    if (fileType === FileType.PHOTOS) {
      findOptions.where.mimetype = { $regex: /^image/, $options: 'i' };
    }

    if (fileType === FileType.NOPHOTOS) {
      findOptions.where.mimetype = {
        $not: { $regex: /^image/, $options: 'i' },
      };
    }

    return this.repository.find(findOptions);
  }

  create(file: Express.Multer.File, userId: ObjectId) {
    return this.repository.save({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      user: { _id: userId },
    });
  }

  async remove(userId: ObjectId, id: string) {
    const _id = new ObjectId(id);
    const fileToDelete = await this.repository.find({
      _id,
      'user._id': userId,
    });
    const deleteResult = await this.repository.deleteOne({
      _id,
      'user._id': userId,
    });

    fileToDelete.forEach((file) => {
      fs.unlink(`${destination}/${file.filename}`, (err) => {
        if (err) {
          console.error(`Failed to delete file "${file.filename}": ${err}`);
        } else {
          console.log(`Successfully deleted file "${file.filename}"`);
        }
      });
    });

    return deleteResult;
  }
}
