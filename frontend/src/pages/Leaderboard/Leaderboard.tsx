import styles from './Leaderboard.module.css';
import layoutStyles from '../Layout/Layout.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { Root } from 'react-dom/client';
import { AppDispatch, RootState } from '../../store/store';
import { useEffect } from 'react';
import { userActions } from '../../store/user.slice';
import Headling from '../../components/Headling/Headling';
import { LeaderboardItem } from './LeaderboardItem/LeaderboardItem';
import { Outlet } from 'react-router-dom';
import CardNavLink from '../../components/CardNavLink/CardNavLink';
import { ChannelShortInfo } from '../../components/ChannelShortInfo/ChannelShortInfo';
import classNames from 'classnames';
import Button from '../../components/Button/Button';
import { socket } from '../Pong/pong';

export function Leaderboard() {
	const user = useSelector((s: RootState) => s.user);
	const dispatch = useDispatch<AppDispatch>();
	useEffect(() => {
		if (user.leaderboard.length === 0) {
			dispatch(userActions.getLeaderboard());
		}
	}, [user.statuses]);

	const autoMatch = () => {
		// if (user.profile && user.leaderboard.length > 0) {
		// 	for (const usr of user.leaderboard) {
		// 		if (Math.abs(usr.rank - user.profile.rank) === 1) {
		// 			socket.emit
		// 		}
		// 	}
		// }
	}

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