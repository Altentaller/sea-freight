<script>
    import * as animateScroll from "svelte-scrollto";
    import Header from './Block/Header.svelte'; 
    import Promo from './Block/Promo.svelte'; 
    import Service from './Block/Service.svelte'; 
    import Features from './Block/Features.svelte'; 
    import About from './Block/About.svelte'; 
    import Steps from './Block/Steps.svelte';
    import Partners from './Block/Partners.svelte';
    import Footer from './Block/Footer.svelte';

    export let email;
    export let phone;
    export let address;
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

    .to-top-btn{
        position: fixed;
        display: block;
        bottom: 5px;
        right: 5px;
        width: 40px;
        height: 40px;
        background: #ebab2e;
        font-size: 28px;
        font-weight: 700;
        text-align: center;
        cursor: pointer;
        text-decoration: none;
    }
</style>



<Header {email}{phone}/>
<Promo />
<Service />
<Features />
<About />
<Steps />
<Partners />
<Footer {email}{phone}{address}/>

<a class="to-top-btn" on:click={() => animateScroll.scrollToTop()}> ↑ </a>

