import './CardButton.css';
import { CardButtonProps } from './CardButton.props';

function CardButton({ children, className, ...props }: CardButtonProps) {
	const cl = 'card-button' + (className ? ' ' + className : '');
	return (
		<button {...props} className={cl}>
			{children}
		</button>
	);
}

export default CardButton;
