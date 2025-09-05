import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(data: {
    senderId: string;
    receiverId: string;
    content: string;
  }) {
    return this.prisma.message.create({
      data,
      include: { sender: true, receiver: true },
    });
  }

  async getMessages(senderId: string, receiverId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
