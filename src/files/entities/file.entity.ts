import { ObjectId } from 'mongodb';
import { UserEntity } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToMany, ObjectIdColumn } from 'typeorm';

export enum FileType {
  PHOTOS = 'photos',
}

@Entity('files')
export class FileEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  size: number;

  @Column()
  mimetype: string;

  @ManyToMany(() => UserEntity, (user) => user.files)
  user: UserEntity;
}
