import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new ForbiddenException('Не вірний логін або пароль');
    }
    const isValidPassword = await bcrypt.compare(pass, user.password);
    if (user && isValidPassword) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(dto: CreateUserDto) {
    const userData = await this.usersService.create(dto);
    return {
      token: this.jwtService.sign({ _id: userData._id }),
    };
  }

  async login(user: UserEntity) {
    const userWithDoc = user as UserEntity & { _doc: any };
    return {
      token: this.jwtService.sign({ _id: userWithDoc._doc._id }),
    };
  }
}
