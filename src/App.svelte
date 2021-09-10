<script>
import Header from './Block/Header.svelte'; 
import Promo from './Block/Promo.svelte'; 
import Service from './Block/Service.svelte'; 
import Steps from './Block/Steps.svelte';

export let email;
export let phone;
</script>

<svelte:head>
    <style>
       @import url('https://fonts.googleapis.com/css2?family=Jost:wght@200;300;500;700&display=swap');
    </style>
</svelte:head>


<style>
    :global(body){
        margin: 0;
        padding: 0;
        font-family: 'Jost', sans-serif;
        font-weight: 300;
    }
</style>

<Header {email}{phone}/>
<Promo />
<Service />
<Steps />