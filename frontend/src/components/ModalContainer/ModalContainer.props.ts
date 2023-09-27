import { ReactNode } from 'react';

export interface ModalContainerProps {
	children: ReactNode;
	modalIsOpen: boolean;
	setIsOpen: (value: boolean) => void;
}