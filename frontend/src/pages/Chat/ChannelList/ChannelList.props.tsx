import { ChannelPreview } from '../../../interfaces/channel.interface';

export interface ChannelListProps {
	channels: ChannelPreview[];
	setChannel: (channel: ChannelPreview) => void;
}