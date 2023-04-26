import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    default: 'test@test.ua',
  })
  email: string;
  @ApiProperty({
    default: 'Tester',
  })
  fullName: string;
  @ApiProperty({
    default: '123456789',
  })
  password: string;
}
