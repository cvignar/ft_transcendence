import { ChannelListProps } from './ChannelList.props';
import ChannelPreview from '../../../components/ChannelPreview/ChannelPreview';
import CardButton from '../../../components/CardButton/CardButton';
import styles from './ChannelList.module.css';
import classNames from 'classnames';
import Headling from '../../../components/Headling/Headling';
import Search from '../../../components/Search/Search';
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import CardNavLink from '../../../components/CardNavLink/CardNavLink';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { channelActions } from '../../../store/channels.slice';
import { FocusEvent } from 'react';

export function ChannelList({ channels, setChannel }: ChannelListProps) {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const channelState = useSelector((s: RootState) => s.channel);

	return (
		<div className={styles['list']} >
			<div className={styles['control-row']}>
				<Headling>Channels</Headling>
				<div className={styles['btn']}>
					<button className={styles['add-channel']} onClick={() => navigate('/Chat/createChannel')}>
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
						dispatch(channelActions.getSelectedChannel(c.id));
						dispatch(channelActions.getMessages(c.id));
					}}>
					<ChannelPreview
						data={c}
					/>
				</CardNavLink>
			))
			}
		</div>
	);
}