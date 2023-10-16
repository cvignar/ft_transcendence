import { FormEvent, useEffect } from 'react';
import styles from './Login.module.css';
import Headling from '../../components/Headling/Headling';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { auth, auth2fa, getProfile, userActions } from '../../store/user.slice';
import { configureStore } from '@reduxjs/toolkit';
import { getCookie } from 'typescript-cookie';
import { channelActions } from '../../store/channels.slice';
import { Auth2FaFormProps } from './Auth2Fa.props';

export function Auth2FaForm() {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	
	const { token, authErrorMessage, profile } = useSelector((s: RootState) => s.user);

	useEffect(() => {
		const accessToken = getCookie('accessToken');
		const user_id = getCookie('userId');
		if (accessToken) {
			localStorage.setItem('userToken', accessToken);
			if (user_id) {
				dispatch(getProfile(parseInt(user_id)));
				// navigate('/Settings/Stats');
			}
		}
		else if (user_id){
			navigate('/Auth/2FA');
		}
		else {
			navigate('/Auth');
		}
	}, []);
	useEffect(() => {
		const timerId = setTimeout(() => {
			if (profile) {
				dispatch(channelActions.startConnecting());
				navigate('/Settings/Stats');
			}
		}, 1000);
		return () => clearTimeout(timerId);
	}, [profile]);

	const submit = async(e: FormEvent) => {
		e.preventDefault();
		const target = e.target as typeof e.target & Auth2FaFormProps;
		const {code2fa} = target;
		dispatch(auth2fa({code: code2fa.value}));
		const timerId = setTimeout( () => {
			const accessToken = getCookie('accessToken');
			const user_id = getCookie('userId');
			if (accessToken && user_id) {
				dispatch(getProfile(parseInt(user_id)));
			}
			window.location.reload();
		}, 1000);
		return () => clearTimeout(timerId)
	};

	return (
		<div className={styles['page']}>
			<div className={styles['login']}>
				<Headling>Pong 2FA</Headling>
				<form className={styles['form']} onSubmit={submit}>
					<div className={styles['field']}>
						<label htmlFor='code2fa'>Code</label>
						<Input id='code2fa' name='code2fa' type='text' inputMode='numeric' placeholder='000000' maxLength={6} max={6} min={6}/>
					</div>
					<Button appearence='big'>Submit</Button>
				</form>
			</div>
		</div>
	);
}