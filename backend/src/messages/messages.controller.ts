import {
    BadRequestException,
    Controller,
    Get,
    Param,
    Post,
    Request,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('contacts')
  async getContacts(@Request() req) {
    return this.messagesService.getContacts(req.user.id, req.user.role);
  }

  @Get('history/:contactId')
  async getConversation(@Request() req, @Param('contactId') contactId: string) {
    return this.messagesService.getConversation(
      req.user.id,
      Number.parseInt(contactId),
    );
  }

  @Post('read/:contactId')
  async markAsRead(@Request() req, @Param('contactId') contactId: string) {
    await this.messagesService.markAsRead(Number.parseInt(contactId), req.user.id);
    return { success: true };
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      url: `/uploads/${file.filename}`,
      name: file.originalname,
      type: file.mimetype,
    };
  }
}
