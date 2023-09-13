import classNames from 'classnames';
import styles from './Pong.module.css';

//const { data } = await axios.post<AuthResponse>(`${BACK_PREFIX}/user/create`, {
//	username: params.username,
//	id42: params.id42,
//	email: params.email,
//	hash: params.hash
//});
//return data;

export function Pong() {

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