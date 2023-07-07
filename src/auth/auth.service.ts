import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new ForbiddenException('Не вірний логін або пароль');
    }
    const isValidPassword = await bcrypt.compare(pass, user.password);
    if (user && isValidPassword) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(dto: CreateUserDto) {
    const userData = await this.usersService.create(dto);
    const token = this.jwtService.sign({ _id: userData._id });

    // Send confirmation letter
    const confirmationLink = `https://skydata.space/profile/confirm-email?token=${token}`;
    const mailOptions = {
      to: userData.email,
      subject: 'Підтвердження реєстрації.',
      html: `<p>Шановний(а) ${userData.fullName}!</p><p>Вітаємо на хмарному сервісі <b>SkyData!</b> Ваш обліковий запис було створено успішно. Щоб підтвердити свою реєстрацію та активувати обліковий запис, будь ласка, натисніть <a href=${confirmationLink}>ПІДТВЕРДИТИ.</a></p><p></p><p>Якщо ви не реєструвались на нашому сайті, ігноруйте цей лист. Можливо, хтось випадково ввів вашу електронну адресу.</p><p></p><p>Якщо у вас виникли будь-які питання або проблеми з вашим обліковим записом, опишіть обставини у зворотньому листі або через <a href="https://t.me/chaosChronicle_bot">Telegram</a>.</p><p></p><p>Дякуємо,<br>Команда SkyData.space</p>`,
    };
    await this.mailerService.sendMail(mailOptions);

    return { token };
  }

  async login(user: UserEntity) {
    const userWithDoc = user as UserEntity & { _doc: any };
    return {
      token: this.jwtService.sign({ _id: userWithDoc._doc._id }),
    };
  }
}
