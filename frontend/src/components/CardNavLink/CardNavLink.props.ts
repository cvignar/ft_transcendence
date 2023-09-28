import { ButtonHTMLAttributes, ReactNode } from 'react';
import { NavLinkProps } from 'react-router-dom';

export interface CardNavLinkProps extends NavLinkProps {
	children: ReactNode;
	className: string;
	//to: any;
}