import { useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { AppDispatch } from '../../store/store';
import { userActions } from '../../store/user.slice';
import styles from './Layout.module.css';

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
		window.location.reload();
		//navigate('/Auth');
	};

	const navigateSettings = () => {
		navigate('/Settings');
	};

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
			<Button className={styles['']} onClick={() => {console.log('Leaderboard');}}>
				Leaderboard
			</Button>
			<Button className={styles['-btn']} onClick={() => {console.log('Invite partner');}}>
				Invite partner
			</Button>

			<Button  onClick={navigateSettings}>
				Settings
			</Button>
			<Button  onClick={logout}>
				Logout
			</Button>
		</div>
		<div className={styles['content']}>
			<Outlet/>
		</div>
	</div>;
}