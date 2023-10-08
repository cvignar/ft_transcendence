import {
	Body,
	Controller,
	FileTypeValidator,
	Get,
	MaxFileSizeValidator,
	Param,
	ParseFilePipe,
	ParseIntPipe,
	Post,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { UserService } from './user.service';
import { CreateUser } from '../../../contracts/user.schema--';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'
import * as fs from 'fs'
import * as path from 'path'

@Controller('user')
// @UseGuards(JwtAuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}
	@UsePipes(ZodValidationPipe)
	//@ApiTags('user')
	@Post('create')
	//@ApiOperation({ summary: 'Create user' })
	async createUser(
		@Body()
		userData: CreateUser.Request,
	): Promise<User> {
		return this.userService.createUser(userData);
	}

	@Get('getProfile/:id')
	async getProfile(@Param('id', ParseIntPipe) id: number) {
		return await this.userService.getProfile(id);
	}

	@Post('updateProfile/:id')
	async updateProfile(
		@Param('id', ParseIntPipe) userId: number,
		@Body() userData: any,
	) {
		return await this.userService.updateUser(userId, userData);
	}

	@Post('uploadAvatar/:id')
	@UseInterceptors(FileInterceptor('avatar', {storage: diskStorage({destination: 'public/uploads', filename: (req, file, cb) => {cb(null, file.originalname);}})}))
	async updateAvatar(
		@Param('id', ParseIntPipe) user_id: number,
		@Req() req,
		@Res({passthrough: true}) res,
		@Body() userdata: any,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new FileTypeValidator({ fileType: '.(png)'}), //'.(png|jpeg|jpg)' -> when all 3 should be supported
					// new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4}),	// should be enabled in productive system
				],
			})
		) file: Express.Multer.File,
	)
	{
		// const fs = require('fs');
		// const path = require('path');

		const file_extension = path.extname(file.originalname);
		const public_path = '/user/avatars/';
		const url_path = 'public/uploads/'
		const old_path:string = url_path + file.originalname;
		const new_name:string = user_id + file_extension;
		const new_path:string = url_path + new_name;
		// console.log(`old_path: ${old_path}`);
		// console.log(`new_path: ${new_path}`);
		
		try {
			// const jpeg = url_path + user_id + ".jpeg";
			// const jpg = url_path + user_id + ".jpg";
			const png = url_path + user_id + ".png";
			// fs.unlink(jpeg, (err) => {if (err) {/*console.error(err);*/}});
			// fs.unlink(jpg, (err) => {if (err) {/*console.error(err);*/}});
			fs.unlink(png, (err) => {if (err) {/*console.error(err);*/}});
			// 
		}
		catch {

		}

		fs.rename(old_path, new_path, (err) => {
			if (err)
				console.error(err);
		});
		file.filename = new_name;
		file.path = new_path;

		// console.log(user_id);
		// console.log(file);
		return {
			path: public_path + new_name,
		}
	}

	/**
	 * Return images from upload folder -> used for avatar images
	 * @param img_name 
	 * @param req 
	 * @param res 
	 * @returns 
	 */
	@Get('/avatars/:imgName')
	async getAvatar(@Param('imgName') img_name, @Req() req,@Res() res) {
		const imgPath = null;
		// console.log(`get ImagesFile: ${img_name}`);
		return res.sendFile(img_name, {root: 'public/uploads/'})
	}

	@Get('enable2fa')
	async enable2fa (@Req() req: Request) {
		if (req.cookies && req.cookies.userId)
			return await this.userService.enable2fa(req.cookies.userId);
	}

	@Get('disable2fa')
	async disable2fa (@Req() req: Request) {
		if (req.cookies && req.cookies.userId)
			return await this.userService.disable2fa(req.cookies.userId);
	}
}
