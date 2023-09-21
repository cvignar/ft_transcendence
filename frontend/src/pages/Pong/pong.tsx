import classNames from 'classnames';
import styles from './Pong.module.css';
import { io } from 'socket.io-client';


import { game } from './game';
import { useEffect } from 'react';
import { Options } from '../../../../pong/static/options';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const	socket = io(`${Options.pong_wsServer}`, { transports : ['websocket'] });

export function Pong() {

	const username = useSelector((s: RootState) => s.user.username);

	useEffect(() => {
		socket.emit('new player', {name: username, id: 1}); //FIXME!!!! change id!!!
		console.log('socket emit username: ', username, 'socket.id: ', socket.id);
		game(socket);
	}, []);

	return (
		<div className={styles['pong-page']}>
			<div id="PARTNERS">Choose Your Partner: </div>
			<hr/>
			<button id="LEFT" className={classNames(styles['button'], styles['left_player'])}>|</button>
			<button id="RIGHT" className={classNames(styles['button'], styles['right_player'])}>|</button>
			<button id="NEW">New (N)</button>
			<button id="TRNNG" style={{fontWeight: 'bold'}}>TRNNG (T)</button>
			<button id="AUTO" style={{fontWeight: 'bold'}}>Auto (A)</button>
			<button id="PAUSE">Pause (Space)</button>
			<button id="STOP">Stop (S)</button>
			<button id="Up">Up</button>
			<button id="Down">Down</button>
			<button id="SOUND">Sound</button>
			<br></br>
			<canvas id="canvas" className={styles['canvas']}></canvas>
		</div>
	);
}