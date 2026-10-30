import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { JwtStrategy } from './auth/jwt.strategy';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { UsersService } from './users/users.service';
import { PrismaService } from './prisma.service';

const secret = 'test-secret';
const jwt = new JwtService({ secret });
const config = { get: () => secret } as unknown as ConfigService;

describe('JwtStrategy', () => {
  const prisma = {
    user: { findUnique: jest.fn().mockResolvedValue({ id: 'u1' }) },
  } as unknown as PrismaService;
  const strategy = new JwtStrategy(prisma, config);

  it.each(['refresh', 'reset', undefined])(
    'rejects a %s token',
    async (typ) => {
      await expect(
        strategy.validate({ username: 'alice', typ } as never),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    },
  );

  it('accepts an access token', async () => {
    await expect(
      strategy.validate({ username: 'alice', typ: 'access' }),
    ).resolves.toEqual({ id: 'u1' });
  });
});

describe('AuthService.refreshToken', () => {
  const auth = new AuthService({} as PrismaService, jwt);

  it('refuses an access token', () => {
    const access = jwt.sign({ username: 'alice', typ: 'access' });
    expect(() => auth.refreshToken(access)).toThrow(UnauthorizedException);
  });

  it('issues an access token from a refresh token', () => {
    const refresh = jwt.sign({ username: 'alice', typ: 'refresh' });
    const { accessToken } = auth.refreshToken(refresh);
    expect(jwt.verify<{ typ: string }>(accessToken).typ).toBe('access');
  });
});

describe('AuthController.unlockAccount', () => {
  it("refuses to unlock someone else's account", async () => {
    const unlock = jest.fn();
    const controller = new AuthController({
      unlockAccount: unlock,
    } as unknown as AuthService);

    await expect(
      controller.unlockAccount('victim', { username: 'attacker' } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(unlock).not.toHaveBeenCalled();
  });
});

describe('UsersService.findAll', () => {
  it('selects only public fields', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const users = new UsersService({
      user: { findMany },
    } as unknown as PrismaService);

    await users.findAll();
    expect(findMany).toHaveBeenCalledWith({
      select: { id: true, username: true },
    });
  });
});

describe('ChatGateway', () => {
  const me = { id: 'me', username: 'alice' };
  const socketFor = (user?: typeof me) =>
    ({
      data: { ready: Promise.resolve(), user },
      join: jest.fn(),
    }) as unknown as Socket & { join: jest.Mock };

  const build = () => {
    const createMessage = jest.fn().mockResolvedValue({ id: 'm1' });
    const gateway = new ChatGateway(
      { createMessage } as unknown as ChatService,
      config,
      jwt,
      {} as PrismaService,
    );
    gateway.server = { to: () => ({ emit: jest.fn() }) };
    return { gateway, createMessage };
  };

  it('sends as the socket user, whatever senderId the client claims', async () => {
    const { gateway, createMessage } = build();
    await gateway.handleMessage(socketFor(me), {
      senderId: 'someone-else',
      receiverId: 'bob',
      content: 'hi',
    });
    expect(createMessage).toHaveBeenCalledWith({
      senderId: 'me',
      receiverId: 'bob',
      content: 'hi',
    });
  });

  it('ignores messages from unauthenticated sockets', async () => {
    const { gateway, createMessage } = build();
    await gateway.handleMessage(socketFor(undefined), {
      senderId: 'x',
      receiverId: 'bob',
      content: 'hi',
    });
    expect(createMessage).not.toHaveBeenCalled();
  });

  it("joins only the user's own room", async () => {
    const { gateway } = build();
    const socket = socketFor(me);
    await gateway.handleJoin(socket, 'bob' as never);
    expect(socket.join).not.toHaveBeenCalled();
    await gateway.handleJoin(socket, 'me' as never);
    expect(socket.join).toHaveBeenCalledWith('me');
  });
});
