/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
// import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async register(createUserDto: UserAuthDto) {
    const { username, password } = createUserDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    const payload = { username };
    const accessToken: string = this.jwtService.sign(payload);
    return { accessToken };
  }

  async login(
    userDto: UserAuthDto,
  ): Promise<{ userId: number; accessToken: string }> {
    const { username, password } = userDto;

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      // console.log(password, user.password);
      const payload = { username };
      const accessToken: string = this.jwtService.sign(payload);
      return { userId: user.id, accessToken };
    }
    throw new UnauthorizedException();
  }

  // async requestPasswordReset(email: string) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { username },
  //   });
  //   if (!user) throw new NotFoundException('User not found');

  //   const token = this.jwtService.sign(
  //     { username: user.username },
  //     { secret: process.env.JWT_SECRET, expiresIn: '15m' },
  //   );
  //   user.resetToken = token;
  //   user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
  //   await this.prisma.user.save(user);
  //   const url = `http://localhost:3000/auth/reset-password?token=${token}`;

  //   return { message: 'Password reset link sent to your email' };
  // }

  // async resetPassword(token: string, newPassword: string) {
  //   try {
  //     const payload = this.jwtService.verify(token, {
  //       secret: process.env.JWT_SECRET,
  //     });
  //     const email = payload.email;
  //     const user = await this.prisma.user.findUnique({
  //       where: { email, resetToken: token },
  //     });

  //     if (
  //       !user ||
  //       !user.resetTokenExpiry ||
  //       user.resetTokenExpiry < new Date()
  //     ) {
  //       throw new UnauthorizedException('Invalid or expired token');
  //     }
  //     console.log(user.password);
  //     console.log(newPassword);
  //     user.password = await bcrypt.hash(newPassword, 10);
  //     console.log(user.password);
  //     user.resetToken = null;
  //     user.resetTokenExpiry = null;
  //     const suc = await this.prisma.user.save(user);
  //     console.log(suc);

  //     return { message: 'Password reset successfully' };
  //   } catch (err) {
  //     throw new UnauthorizedException(err);
  //   }
  // }
}
