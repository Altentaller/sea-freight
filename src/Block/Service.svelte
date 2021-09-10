<script>
    import { services } from './services-store.js';
    import ServiceItem from "./ServiceItem.svelte";

   
</script>
        
<style>
#service{
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    padding-top: 50px;
    box-sizing: border-box;
    min-height: 500px;
    background: #f6f6f6;
}


#freight{
  display: flex;
  justify-content: space-around;
  align-items: center;
  min-height: 250px;
  background: #232d41;
  font-size: 35px;
  font-weight: 500;
  color: #fff;
  text-align: center;
}
</style>
    
<section id="service">
  {#each $services as service (service.id)}
    <ServiceItem
      id={service.id}
      title={service.title}
      price={service.price}
      description={service.description} />
  {/each}

</section>



<section id="freight">
  <div>Работаем как на свой контракт, так и на контракт клиента (таможенное представительство, ВТТ)</div>
</section>
