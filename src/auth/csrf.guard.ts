import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    const csrfToken =
      (request.headers['x-csrf-token'] as string) ||
      (request.body as any)?._csrf;
    const jwtToken = request.headers.authorization?.replace('Bearer ', '');

    if (!csrfToken || !jwtToken) {
      throw new ForbiddenException('CSRF token or JWT token missing');
    }

    // For JWT-based CSRF protection, we can validate that the CSRF token
    // matches a hash of the JWT token
    const expectedCsrfToken = crypto
      .createHash('sha256')
      .update(jwtToken)
      .digest('hex')
      .substring(0, 32);

    // Use timing-safe comparison to prevent timing attacks
    if (
      !crypto.timingSafeEqual(
        Buffer.from(csrfToken, 'hex'),
        Buffer.from(expectedCsrfToken, 'hex'),
      )
    ) {
      throw new ForbiddenException('CSRF token invalid');
    }

    return true;
  }

  static generateToken(jwtToken: string): string {
    return crypto
      .createHash('sha256')
      .update(jwtToken)
      .digest('hex')
      .substring(0, 32);
  }
}
