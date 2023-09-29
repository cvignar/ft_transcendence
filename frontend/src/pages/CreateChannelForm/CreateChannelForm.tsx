import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { channelActions } from '../../store/channels.slice';
import { AppDispatch } from '../../store/store';
import { userActions } from '../../store/user.slice';
import { Pong } from '../Pong/pong';
import styles from './Layout.module.css';

export function CreateChannelFrom() {
	return <></>;
}