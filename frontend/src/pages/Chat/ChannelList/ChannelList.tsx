import { ChannelListProps } from './ChannelList.props';
import ChannelPreview from '../../../components/ChannelPreview/ChannelPreview';
import CardButton from '../../../components/CardButton/CardButton';
import styles from './ChannelList.module.css';
import classNames from 'classnames';
import Headling from '../../../components/Headling/Headling';
import Search from '../../../components/Search/Search';
import { Navigate, NavLink } from 'react-router-dom';
import CardNavLink from '../../../components/CardNavLink/CardNavLink';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { channelActions } from '../../../store/channels.slice';
export function ChannelList({ channels, setChannel, isActive, setActive }: ChannelListProps) {
	const dispatch = useDispatch<AppDispatch>();

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
				<CardNavLink
					to={`/Chat/channel/${c.id}`}
					className={classNames(styles['preview-button'])}
					key={c.id}
					onClick={() => {
						setChannel(c);
						setActive(c.id);
						dispatch(channelActions.getChannel(c.id));
						dispatch(channelActions.getMessages(c.id));
					}}>
					<ChannelPreview
						data={c}
					/>
				</CardNavLink>
			))}
		</div>
	);
}