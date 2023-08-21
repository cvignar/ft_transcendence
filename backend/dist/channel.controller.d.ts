import { ChannelService } from './channel.service';
import { Channel as ChannelModel } from '@prisma/client';
export declare class ChannelController {
    private readonly channelService;
    constructor(channelService: ChannelService);
    getChannelById(id: string): Promise<ChannelModel>;
    createChannel(channelData: {
        name: string;
        owner: string;
    }): Promise<ChannelModel>;
}
