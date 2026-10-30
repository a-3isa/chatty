import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    // Only public fields: the rest (password hash, reset token, lockout state)
    // must never leave the server.
    const users = this.prisma.user.findMany({
      select: { id: true, username: true },
    });
    return users;
  }
}
