import classNames from 'classnames';
import './CardButton.css';
import { CardButtonProps } from './CardButton.props';

function CardButton({ children, className, ...props }: CardButtonProps) {
	return (
		<button {...props} className={classNames('card-button', className)}>
			{children}
		</button>
	);
}

export default CardButton;
