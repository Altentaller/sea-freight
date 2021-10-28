<script>
	import { imask } from 'svelte-imask';
	
	export let controlType=null;
	export let id;
	export let placeholder="";
	export let rows=null; 
	export let name=null;
	export let type="";
	export let required=null;

	const options = {
		mask: '+{7} (000) 000-00-00'
 	};

</script>

<style>
		input,
		textarea {
			display: block;
			width: 100%;
			border: none;
			border: 2px solid #ccc;
			border-radius: 3px 3px 0 0;
			background: white;
			padding: 10px;
			transition: border-color 0.1s ease-out;
			font-weight: 300;
			font-size: 16px;
			resize: none;
		}
	
		input:focus,
		textarea:focus {
			border-color: #ebab2e;
			outline: none;
		}

		.form-control {
			width: 100%;
			margin: 5px 0 15px 0;
		}

	</style>




<div class="form-control">
	{#if controlType === 'textarea'}
		<textarea 
				{rows} {id} {name} 
				placeholder="{placeholder}" />
	{:else if controlType === 'file'}
		<input 
				type="file" {id} {name} multiple>
	{:else if required === 'true'}
		<input 
				type="{type}" {id} {name} 
				placeholder="{placeholder}" 
				required />
	{:else if name === 'phone'}
		<input  
				type="{type}" 
				{id} {name}  
				placeholder="{placeholder}"
				use:imask={options} />
	{:else}
		<input 
				type="{type}" {id} {name} 
				placeholder="{placeholder}"/>
	{/if} 
</div>