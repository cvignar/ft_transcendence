import { useState } from 'react';
import Modal from 'react-modal';
import { ModalContainerProps } from './ModalContainer.props';

const customStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
		background: 'var(--white-color)'
	}
};

function ModalContainer({children, modalIsOpen, setIsOpen}: ModalContainerProps) {
	let subtitle;

	const afterOpenModal = () => {
		subtitle.style.color = '#f00';
	};

	const closeModal = () => {
		setIsOpen(false);
	};

	return (
		<Modal
			isOpen={modalIsOpen}
			onAfterOpen={afterOpenModal}
			onRequestClose={closeModal}
			style={customStyles}
		>
			{children}
		</Modal>
	);
}

export default ModalContainer;