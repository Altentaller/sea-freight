<script>
    import { steps } from './steps-store.js';
    import StepsItem from "./StepsItem.svelte";
   
</script>

<style>
    #steps{
        padding: 40px 0 30px 0;
        background: #232d41; 
    }
    h2{
        color: #fff;
        text-transform: uppercase;
        padding: 0 0 20px 30px;
        font-size: 45px;
    }
    .steps-items{
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
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


<section id="steps">
    <h2>
        Наша схема работы 💬
    </h2>
    <div class="steps-items">
        {#each $steps as step (step.id)}
        <StepsItem
          id={step.id}
          title={step.title} />
      {/each}
    </div>  
  </section>