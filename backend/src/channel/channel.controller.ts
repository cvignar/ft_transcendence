import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
	ParseIntPipe,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Channel as ChannelModel } from '@prisma/client';
import { CreateChannel } from 'contracts/channel.schema';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs'
import * as path from 'path'

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

	@Post('uploadAvatar/:id')
	@UseInterceptors(FileInterceptor('avatar'))
	async updateAvatar(
		@Param('id', ParseIntPipe) channel_id: number,
		@Req() req: Request,
		@Res() res: Response,
		@Body() userdata: any,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new FileTypeValidator({ fileType: '.(png|jpeg|jpg)'}), //'.(png|jpeg|jpg)' -> when all 3 should be supported
					new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4}),	// should be enabled in productive system
				],
			})
		) file: Express.Multer.File,
	)
	{
		try {
			const extension = path.extname(file.originalname);
			const new_name = channel_id + extension;
			const url_path = '/channel/avatars/';
			const server_path = '/upload/channel/'
			if (!fs.existsSync(server_path))
				fs.mkdirSync(server_path)
			fs.writeFile(server_path + new_name, file.buffer, err => {
			});
			const avatar_url = `https://${process.env.VITE_BACK_HOST}:${process.env.BACK_PORT}${url_path}${new_name}`;
			this.channelService.updateAvatar(channel_id, avatar_url);
			return url_path + new_name;
		} catch (e) {
			return;
		}
	}

  @Get('/avatars/:imgName')
	async getAvatar(@Param('imgName') img_name, @Req() req, @Res() res) {
		try {
			const imgPath = null;
			// console.log(`get ImagesFile: ${img_name}`);
			return res.sendFile(img_name, {root: '/upload/channel'})
		} catch (e) {
			return;
		}
	}
}
