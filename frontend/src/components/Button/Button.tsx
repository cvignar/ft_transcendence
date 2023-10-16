import { memo } from 'react';
import { ButtonProps } from './Button.props';
import classNames from 'classnames';
import './Button.module.css';
import styles from './Button.module.css';

function Button({ children, className, appearence = 'small', ...props }: ButtonProps) {
	return (
		<button className={classNames(className, styles['button'], styles['accent'], {
			[styles['small']]: appearence === 'small',
			[styles['big']]: appearence === 'big'
		})} {...props}> {children}</button >
	);
}

export default memo(Button);
