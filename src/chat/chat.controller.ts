/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/messages')
  async getMessages(
    @Req() req,
    @Query('userId') userId: string, // the other user
  ) {
    const currentUserId = req.user.id; // from JWT
    console.log(currentUserId);
    const messages = await this.chatService.getMessages(currentUserId, userId);
    console.log(messages);
    return messages;
  }
}
