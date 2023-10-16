import styles from './Leaderboard.module.css';
import layoutStyles from '../Layout/Layout.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { Root } from 'react-dom/client';
import { AppDispatch, RootState } from '../../store/store';
import { useEffect, useState } from 'react';
import { userActions } from '../../store/user.slice';
import Headling from '../../components/Headling/Headling';
import { LeaderboardItem } from './LeaderboardItem/LeaderboardItem';
import { Outlet, useNavigate } from 'react-router-dom';
import CardNavLink from '../../components/CardNavLink/CardNavLink';
import { ChannelShortInfo } from '../../components/ChannelShortInfo/ChannelShortInfo';
import classNames from 'classnames';
import Button from '../../components/Button/Button';
import { socket } from '../Pong/pong';
import { Status } from '../../helpers/enums';

export function Leaderboard() {
	const user = useSelector((s: RootState) => s.user);
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const [matchError, setMatchError] = useState<string>('');
	useEffect(() => {
		if (user.leaderboard.length === 0) {
			dispatch(userActions.getLeaderboard());
		}
	}, [user.statuses]);

	const getStatus = (statuses: any, userId: number) => {
		for (const status of statuses) {
			if (userId && Number(status[0]) === Number(userId))
				return status[1];
		}
		return '';
	};

	const autoMatch = () => {
		if (user.profile && user.leaderboard.length > 1 && user.statuses) {
			const filter = user.leaderboard.filter((e) => (user.profile.id != e.id && getStatus(user.statuses, e.id) === Status.online));
			const map = new Map<number, any>();
			if (filter.length > 0) {
				if (filter.length === 1) {
					socket.emit('invite partner', Number(filter[0].id));
					navigate(`/Leaderboard/user/${filter[0].id}`);

				}
				filter.forEach((value, index) => {map.set(index, value);});
				const partner = map.get(Math.round(Math.random() * map.size));
				if (partner) {
					socket.emit('invite partner', Number(partner.id));
					navigate(`/Leaderboard/user/${partner.id}`);
				} else {
					setMatchError('No partners available, try later');
				}
			}
		}
	};

	useEffect(() => {
		if (matchError != '') {
			setTimeout(() => {
				setMatchError('');
			}, 5000);
		}
	}, [matchError]);

	return (
		<>
			<div className={styles['leaderboard']}>
				<div className={styles['header']}>
					<Headling>Leaderboard</Headling>
					<Button className={styles['btn-dark']} onClick={autoMatch}>Automatch</Button>
				</div>
				{user.leaderboard && user.leaderboard.length > 0
					? user.leaderboard.map((usr) => (
						<CardNavLink
							to={user.profile && user.profile.id === usr.id ? '/Settings/Stats' : `/Leaderboard/user/${usr.id}`}
							key={usr.id}
							className={classNames(styles[''])}
						>
							<LeaderboardItem data={usr}/>
						</CardNavLink>
					))
					: <></>}
			</div>
			<div className={styles['other']}>
				<Outlet/>
			</div>
		</>

	);
}