import { ChannelListProps } from './ChannelList.props';
import ChannelPreview from '../../../components/ChannelPreview/ChannelPreview';
import CardButton from '../../../components/CardButton/CardButton';
import styles from './ChannelList.module.css';
export function ChannelList({ channels, setChannel }: ChannelListProps) {
	return (
		<div className={styles['list']} >
			{channels?.map(c => (
				<CardButton key={c.id} className={styles['preview-button']} onClick={() => setChannel(c)}>
					<ChannelPreview
						data={c}
					/>
				</CardButton>
			))}
		</div>
	);
}