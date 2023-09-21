import { ChannelPreview } from '../../../interfaces/channel.interface';

export interface ChannelListProps {
	channels: ChannelPreview[] | undefined;
	setChannel: (channel: ChannelPreview) => void;
}