import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { channelActions } from '../../store/channels.slice';
import { AppDispatch } from '../../store/store';
import { userActions } from '../../store/user.slice';
import { Pong } from '../Pong/pong';
import styles from './Layout.module.css';
import { getCookie, removeCookie } from 'typescript-cookie';
import { useEffect } from 'react';

export function Layout() {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	//const profile = useSelector((s: RootState) => s.user.profile);
	//const items = useSelector((s: RootState) => s.cart.items);

	//useEffect(() => {
	//	dispatch(getProfile());
	//}, [dispatch]);
	const logout = () => {
		dispatch(userActions.logout());
		dispatch(channelActions.logout());
		removeCookie('accessToken');
		window.location.reload();
		//navigate('/Auth');
	};

	useEffect(() => {
		const token = getCookie('accessToken');
		if (token) {
			dispatch(channelActions.startConnecting());
		}
	}, [dispatch]);

	return <div className={styles['layout']}>
		<div className={styles['sidebar']}>
			{/*<div className={styles['user']}>
				<img className={classNames(styles['avatar'], styles['svg'])} src='/avatar.png' alt='User avatar'/>
				<div className={styles['name']}>{profile?.name}</div>
				<div className={styles['email']}>{profile?.email}</div>
			</div>
			<div className={styles['menu']}>
				<NavLink to='/' className={({isActive}) => classNames(styles['link'], {
					[styles['active']]: isActive
				})}>
					<img src='/menu.svg' alt='menu button' className={classNames(styles['svg'])}/>
					Menu</NavLink>
				<NavLink to='/cart' className={({isActive}) => classNames(styles['link'], {
					[styles['active']]: isActive
				})}>
					<img src='/cart.svg' alt='cart button' className={classNames(styles['svg'])}/>
					Cart {
						items.length > 0
							? <span className={styles['cart-count']}>{items.reduce((acc, item) => acc += item.count, 0)}</span>
							: <></>
					}
				</NavLink>

			</div>*/}
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