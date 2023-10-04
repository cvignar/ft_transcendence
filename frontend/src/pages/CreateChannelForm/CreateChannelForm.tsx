import classNames from 'classnames';
import { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Headling from '../../components/Headling/Headling';
import Input from '../../components/Input/Input';
import { channelActions } from '../../store/channels.slice';
import { AppDispatch, RootState } from '../../store/store';
import { userActions } from '../../store/user.slice';
import { Pong } from '../Pong/pong';
import styles from './CreateChannelForm.module.css';
import { CreateChannel } from '../../interfaces/createChannel.interface';

export function CreateChannelFrom() {
	const dispatch = useDispatch<AppDispatch>();
	const user = useSelector((s: RootState) => s.user);
	const channelState = useSelector((s: RootState) => s.channel);
	const [isProtected, setIsProtected] = useState<boolean>(false);
	const onChange = (e: FormEvent<HTMLFormElement>) => { //FIXME!
		console.log(e.currentTarget.type.value);
		if (e.currentTarget.type.value === 'protected') {
			setIsProtected(true);
		} else {
			setIsProtected(false);
		}
	};
	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const newChannel: CreateChannel = {
			name: e.currentTarget.name.value,
			type: e.currentTarget.type.value,
			password: e.currentTarget.password,
			email: user.email,
			members: [{
				id: user.userId,
				name: user.username
			}]
		};
		dispatch(channelActions.createChannel(newChannel));
		//console.log(newChannel);
	};

	return <>
		<form className={styles['form']} onChange={onChange} onSubmit={onSubmit}>
			<Headling>Create a new channel</Headling>
			{channelState.error ? <div>Error!</div> : <></>}
			<Input className={styles['input']} type='text' name='name' placeholder='Channel name' autoComplete='off'/>
			<fieldset>
				<label htmlFor='type-radio' className={styles['radio-set']}>
					Type of your channel
				</label>
				<div id='type-radio' className={styles['radio-set']}>
					<input type="radio" id="public" name="type" value="public" defaultChecked />
					<label htmlFor="public">public</label>

					<input type="radio" id="private" name="type" value="private" />
					<label htmlFor="private">private</label>

					<input type="radio" id="protected" name="type" value="protected" />
					<label htmlFor="protected">protected</label>
				</div>
			</fieldset>
			{isProtected && <Input type='password' placeholder='Password' name='password' className={styles['input']}/>}
			<Button className={styles['button']}>Create</Button>
		</form>
	</>;
}