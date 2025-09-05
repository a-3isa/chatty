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
    const accessToken: string = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
    const refreshToken: string = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  async login(
    userDto: UserAuthDto,
  ): Promise<{ userId: string; accessToken: string; refreshToken: string }> {
    const { username, password } = userDto;

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockoutExpiry && user.lockoutExpiry > new Date()) {
      throw new UnauthorizedException(
        'Account is temporarily locked due to too many failed login attempts',
      );
    }

    if (await bcrypt.compare(password, user.password)) {
      // Reset failed attempts on successful login
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockoutExpiry: null,
        },
      });

      const payload = { username };
      const accessToken: string = this.jwtService.sign(payload, {
        expiresIn: '15m',
      });
      const refreshToken: string = this.jwtService.sign(payload, {
        expiresIn: '7d',
      });
      return { userId: user.id, accessToken, refreshToken };
    } else {
      // Increment failed attempts
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const lockoutThreshold = 5; // Lock after 5 failed attempts
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes

      if (newFailedAttempts >= lockoutThreshold) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: newFailedAttempts,
            lockoutExpiry: new Date(Date.now() + lockoutDuration),
          },
        });
        throw new UnauthorizedException(
          'Account locked due to too many failed login attempts',
        );
      } else {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: newFailedAttempts },
        });
        throw new UnauthorizedException('Invalid credentials');
      }
    }
  }

  refreshToken(refreshToken: string): { accessToken: string } {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const newAccessToken = this.jwtService.sign(
        { username: payload.username },
        { expiresIn: '15m' },
      );
      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async requestPasswordReset(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!user) throw new UnauthorizedException('User not found');

    const token = this.jwtService.sign(
      { username: user.username },
      { expiresIn: '15m' },
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const url = `http://localhost:3000/auth/reset-password?token=${token}`;
    // In a real application, you would send this URL via email
    console.log(`Password reset URL: ${url}`);

    return { message: 'Password reset link sent to your email' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      const username = payload.username;
      const user = await this.prisma.user.findFirst({
        where: {
          username,
          resetToken: token,
        },
      });

      if (
        !user ||
        !user.resetTokenExpiry ||
        user.resetTokenExpiry < new Date()
      ) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return { message: 'Password reset successfully' };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async unlockAccount(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockoutExpiry: null,
      },
    });

    return { message: 'Account unlocked successfully' };
  }
}
