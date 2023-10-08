import { ChannelPreview } from '../../interfaces/channel.interface';

export interface ChannelShortInfoProps {
appearence: 'list' | 'chat';
props: ChannelPreview | any;
}