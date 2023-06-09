import { Controller, UseGuards, Get, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserId } from 'src/decorators/user-id.decorator';
import { Types } from 'mongoose';
import { UpdateUserCommonDto, UpdateUserPassDto } from './dto/update-user.dto';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getMe(@UserId() id: Types.ObjectId) {
    return this.usersService.findById(id.toString());
  }

  @Patch('/updatecommon')
  @UseGuards(JwtAuthGuard)
  updateUserData(
    @UserId() id: Types.ObjectId,
    @Body() dto: UpdateUserCommonDto,
  ) {
    return this.usersService.updateCommon(id, dto);
  }

  @Patch('/updatepass')
  @UseGuards(JwtAuthGuard)
  updateUserPass(@UserId() id: Types.ObjectId, @Body() dto: UpdateUserPassDto) {
    return this.usersService.updatePass(id, dto);
  }
}
