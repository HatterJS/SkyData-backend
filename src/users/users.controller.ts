import {
  Controller,
  UseGuards,
  Get,
  Patch,
  Body,
  Delete,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserId } from 'src/decorators/user-id.decorator';
import { ObjectId, Types } from 'mongoose';
import { UpdateUserCommonDto, UpdateUserPassDto } from './dto/update-user.dto';
import { imageFileFilter, userStorage } from './storage';

@Controller('users')
@ApiTags('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  getMe(@UserId() id: Types.ObjectId) {
    return this.usersService.findById(id.toString());
  }

  @Patch('/updatecommon')
  updateUserData(
    @UserId() id: Types.ObjectId,
    @Body() dto: UpdateUserCommonDto,
  ) {
    return this.usersService.updateCommon(id, dto);
  }

  @Patch('/updatepass')
  updateUserPass(@UserId() id: Types.ObjectId, @Body() dto: UpdateUserPassDto) {
    return this.usersService.updatePass(id, dto);
  }

  @Delete('/deleteuser')
  deleteUser(@UserId() id: Types.ObjectId) {
    return this.usersService.deleteUser(id);
  }

  @Post('/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: userStorage,
      fileFilter: imageFileFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })],
      }),
    )
    file: Express.Multer.File,
    @UserId() userId: ObjectId,
  ) {
    return this.usersService.createAvatar(file, userId);
  }

  @Delete('/avatar')
  remove(@UserId() userId: ObjectId) {
    return this.usersService.removeAvatar(userId);
  }
}
