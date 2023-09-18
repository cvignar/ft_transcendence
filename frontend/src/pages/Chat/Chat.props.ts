//export enum channelTypeEnum {
//	PRIVATE = 'private',
//	PROTECTED = 'protected',
//	DIRECT = 'direct',
//	PUBLIC = 'public'
//}

export interface ChannelProps {
  id: number
  name: string
  picture?: string 
  createdAt: string
  updatedAt: string
  type: string
  password?: string
}
