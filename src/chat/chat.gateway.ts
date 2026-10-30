/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*', // allow all origins (not safe for production)
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}
  @WebSocketServer() server;

  afterInit() {
    console.log('WebSocket Initialized');
  }

  handleConnection(client: Socket) {
    // Handlers wait for this, so a 'join' sent right after connecting is not
    // dropped while the user is looked up.
    client.data.ready = this.authenticate(client);
  }

  private async authenticate(client: Socket): Promise<void> {
    try {
      const token =
        client.handshake.auth.token || // from auth object
        client.handshake.headers['authorization']; // from headers

      // console.log(token);
      if (!token) {
        client.disconnect();
        return;
      }

      // remove "Bearer " if header style
      const cleaned = token.startsWith('Bearer ') ? token.slice(7) : token;
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        console.log('JWT secret not configured');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(cleaned, { secret: jwtSecret }); // use env secret
      // Only access tokens may open a socket, and the user must still exist.
      if (payload.typ !== 'access') {
        client.disconnect();
        return;
      }
      const user = await this.prisma.user.findUnique({
        where: { username: payload.username },
        select: { id: true, username: true },
      });
      if (!user) {
        client.disconnect();
        return;
      }
      client.data.user = user; // { id, username } of the signed-in user
      console.log(`Client connected: username=${payload.username}`);
    } catch (err) {
      console.log(err);
      console.log('Unauthorized client disconnected');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: { senderId: string; receiverId: string; content: string },
    // @GetUser() user: User,
  ) {
    // console.log(payload);
    await client.data.ready;
    if (!client.data.user) return;
    // The sender is whoever owns this socket, never what the client claims.
    const message = await this.chatService.createMessage({
      senderId: client.data.user.id,
      receiverId: payload.receiverId,
      content: payload.content,
    });
    // console.log(message);
    this.server.to(String(payload.receiverId)).emit('receiveMessage', message);
    return message;
  }

  @SubscribeMessage('join')
  async handleJoin(client: Socket, userId: number) {
    await client.data.ready;
    // A user may only join their own room; other rooms carry other people's messages.
    if (String(userId) !== String(client.data.user?.id)) {
      return;
    }
    await client.join(String(userId));
    console.log(`User ${userId} joined room`);
  }

  // @SubscribeMessage('createChat')
  // create(@MessageBody() createChatDto: CreateChatDto) {
  //   return this.chatService.create(createChatDto);
  // }

  // @SubscribeMessage('findAllChat')
  // findAll() {
  //   return this.chatService.findAll();
  // }

  // @SubscribeMessage('findOneChat')
  // findOne(@MessageBody() id: number) {
  //   return this.chatService.findOne(id);
  // }

  // @SubscribeMessage('updateChat')
  // update(@MessageBody() updateChatDto: UpdateChatDto) {
  //   return this.chatService.update(updateChatDto.id, updateChatDto);
  // }

  // @SubscribeMessage('removeChat')
  // remove(@MessageBody() id: number) {
  //   return this.chatService.remove(id);
  // }
}
