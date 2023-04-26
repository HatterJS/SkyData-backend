import { FileEntity } from 'src/files/entities/file.entity';
import { Column, Entity, ObjectId, ObjectIdColumn, OneToMany } from 'typeorm';

@Entity('users')
export class UserEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @OneToMany(() => FileEntity, (file) => file.user)
  files: FileEntity[];
}
