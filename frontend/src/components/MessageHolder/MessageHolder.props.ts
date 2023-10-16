import {Message} from '../../interfaces/message.interface';

export interface MessageHolderProps {
	message: Message;
	appearence: 'self' | 'other';
}