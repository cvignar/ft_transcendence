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

export function AuthForm() {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const accessToken = getCookie('accessToken');

	const { token, authErrorMessage, userId, profile } = useSelector((s: RootState) => s.user);
	// const token = getCookie('accessToken');
	const uri = 'http://localhost:3000/auth/intra42';
	const getIntraUserCode = () =>
	{
		location.href = uri;
	};
	useEffect(() => {
		if (accessToken) {
			// dispatch(profile); //FIXME!!!
			navigate('/Chat');
		}
	}, []);


	return (
		<div className={styles['page']}>
			<div className={styles['login']}>
				<Headling>Welcome to PingPong</Headling>
				<Button appearence='big' onClick={getIntraUserCode}>Login</Button>
			</div>
		</div>
	);
}