import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UploadsController {
  constructor(private readonly config: ConfigService) {}

  @Post('event-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_, __, callback) => {
          const uploadDir = process.env.UPLOAD_DIR ?? 'uploads';
          mkdirSync(uploadDir, { recursive: true });
          callback(null, uploadDir);
        },
        filename: (_, file, callback) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `event-${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_, file, callback) => {
        callback(null, file.mimetype.startsWith('image/'));
      },
    }),
  )
  uploadEventImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Please upload a valid image file');
    }

    const baseUrl =
      this.config.get<string>('BACKEND_PUBLIC_URL') ?? `http://localhost:${this.config.get<number>('PORT') ?? 4000}`;
    return { url: `${baseUrl}/uploads/${file.filename}` };
  }
}
