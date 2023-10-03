import { FormEvent, useEffect } from 'react';
import { AuthForm } from './Auth.props';
import styles from './Login.module.css';
import Headling from '../../components/Headling/Headling';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { auth, getProfile, userActions } from '../../store/user.slice';

export function AuthForm() {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const { token, authErrorMessage, userId, profile } = useSelector((s: RootState) => s.user);
	const uri = 'http://localhost:3000/auth/intra42';
	const getIntraUserCode = () =>
	{
		location.href = uri;
	};
	useEffect(() => {
		if (token) {
			dispatch(getProfile(userId));
			if (profile)
				navigate('/Chat');
		}
	}, [token, navigate, dispatch, userId, profile]);

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		dispatch(userActions.clearAuthError());
		const target = e.target as typeof e.target & AuthForm;
		const {username, email, password} = target;
		dispatch(auth({ username: username.value, email: email.value, password: password.value }));
	};

	return (
		<div className={styles['page']}>
			<div className={styles['login']}>
				<Headling>Welcome to PingPong</Headling>
				{authErrorMessage && <div className={styles['error']}>{authErrorMessage}</div>}
				<form className={styles['form']} onSubmit={submit}>
					<div className={styles['field']}>
						<label htmlFor='username'>Your username</label>
						<Input id='username' name='username' type='username' placeholder='Username'/>
					</div>
					<div className={styles['field']}>
						<label htmlFor='email'>Your email</label>
						<Input id='email' name='email' type='email' placeholder='Email'/>
					</div>
					<div className={styles['field']}>
						<label htmlFor='password'>Your password</label>
						<Input id='password' name='password' type='password' placeholder='Password'/>
					</div>
					<Button appearence='big'>Login</Button>
				</form>
				<Button appearence='big' onClick={getIntraUserCode}>Login</Button>
			</div>
		</div>
	);
}