import { ChannelPreview } from '../../../interfaces/channel.interface';

export interface SearchListProps {
	setChannel: (channel: ChannelPreview) => void;
	isActive: number | undefined;
	setActive: (key: number) => void;
}