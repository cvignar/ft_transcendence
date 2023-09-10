import styles from './Headling.module.css';
import classNames from 'classnames';
import { HeadlingProps } from './Headling.props';

function Headling({ children, className, ...props } : HeadlingProps) {
	return (
		<h1 {...props} className={classNames(styles['h1'], className)}>{children}</h1>
	);
}

export default Headling; 