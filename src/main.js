import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		email: 'info@email.ru',
		address: 'Novosibirsk',
		phone: '+7 (913) 000-00-00'
	}
});

export default app;