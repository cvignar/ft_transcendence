import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import fs from 'fs';
// https://vitejs.dev/config/
export default defineConfig({
	server: { https: {
		key: fs.readFileSync('/ssl/ft_transcendence.key'),
		cert: fs.readFileSync('/ssl/ft_transcendence.crt'),
	} },
	plugins: [
		react()
	]
});
