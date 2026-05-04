import {
    BadRequestException,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Request,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagesService } from './messages.service';

@ApiTags('Messages')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('contacts')
  @ApiOperation({
    summary: 'Get chat contacts',
    description:
      'Returns the list of users the current user can message, ' +
      'with the count of unread messages per contact.',
  })
  @ApiOkResponse({ description: 'Array of contact objects with unread count' })
  async getContacts(@Request() req) {
    return this.messagesService.getContacts(req.user.id, req.user.role);
  }

  @Get('history/:contactId')
  @ApiOperation({
    summary: 'Get conversation history',
    description: 'Returns the full message history between the current user and a contact.',
  })
  @ApiParam({ name: 'contactId', type: Number, description: 'Contact user ID', example: 3 })
  @ApiOkResponse({ description: 'Array of message objects ordered by date ascending' })
  async getConversation(
    @Request() req,
    @Param('contactId', ParseIntPipe) contactId: number,
  ) {
    return this.messagesService.getConversation(req.user.id, contactId);
  }

  @Post('read/:contactId')
  @ApiOperation({
    summary: 'Mark messages as read',
    description: 'Marks all messages from a given contact as read for the current user.',
  })
  @ApiParam({ name: 'contactId', type: Number, description: 'Contact user ID', example: 3 })
  @ApiOkResponse({ description: '{ success: true }' })
  async markAsRead(
    @Request() req,
    @Param('contactId', ParseIntPipe) contactId: number,
  ) {
    await this.messagesService.markAsRead(contactId, req.user.id);
    return { success: true };
  }

  @Post('upload')
  @ApiOperation({
    summary: 'Upload a file attachment',
    description:
      'Upload an image or file to attach in chat. ' +
      'Returns the served URL for the uploaded file.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload (image, PDF, etc.)',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'Upload successful',
    schema: {
      example: {
        url: '/uploads/1746360000000-123456789-report.pdf',
        name: 'report.pdf',
        type: 'application/pdf',
      },
    },
  })
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
