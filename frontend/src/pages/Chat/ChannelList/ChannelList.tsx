import { ChannelListProps } from './ChannelList.props';
import ChannelPreview from '../../../components/ChannelPreview/ChannelPreview';
import CardButton from '../../../components/CardButton/CardButton';
import styles from './ChannelList.module.css';
import classNames from 'classnames';
import Headling from '../../../components/Headling/Headling';
import Search from '../../../components/Search/Search';
export function ChannelList({ channels, setChannel, isActive, setActive }: ChannelListProps) {
	return (
		<div className={styles['list']} >
			<div className={styles['control-row']}>
				<Headling>Channels</Headling>
				<div className={styles['search']}>
					<Search className={styles['search']} placeholder='Search'></Search>
				</div>
				<div className={styles['btn']}>
					<button className={styles['add-channel']}>
						<img className={styles['svg']} src='/increase.svg' alt='add channel'/>
					</button>
				</div>
			</div>
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