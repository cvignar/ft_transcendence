import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { channelActions } from '../../store/channels.slice';
import { AppDispatch, RootState } from '../../store/store';
import { logoutAPI, userActions } from '../../store/user.slice';
import { Pong } from '../Pong/pong';
import styles from './Layout.module.css';
import { getCookie, removeCookie } from 'typescript-cookie';
import { useEffect } from 'react';

export function Layout() {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const error = useSelector((s: RootState) => s.channel.error);

	const logout = () => {
		dispatch(logoutAPI(Number(getCookie('userId'))));
		dispatch(channelActions.logout());
		dispatch(userActions.logout());
		removeCookie('accessToken');
		removeCookie('userId');
		window.location.reload();
	};

	useEffect(() => {
		const token = getCookie('accessToken');
		if (token) {
			dispatch(channelActions.startConnecting());
		}
	}, [dispatch]);

	useEffect(() => {
		if (error) {
			const timerId = setTimeout(() => {
				dispatch(channelActions.clearError());
			}, 1500);
			return () => clearTimeout(timerId);
		}
	}, error);

	return <div className={styles['layout']}>
		<div className={styles['sidebar']}>
			<NavLink to='/Chat' className={({isActive}) => classNames(styles['link'], {
				[styles['active']]: isActive
			})}>
				<img src='/chat.svg' alt='chat' className={styles['svg']}/>
			</NavLink>

			<NavLink to='/Search' className={({isActive}) => classNames(styles['link'], {
				[styles['active']]: isActive
			})}>
				<img src='/search.svg' alt='search' className={styles['svg']}/>
			</NavLink>

			<NavLink to='/Leaderboard' className={({isActive}) => classNames(styles['link'], {
				[styles['active']]: isActive
			})} onClick={() => {
				dispatch(userActions.getLeaderboard());
			}}>
				<img src='/ladder.svg' alt='leaderboard' className={styles['svg']}/>
			</NavLink>

			<NavLink to='/Settings/Stats' className={({isActive}) => classNames(styles['link'], {
				[styles['active']]: isActive
			})}>
				<img src='/settings-fill.svg' alt='settings' className={styles['svg']}/>
			</NavLink>

			<NavLink to='/Info' className={({isActive}) => classNames(styles['link'], {
				[styles['active']]: isActive
			})}>
				<img src='/info.svg' alt='info' className={styles['svg']}/>
			</NavLink>

			<NavLink to='/' className={({isActive}) => classNames(styles['link'], {
				[styles['active']]: isActive
			})}>
				<img src='/logout.svg' alt='logout' className={styles['svg']} onClick={logout}/>
			</NavLink>
		</div>
		<div className={styles['content']}>
			<Pong/>
			<div className={styles['outlet']}>
				<Outlet/>
			</div>
		</div>
	</div>;
}