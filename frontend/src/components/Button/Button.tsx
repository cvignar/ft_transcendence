import { memo } from 'react';
import { ButtonProps } from './Button.props';
import classNames from 'classnames';
import './Button.module.css';
import styles from './Button.module.css';

// export const ButtonAlt: FC<ButtonProps> = ({ className, children, ...props }) => { // Alternative form
// 	return (
// 		<button className={classNames('button accent', className)} {...props}> {children}</button >
// 	);
// }

function Button({ children, className, appearence = 'small', ...props }: ButtonProps) {
	return (
		<button className={classNames(className, styles['button'], styles['accent'], {
			[styles['small']]: appearence === 'small',
			[styles['big']]: appearence === 'big'
		})} {...props}> {children}</button >
	);
}

export default memo(Button); // use memo to memorize component props — optimizes component rendering
