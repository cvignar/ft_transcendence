import { HttpExceptionToWebsocketExceptionFilter } from './http-exception-to-websocket-exception.filter';

describe('HttpExceptionToWebsocketExceptionFilter', () => {
	it('should be defined', () => {
		expect(new HttpExceptionToWebsocketExceptionFilter()).toBeDefined();
	});
});
