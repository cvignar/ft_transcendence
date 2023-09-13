import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  //   Put,
  //   Delete,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Channel as ChannelModel } from '@prisma/client';
import { CreateChannel } from 'contracts/channel.schema';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('show')
  async getChannelById() {
    return this.channelService.showChannels();
  }

  @Post('create')
  async createChannel(@Body() channelData: CreateChannel.Request) {
    return await this.channelService.createChannel(channelData);
  }

  //   @Post('channel/create')
  //   async createChannel(
  //     @Body()
  //     channelData: {
  //       name: string;
  //       owner: string;
  //     },
  //   ): Promise<ChannelModel> {
  //     const { name, owner } = channelData;
  //     return this.channelService.createChannel({
  //       name,
  //       owner,
  //     });
  //   }
}
