import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = Document & UserEntity;

@Schema({ collection: 'users' })
export class UserEntity {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({
    type: String,
    default:
      'https://static.wikia.nocookie.net/avatar/images/3/31/Korra_smiling.png/revision/latest/zoom-crop/width/500/height/500?cb=20200907192928',
  })
  avatar: string;

  @Prop({ type: String, default: 'start' })
  tariffPlan: string;

  @Prop({ type: Number, default: 1 })
  maxSize: number;

  @Prop({ type: Boolean, default: false })
  isConfirmed: boolean;

  @Prop({
    type: {
      images: { type: Number, default: 0 },
      documents: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    default: {
      images: 0,
      documents: 0,
      total: 0,
    },
  })
  usedSpace: {
    images: number;
    documents: number;
    total: number;
  };

  @Prop({ type: Types.ObjectId, ref: 'FileEntity' })
  files: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, auto: true })
  id: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
