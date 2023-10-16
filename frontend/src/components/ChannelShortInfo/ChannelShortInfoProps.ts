import { ChannelPreview } from '../../interfaces/channel.interface';

export interface ChannelShortInfoProps {
appearence: 'list' | 'chat' | 'member';
props: ChannelPreview | any;
}