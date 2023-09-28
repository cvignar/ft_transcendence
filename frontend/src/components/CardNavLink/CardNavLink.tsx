import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import './CardNavLink.css';
import { CardNavLinkProps } from './CardNavLink.props';

function CardNavLink({ children, className, ...props }: CardNavLinkProps) {
	return (
		<NavLink {...props} className={classNames('card-button', className)}>
			{children}
		</NavLink>
	);
}

export default CardNavLink;
