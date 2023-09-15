import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
//import { WsException } from '@nestjs/websockets';
import {
  UpdateChannel,
  CreateChannel,
  //CreateDirectMessagesChannel,
  //CreateProtectedChannel,
  typeEnum,
  CreateDirectChannel,
} from '../../../contracts/channel.schema';
import { Channel } from '@prisma/client';
//import { ExceptionWithMessage } from '@prisma/client/runtime/library';

@Injectable()
export class ChannelService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async showChannels() {
    const channels = await this.prisma.channel.findMany();
    //let count = 0;
    //for (const [index, channel] of channels.entries()) {
    //  console.log(`channel ${index}: ${channel.name}`);
    //  count = index + 1;
    //}
    //console.log(`total ${count} channels`);
    return channels;
  }

  async getChannelsByUserId(userId: number) {
    const channels = [];
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        owner: true,
        admin: true,
        member: true,
        invited: true,
      },
    });
    if (user) {
      if (user.owner) {
        for (let i = 0; i < user.owner.length; i++) {
          channels.push(user.owner[i].name);
        }
      }
      if (user.admin) {
        for (let i = 0; i < user.admin.length; i++) {
          channels.push(user.admin[i].name);
        }
      }
      if (user.member) {
        for (let i = 0; i < user.member.length; i++) {
          channels.push(user.member[i].name);
        }
      }
      if (user.invited) {
        for (let i = 0; i < user.invited.length; i++) {
          channels.push(user.invited[i].name);
        }
      }
    }
    return channels;
  }

  async getChannelNameById(channelId: number) {
    try {
      const channel = await this.prisma.channel.findUnique({
        where: {
          id: channelId,
        },
        select: {
          name: true,
        },
      });
      return channel.name;
    } catch (error) {
      console.error('getChannelNameById error:', error);
      // throw new WsException(error.message);
    }
  }

  async getChannelById(channelId: number) {
    try {
      const channel = await this.prisma.channel.findUniqueOrThrow({
        where: { id: channelId },
        select: {
          id: true,
          type: true,
          name: true,
          password: true,
          picture: true,
          owners: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
            select: { msg: true },
            take: 1,
          },
        },
      });
      return channel;
    } catch (error) {
      console.error('getChannelByChannelId error: ', error);
      // throw new WsException(error.message);
    }
  }

  async createDirectChannel() {
    //(target: CreateDirectChannel.Request)
    //try {
    //  const ids: number[] = [];
    //  const id = await this.userService.getIdByEmail(target.email);
    //  ids.push(id, target.id);
    //  const channel = await this.prisma.channel.create({
    //    data: {
    //      type: typeEnum.DIRECT,
    //      owners: { connect: ids.map((id) => ({ id: id })) },
    //    },
    //  });
    //  return channel.id;
    //} catch (error) {
    //  console.log(`createDirectChannel error: ${error}`);
    //  // throw new WsException(error.message);
    //}
  }

  async createChannel(channelData: CreateChannel.Request) {
    try {
      const password = undefined;
      //if (channelData.type == typeEnum.PROTECTED) {
      //  password = channelData.password;
      //}
      const channel = await this.prisma.channel.create({
        data: {
          name: channelData.name,
          type: channelData.type,
          password: password,
          owners: { connect: { email: channelData.email } },
          admins: { connect: { email: channelData.email } },
          //members: {
          //  connect: channelData.members.map((member) => ({ id: member.id })),
          //},
        },
      });
      return channel;
    } catch (error) {
      console.error(`createChannel error: ${error}`);
      // throw new WsException(error.message);
    }
  }

  async inviteUser(channelData: UpdateChannel.Request) {
    try {
      const channel = await this.prisma.channel.update({
        where: { id: channelData.channelId },
        data: {
          inviteds: { connect: { id: channelData.memberId } },
        },
      });
      return channel.id;
    } catch (error) {
      console.error(`inviteUser error; ${error}`);
      // throw new WsException(error.message);
    }
  }

  async addMember(channelData: UpdateChannel.Request) {
    try {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelData.channelId },
        select: { password: true },
      });
      if (channel.password === channelData.newPassword) {
        const newChannel = await this.prisma.channel.update({
          where: { id: channelData.channelId },
          data: {
            members: { connect: { email: channelData.email } },
            inviteds: { disconnect: { email: channelData.email } },
          },
        });
        return newChannel.id;
      }
    } catch (error) {
      console.error(`addMember error: ${error}`);
      // throw new WsException(error.message);
    }
  }

  async disconnectMember() {
    //(channelData: UpdateChannel.Request)
    //try {
    //  const memberId =
    //    channelData.memberId == -1
    //      ? await this.userService.getIdByEmail(channelData.email)
    //      : channelData.memberId;
    //  await this.prisma.channel.update({
    //    where: { id: channelData.channelId },
    //    data: {
    //      owners: { disconnect: { id: memberId } },
    //      admins: { disconnect: { id: memberId } },
    //      members: { disconnect: { id: memberId } },
    //      inviteds: { disconnect: { id: memberId } },
    //    },
    //  });
    //  const channel = await this.getChannelById(channelData.channelId);
    //  if (channel.owners.length === 0) {
    //    await this.prisma.message.deleteMany({
    //      where: { channelId: channelData.channelId },
    //    });
    //    /* update user! */
    //    const deletedChannel = await this.prisma.channel.delete({
    //      where: { id: channelData.channelId },
    //    });
    //    return deletedChannel;
    //  }
    //} catch (error) {
    //  console.error(`disconnectMember error: ${error}`);
    //  // throw new WsException(error.message);
    //}
  }

  async inviteMember(channelData: UpdateChannel.Request) {
    try {
      const channel = await this.prisma.channel.update({
        where: { id: channelData.channelId },
        data: { inviteds: { connect: { id: channelData.memberId } } },
      });
      return channel.id;
    } catch (error) {
      console.log(`inviteMember error: ${error}`);
      // throw new WsException(error.message)
    }
  }

  async getDirectChannelTarget(channelData: UpdateChannel.Request) {
    try {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelData.channelId },
        select: {
          owners: {
            where: {
              NOT: { email: channelData.email },
            },
            select: { id: true },
          },
        },
      });
      return channel.owners[0].id;
    } catch (error) {
      console.log(`inviteMember error: ${error}`);
      // throw new WsException(error.message)
    }
  }

  async getMessages(channelId: number) {
    try {
      const messages = await this.prisma.channel.findUnique({
        where: { id: channelId },
        select: {
          messages: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              msg: true,
              createdAt: true,
              owner: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                },
              },
            },
          },
        },
      });
      return messages;
    } catch (error) {
      console.log(`inviteMember error: ${error}`);
      // throw new WsException(error.message)
    }
  }

  // async createNewMessage(messageData: )
}
