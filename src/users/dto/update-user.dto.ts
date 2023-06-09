import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPassDto {
  @ApiProperty({
    default: '123456789',
  })
  password: string;
}

export class UpdateUserCommonDto {
  @ApiProperty({
    default: 'Нубас',
  })
  fullName: string;
}
