<script>
    import { steps } from './steps-store.js';
    import StepsItem from "./StepsItem.svelte";

   
</script>

<style>
    #steps{
        margin: 70px 0;
    }

    .steps-items{
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
    }

</style>


<section id="steps">
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