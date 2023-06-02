import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileEntity, FileSchema } from './entities/file.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from 'src/users/entities/user.entity';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserSchema },
      { name: FileEntity.name, schema: FileSchema },
    ]),
  ],
})
export class FilesModule {}
