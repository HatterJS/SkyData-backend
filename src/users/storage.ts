import { ForbiddenException } from '@nestjs/common';
import { diskStorage } from 'multer';

const normalizeFileName = (req, file, callback) => {
  const fileExtName = file.originalname.split('.').pop();
  callback(null, `${req.user.id}.${fileExtName}`);
};

export const avatarDestination = './uploads/avatars';
export const userStorage = diskStorage({
  destination: avatarDestination,
  filename: normalizeFileName,
});

export const imageFileFilter = (req, file, callback) => {
  if (!/^image/.test(file.mimetype)) {
    return callback(new ForbiddenException('Не вірний формат файлу'), false);
  }
  callback(null, true);
};
