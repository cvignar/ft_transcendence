"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const user_service_1 = require("./user.service");
const channel_service_1 = require("./channel.service");
const prisma_service_1 = require("./prisma.service");
const user_controller_1 = require("./user.controller");
const channel_controller_1 = require("./channel.controller");
let AppModule = exports.AppModule = class AppModule {
};
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: ['.env', '../.env'],
            }),
        ],
        controllers: [app_controller_1.AppController, user_controller_1.UserController, channel_controller_1.ChannelController],
        providers: [app_service_1.AppService, prisma_service_1.PrismaService, user_service_1.UserService, channel_service_1.ChannelService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map