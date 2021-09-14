<script>
    import { steps } from './steps-store.js';
    import StepsItem from "./StepsItem.svelte";

   
</script>

<style>
    #steps{
        padding: 10px 0 20px 0;
        background: #232d41; 
    }
    #steps h2{
        color: rgba(255,255,255,0.2);
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

</style>


<section id="steps">
    <h2>
        Наша схема работы →
    </h2>
    <div class="steps-items">
        {#each $steps as step (step.id)}
        <StepsItem
          id={step.id}
          title={step.title}
          price={step.price}
          description={step.description} />
      {/each}
    </div>  
  </section>