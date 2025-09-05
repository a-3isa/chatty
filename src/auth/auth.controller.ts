import { Controller, Post, Body, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserAuthDto } from './dto/create-auth.dto';
// import { GetUser } from './get-user.decorator';
// import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  // @UseGuards(AuthGuard())
  register(@Body() createAuthDto: UserAuthDto) {
    return this.authService.register(createAuthDto);
  }

  // @Post('/verify-otp')
  // async verifyEmail(@Body('email') email: string, @Body('otp') otp: string) {
  //   return this.authService.verifyEmail(email, otp);
  // }
  @Post('/login')
  login(@Body() userAuthDto: UserAuthDto) {
    return this.authService.login(userAuthDto);
  }

  @Post('/refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
  @Post('forgot-password')
  async forgotPassword(@Body('username') username: string) {
    return this.authService.requestPasswordReset(username);
  }

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }

  @Post('unlock-account')
  async unlockAccount(@Body('username') username: string) {
    return this.authService.unlockAccount(username);
  }
}
