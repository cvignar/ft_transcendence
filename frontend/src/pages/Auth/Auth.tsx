import { FormEvent, useEffect } from 'react';
import { AuthForm } from './Auth.props';
import styles from './Login.module.css';
import Headling from '../../components/Headling/Headling';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { auth, userActions } from '../../store/user.slice';

export function AuthForm() {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const { id42, authErrorMessage } = useSelector((s: RootState) => s.user);

	useEffect(() => {
		if (id42) {
			navigate('/PongChat');
		}
	}, [id42, navigate]);

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		dispatch(userActions.clearAuthError());
		const target = e.target as typeof e.target & AuthForm;
		const {username, id42, email, hash} = target;
		console.log(username.value, id42.value, email.value, hash.value);
		dispatch(auth({ username: username.value, id42: id42.value, email: email.value, hash: hash.value }));
	};

	return (
		<div className={styles['page']}>
			<div className={styles['login']}>
				<Headling>FAKE AUTORIZATION</Headling>
				{authErrorMessage && <div className={styles['error']}>{authErrorMessage}</div>}
				<form className={styles['form']} onSubmit={submit}>
					<div className={styles['field']}>
						<label htmlFor='username'>Your username</label>
						<Input id='username' name='username' type='username' placeholder='Username'/>
					</div>
					<div className={styles['field']}>
						<label htmlFor='id42'>Your id42</label>
						<Input id='id42' name='id42' placeholder='Id42'/>
					</div>
					<div className={styles['field']}>
						<label htmlFor='email'>Your email</label>
						<Input id='email' name='email' type='email' placeholder='Email'/>
					</div>
					<div className={styles['field']}>
						<label htmlFor='hash'>Your password</label>
						<Input id='hash' name='hash' type='password' placeholder='Password'/>
					</div>
					<Button appearence='big'>Login</Button>
				</form>
			</div>
		</div>
	);
}