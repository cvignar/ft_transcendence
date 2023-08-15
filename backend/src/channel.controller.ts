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

@Controller()
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('channel/:id')
  async getChannelById(@Param('id') id: string): Promise<ChannelModel> {
    return this.channelService.channel({ id: Number(id) });
  }

  @Post('channel/create')
  async createChannel(
    @Body()
    channelData: {
      name: string;
      owner: string;
    },
  ): Promise<ChannelModel> {
    const { name, owner } = channelData;
    return this.channelService.createChannel({
      name,
      owner,
    });
  }
}
