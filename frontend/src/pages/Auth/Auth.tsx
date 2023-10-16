import { FormEvent, useEffect } from 'react';
import styles from './Login.module.css';
import Headling from '../../components/Headling/Headling';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { auth, getProfile, userActions } from '../../store/user.slice';
import { configureStore } from '@reduxjs/toolkit';
import { getCookie } from 'typescript-cookie';
import { channelActions } from '../../store/channels.slice';

export function AuthForm() {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	
	const { token, authErrorMessage, profile } = useSelector((s: RootState) => s.user);
	const uri = `https://${import.meta.env.VITE_BACK_HOST}:${import.meta.env.VITE_BACK_PORT}/auth/intra42`;
	const getIntraUserCode = () =>
	{
		location.href = uri;
	};
	useEffect(() => {
		const accessToken = getCookie('accessToken');
		if (accessToken) {
			localStorage.setItem('userToken', accessToken);
			const userId = getCookie('userId');
			if (userId) {
				dispatch(getProfile(parseInt(userId)));
			}
		}
	}, []);
	useEffect(() => {
		const timerId = setTimeout(() => {
			if (profile != null) {
				dispatch(userActions.setUser(profile));
				navigate('/Settings/Stats');
			}
		}, 1000);
		return () => clearTimeout(timerId);
	}, [profile]);

	return (
		<div className={styles['page']}>
			<div className={styles['login']}>
				<Headling>Welcome to PingPong</Headling>
				<Button appearence='big' onClick={getIntraUserCode}>Login</Button>
			</div>
		</div>
	);
}