import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		email: 'zakaz@konteynery-iz-kitaya.ru',
		address: 'Владивосток',
		phone: '+7 (983) 170-23-22'
	}
});

export default app;