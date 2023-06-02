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

  @Prop({ type: Types.ObjectId, ref: 'FileEntity' })
  files: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, auto: true })
  id: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
