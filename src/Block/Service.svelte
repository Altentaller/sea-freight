<script>
    import { services } from './services-store.js';
    import ServiceItem from "./ServiceItem.svelte";
</script>
        
<style>
	#service{    
		padding: 20px 0 30px 0;
		box-sizing: border-box;
		min-height: 400px;
		background: #232d41;
	}

	div{
		display: flex;
		justify-content: space-around;
		flex-wrap: wrap;
	}

	h2{
		color: #fff;
		text-transform: uppercase;
		padding: 0 0 20px 30px;
		font-size: 45px;
	}

	span{
		border: 1px solid #fff;
	}

	@media (min-width: 501px) and (max-width: 985px){ 
		h2{
			font-size: 30px;
		}
	}
	@media (max-width: 500px){ 
		h2{
			font-size: 25px;
		}
	}
</style>
    
<section id="service">
	<h2><span>✔️</span>  Выкупим • Оформим • Доставим!</h2>   
	
	<div>
		{#each $services as service (service.id)}
			<ServiceItem
			id={service.id}
			title={service.title}
			price={service.price}
			description={service.description} />
		{/each}
	</div>
</section>