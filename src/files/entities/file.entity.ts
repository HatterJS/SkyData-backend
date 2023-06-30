import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserEntity, UserDocument } from 'src/users/entities/user.entity';

export enum FileType {
  PHOTOS = 'photos',
  VIDEOS = 'videos',
  AUDIOS = 'audios',
  DOCS = 'docs',
}

@Schema({ collection: 'files' })
export class FileEntity extends Document {
  @Prop()
  filename: string;

  @Prop()
  originalName: string;

  @Prop()
  size: number;

  @Prop()
  mimetype: string;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  user: UserDocument;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export type FileDocument = FileEntity & Document;
export const FileSchema = SchemaFactory.createForClass(FileEntity);
