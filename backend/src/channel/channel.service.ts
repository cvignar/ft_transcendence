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
  ChannelPreview,
} from '../../../contracts/channel.schema';
import { Channel } from '@prisma/client';
import { WsException } from '@nestjs/websockets';
import { channel } from 'diagnostics_channel';
import { MemberPreview, Status } from 'contracts/user.schema';
//import { ExceptionWithMessage } from '@prisma/client/runtime/library';

@Injectable()
export class ChannelService {
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
  ) {}

  async showChannels() {
    const channels = await this.prismaService.channel.findMany();
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
    const user = await this.prismaService.user.findUnique({
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
      const channel = await this.prismaService.channel.findUnique({
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
      const channel = await this.prismaService.channel.findUniqueOrThrow({
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
      const channel = await this.prismaService.channel.create({
        data: {
          name: channelData.name,
          type: channelData.type,
          password: channelData.password,
          owners: { connect: { email: channelData.email } },
          admins: { connect: { email: channelData.email } },
          members: {
            connect: channelData.members.map((member) => ({ id: member.id })),
          },
        },
      });
      return channel.id;
    } catch (error) {
      console.error(`createChannel error: ${error}`);
      throw new WsException(error);
    }
  }

  async inviteUser(channelData: UpdateChannel.Request) {
    try {
      const channel = await this.prismaService.channel.update({
        where: { id: channelData.channelId },
        data: {
          inviteds: { connect: { id: channelData.invitedId } },
        },
      });
      return channel.id;
    } catch (error) {
      console.error(`inviteUser error; ${error}`);
      // throw new WsException(error.message);
    }
  }

  async joinChannel(
    channelData: UpdateChannel.Request,
  ): Promise<number | undefined> {
    try {
      const channel = await this.prismaService.channel.findUnique({
        where: { id: channelData.channelId },
        select: { password: true },
      });
      if (channel.password === channelData.newPassword) {
        const updatedChannel = await this.prismaService.channel.update({
          where: { id: channelData.channelId },
          data: {
            members: { connect: { email: channelData.email } },
            inviteds: { disconnect: { email: channelData.email } },
          },
        });
        return updatedChannel.id;
      }
      return undefined;
    } catch (error) {
      console.error(`addMember error: ${error}`);
      throw new WsException(error);
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
      const channel = await this.prismaService.channel.update({
        where: { id: channelData.channelId },
        data: { inviteds: { connect: { id: channelData.invitedId } } },
      });
      return channel.id;
    } catch (error) {
      console.log(`inviteMember error: ${error}`);
      // throw new WsException(error.message)
    }
  }

  async getDirectChannelTarget(channelData: UpdateChannel.Request) {
    try {
      const channel = await this.prismaService.channel.findUnique({
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
      const messages = await this.prismaService.channel.findUnique({
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

  async getChannelsListById(email: string) {
    try {
      const channelsList = await this.prismaService.user.findUnique({
        where: { email: email },
        select: {
          owner: {
            where: { type: 'direct' },
            select: {
              id: true,
              type: true,
              name: true,
              password: true,
              updatedAt: true,
              owners: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                },
              },
              messages: {
                where: { unsent: false },
                orderBy: { createdAt: 'desc' },
                select: { msg: true },
                take: 1,
              },
            },
          },
          admin: {
            select: {
              id: true,
              type: true,
              name: true,
              password: true,
              updatedAt: true,
              owners: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                },
              },
              messages: {
                where: { unsent: false },
                orderBy: { createdAt: 'desc' },
                select: { msg: true },
                take: 1,
              },
            },
          },
          member: {
            select: {
              id: true,
              type: true,
              name: true,
              password: true,
              updatedAt: true,
              owners: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                },
              },
              messages: {
                where: { unsent: false },
                orderBy: { createdAt: 'desc' },
                select: { msg: true },
                take: 1,
              },
            },
          },
          invited: {
            select: {
              id: true,
              type: true,
              name: true,
              password: true,
              updatedAt: true,
              owners: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                },
              },
              messages: {
                where: { unsent: false },
                orderBy: { createdAt: 'desc' },
                select: { msg: true },
                take: 1,
              },
            },
          },
        },
      });
      return channelsList;
    } catch (e) {
      console.log(e.message);
      throw new WsException(e);
    }
  }

  async extractPreviews(channelsList: any, email: string) {
    const previews: ChannelPreview.Response[] = [];
    if (channelsList) {
      if (channelsList.owner) {
        for (let i = 0; i < channelsList.owner.length; i++) {
          let name = '';
          if (channelsList.owner[i].owners.length > 1) {
            name =
              channelsList.owner[i].owners[0].email === email
                ? channelsList.owner[i].owners[0].username
                : channelsList.owner[i].owners[1].username;
          }
          let ownerId = -1;
          if (channelsList.owner[i].owners.length > 1) {
            ownerId =
              channelsList.owner[i].owners[0].email === email
                ? channelsList.owner[i].owners[0].id
                : channelsList.owner[i].owners[1].id;
          }
          const messageCount = channelsList.owner[i].messages.length;
          const channelPreview: ChannelPreview.Response = {
            id: channelsList.owner[i].id,
            type: channelsList.owner[i].type,
            name: name,
            updatedAt: channelsList.owner[i].updatedAt,
            lastMessage:
              messageCount > 0 ? channelsList.owner[i].messages[0].msg : '',
            ownerEmail: channelsList.owner[i].owners[0].email,
            ownerId: ownerId,
          };
          previews.push(channelPreview);
        }
      }
      if (channelsList.admin) {
        for (let i = 0; i < channelsList.admin.length; i++) {
          const messageCount = channelsList.admin[i].messages.length;
          const channelPreview: ChannelPreview.Response = {
            id: channelsList.admin[i].id,
            type: channelsList.admin[i].type,
            name: channelsList.admin[i].name,
            updatedAt: channelsList.admin[i].updatedAt,
            lastMessage:
              messageCount > 0 ? channelsList.admin[i].messages[0].msg : '',
            ownerEmail: channelsList.admin[i].owner[0].email,
            ownerId: channelsList.admin[i].owner[0].id,
          };
          previews.push(channelPreview);
        }
      }
      if (channelsList.members) {
        for (let i = 0; i < channelsList.members.length; i++) {
          const messageCount = channelsList.members[i].messages.length;
          const channelPreview: ChannelPreview.Response = {
            id: channelsList.members[i].id,
            type: channelsList.members[i].type,
            name: channelsList.members[i].name,
            updatedAt: channelsList.members[i].updatedAt,
            lastMessage:
              messageCount > 0 ? channelsList.members[i].messages[0].msg : '',
            ownerEmail: channelsList.members[i].owner[0].email,
            ownerId: channelsList.members[i].owner[0].id,
          };
          previews.push(channelPreview);
        }
      }
      if (channelsList.invited) {
        for (let i = 0; i < channelsList.invited.length; i++) {
          const messageCount = channelsList.invited[i].messages.length;
          const channelPreview: ChannelPreview.Response = {
            id: channelsList.invited[i].id,
            type: channelsList.invited[i].type,
            name: channelsList.invited[i].name,
            updatedAt: channelsList.invited[i].updatedAt,
            lastMessage:
              channelsList.invited[i].type === 'protected'
                ? ''
                : messageCount > 0
                ? channelsList.invited[i].messages[0].msg
                : '',
            ownerEmail: channelsList.invited[i].ownerEmail,
            ownerId: channelsList.invited[i].ownerId,
          };
          previews.push(channelPreview);
        }
      }
    }
    return previews;
  }

  async getPreviews(email: string): Promise<ChannelPreview.Response[] | []> {
    try {
      const channelsList = this.getChannelsListById(email);
      const previews = this.extractPreviews(channelsList, email);
      return previews;
    } catch (e) {
      console.log(e.message);
    }
  }

  async extractPreview(
    channel: any,
    email: string,
  ): Promise<ChannelPreview.Response> {
    let messageCount = 0;
    if (channel.messages) {
      messageCount = channel.messages.length;
    }
    let name = '';
    if (channel.owners.length > 1) {
      name =
        channel.owners[0].email === email
          ? channel.owners[1].username
          : channel.owners[0].username;
    }
    let ownerId = -1;
    if (channel.owners.length > 1) {
      ownerId =
        channel.owners[0].email === email
          ? channel.owners[1].id
          : channel.owners[0].id;
    } else {
      ownerId = channel.owners[0].id;
    }
    const preview: ChannelPreview.Response = {
      id: channel.id,
      type: channel.type,
      name: channel.type === 'direct' ? name : channel.name,
      updatedAt: channel.updatedAt,
      lastMessage:
        channel.type === 'protected'
          ? ''
          : messageCount > 0
          ? channel.messages[0].msg
          : '',
      ownerEmail: channel.owners.length > 0 ? channel.owners[0].email : '',
      ownerId: ownerId,
    };
    return preview;
  }
  async getPreview(
    channelId: number,
    email: string,
  ): Promise<ChannelPreview.Response> {
    try {
      const channel = await this.getChannelById(channelId);
      const channelPreview = this.extractPreview(channel, email);
      return channelPreview;
    } catch (e) {
      console.log(e.message);
    }
  }

  async getMembers(userId: number, channelId: number) {
    try {
      const channel = await this.prismaService.channel.findUnique({
        where: { id: channelId },
        select: { members: true },
      });
      const members: MemberPreview.Response[] = [];
      if (channel && channel.members) {
        for (let i = 0; i < channel.members.length; i++) {
          const member: MemberPreview.Response = {
            id: channel.members[i].id,
            username: channel.members[i].username,
            email: channel.members[i].email,
            isFriend:
              userId != channel.members[i].id
                ? await this.userService.isFriend(userId, channel.members[i].id)
                : false,
          };
          members.push(member);
        }
      }
      return members;
    } catch (e) {
      console.log('get members error: ', e.message);
      throw new WsException(e);
    }
  }
}
