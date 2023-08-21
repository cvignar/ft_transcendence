import { PrismaService } from './prisma.service';
import { Channel, Prisma } from '@prisma/client';
export declare class ChannelService {
    private prisma;
    constructor(prisma: PrismaService);
    channel(channelWhereUniqueInput: Prisma.ChannelWhereUniqueInput): Promise<Channel | null>;
    channels(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.ChannelWhereUniqueInput;
        where?: Prisma.ChannelWhereInput;
        orderBy?: Prisma.ChannelOrderByWithRelationInput;
    }): Promise<Channel[]>;
    createChannel(data: Prisma.ChannelCreateInput): Promise<Channel>;
    updateChannel(params: {
        where: Prisma.ChannelWhereUniqueInput;
        data: Prisma.ChannelUpdateInput;
    }): Promise<Channel>;
    deleteChannel(where: Prisma.ChannelWhereUniqueInput): Promise<Channel>;
}
