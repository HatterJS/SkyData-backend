import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileEntity, FileType, FileDocument } from './entities/file.entity';
import { ObjectId } from 'mongodb';
import * as fs from 'fs';
import { destination } from './storage';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(FileEntity.name)
    private fileModel: Model<FileDocument>,
  ) {}

  async findAll(userId: ObjectId, fileType: FileType) {
    const findOptions: any = {
      user: userId,
    };

    if (fileType === FileType.PHOTOS) {
      findOptions.mimetype = { $regex: /^image/, $options: 'i' };
    }

    if (fileType === FileType.NOPHOTOS) {
      findOptions.mimetype = {
        $not: { $regex: /^image/, $options: 'i' },
      };
    }

    return this.fileModel.find(findOptions).exec();
  }

  async create(file: Express.Multer.File, userId: ObjectId) {
    const newFile = new this.fileModel({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      user: userId,
    });

    return newFile.save();
  }

  async remove(userId: ObjectId, id: string) {
    const fileToDelete = await this.fileModel
      .findOne({
        _id: id,
        user: userId,
      })
      .exec();

    if (!fileToDelete) {
      throw new Error('File not found');
    }

    const deleteResult = await this.fileModel
      .deleteOne({
        _id: id,
        user: userId,
      })
      .exec();

    fs.unlink(`${destination}/${fileToDelete.filename}`, (err) => {
      if (err) {
        console.error(
          `Failed to delete file "${fileToDelete.filename}": ${err}`,
        );
      } else {
        console.log(`Successfully deleted file "${fileToDelete.filename}"`);
      }
    });

    return deleteResult;
  }
}
