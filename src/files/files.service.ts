import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileEntity, FileType, FileDocument } from './entities/file.entity';
import { ObjectId } from 'mongodb';
import * as fs from 'fs';
import { destination } from './storage';
import { UserDocument, UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(FileEntity.name)
    private fileModel: Model<FileDocument>,

    @InjectModel(UserEntity.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findAll(userId: ObjectId, fileType: FileType) {
    const findOptions: any = {
      user: userId,
    };

    if (fileType === FileType.PHOTOS) {
      findOptions.mimetype = { $regex: /^image/, $options: 'i' };
    }
    if (fileType === FileType.VIDEOS) {
      findOptions.mimetype = { $regex: /^video/, $options: 'i' };
    }
    if (fileType === FileType.AUDIOS) {
      findOptions.mimetype = { $regex: /^audio/, $options: 'i' };
    }
    if (fileType === FileType.DOCS) {
      findOptions.mimetype = {
        $not: { $in: [/^image/, /^video/, /^audio/] },
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
    //increase size of used space
    const user = await this.userModel.findById(userId);
    user.usedSpace.total += file.size;
    if (user.usedSpace.total > user.maxSize * 10 ** 6)
      throw new ForbiddenException('Ви перевищили доступний простір хмарки');

    if (
      /^image/.test(file.mimetype) ||
      /^video/.test(file.mimetype) ||
      /^audio/.test(file.mimetype)
    ) {
      user.usedSpace.media += file.size;
    } else {
      user.usedSpace.documents += file.size;
    }
    user.save();

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
      throw new Error('Файл не знайдено');
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
    //reduce size of used space
    const user = await this.userModel.findById(userId);
    user.usedSpace.total -= fileToDelete.size;
    user.usedSpace.total < 0 && (user.usedSpace.total = 0);
    if (
      /^image/.test(fileToDelete.mimetype) ||
      /^video/.test(fileToDelete.mimetype) ||
      /^audio/.test(fileToDelete.mimetype)
    ) {
      user.usedSpace.media -= fileToDelete.size;
      user.usedSpace.media < 0 && (user.usedSpace.media = 0);
    } else {
      user.usedSpace.documents -= fileToDelete.size;
      user.usedSpace.documents < 0 && (user.usedSpace.documents = 0);
    }
    user.save();

    return deleteResult;
  }
}
