<script>
    export let type="";
    export let caption="";
    export let href=null;
    export let mode="";
</script>
  
<style>
    a {
      color: #ffffff;
      text-decoration: none;
    }
    button{
      display: block;
      margin: 0 auto;
      text-decoration: none;
      color: #232d41;
      font-size: 18px;
      font-weight: 500;
      border: 1px solid #232d41;
      border-radius: 5px;
      background: #fff;
      padding: 10px 25px;      
      cursor: pointer;
    }
  
    button:focus {
      outline: none;
    }
  
    button:hover,
    button:active{
      background: #232d41;
      border-color: #232d41;
      color: #fff;
    }
    
    .outline {
      background: transparent;
      border:  1px solid #ebab2e;
	  box-shadow: 3px 3px  #465a82;
      padding: 5px 20px;
    }
	.outline:hover,
  	.outline:active {
      background: #ebab2e;
      color: #000
    }
</style>
  
	{#if href}
    	<a {href} class="{mode}">{@html caption}</a>
  	{:else}
    	<button class="{mode}" {type} on:click>{@html caption}</button>
  	{/if}