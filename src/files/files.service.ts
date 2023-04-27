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

    // if (fileType === FileType.PHOTOS) {
    //   findOptions.where.mimetype = { $regex: /^image/, $options: 'i' };
    // }

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

  async remove(userId: ObjectId, ids: string) {
    const idsArray = ids.split(',').map((_id) => new ObjectId(_id));
    const filesToDelete = await this.repository.find({
      _id: { $in: idsArray },
      'user._id': userId,
    });
    const deleteResult = await this.repository.deleteMany({
      _id: { $in: idsArray },
      'user._id': userId,
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

    return deleteResult;
  }
}
