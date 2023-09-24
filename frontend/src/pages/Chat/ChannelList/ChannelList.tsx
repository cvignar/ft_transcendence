import { ChannelListProps } from './ChannelList.props';
import ChannelPreview from '../../../components/ChannelPreview/ChannelPreview';
import CardButton from '../../../components/CardButton/CardButton';
import styles from './ChannelList.module.css';
import classNames from 'classnames';
export function ChannelList({ channels, setChannel, isActive, setActive }: ChannelListProps) {
	return (
		<div className={styles['list']} >
			{channels?.map(c => (
				<CardButton key={c.id} className={classNames(styles['preview-button'],
					isActive === c.id ? 'active' : '')} onClick={() => { setChannel(c); setActive(c.id);}}>
					<ChannelPreview
						data={c}
					/>
				</CardButton>
			))}
		</div>
	);
}