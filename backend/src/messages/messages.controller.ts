import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Post,
  Body,
} from '@nestjs/common';
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
      parseInt(contactId),
    );
  }

  @Post('read/:contactId')
  async markAsRead(@Request() req, @Param('contactId') contactId: string) {
    // The current user (req.user.id) is the receiver.
    // The contactId is the sender.
    await this.messagesService.markAsRead(parseInt(contactId), req.user.id);
    return { success: true };
  }
}
