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

#service div{
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

#service h2{
  color: rgba(255,255,255,0.2);
  text-transform: uppercase;
  padding: 0 0 20px 30px;
  font-size: 45px;
}

#freight{  
  background: #232d41;   
  padding: 80px 0 20px 0;
}

#freight h2{
  color: rgba(255,255,255,0.2);
  text-transform: uppercase;
  padding: 0 0 20px 30px;
  font-size: 45px;
  margin: 0;
}

span{
  font-weight: 700;
}

.freight-items{
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  color: #fff;
}

.freight-items div{  
  width: 50%;
  padding: 40px;
}

.freight-items div h3{  
  text-transform: uppercase;
}

.plus li, .items li{
  list-style-type: none;
}
.plus li:before{
  color: #ebab2e;
    content: "★";
    padding-right: 10px;
}

.items li:before{
  color: #048ba9;
    content: "➤";
    padding-right: 10px;
}
</style>
    
<section id="service">
  <h2>
    Выкупим  →  Оформим  → Доставим!
  </h2>   


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



<section id="freight">
  <!-- <div>Работаем как на свой контракт, так и на контракт клиента (таможенное представительство, ВТТ)</div> -->
  <h2><span>Комплексный</span> подход → к перевозке из Китая</h2>

  <div class="freight-items">
    <div><p> Перевозка грузов из Китая в Россию – одно из основных направлений деятельности нашей компании. Если вам требуется доставить груз из Китая – обратитесь к нам. Наши специалисты в кратчайшие сроки подберут оптимальный маршрут и способ перевозки, обеспечив доставку груза в точно согласованные сроки.

      <p> Осуществляем перевозку различных видов грузов:</p>
        <ul class="items">
          <li>бытовые приборы,</li>
          <li>офисные товары и оргтехника</li>
          <li>детские товары и игрушки</li>
          <li>оборудование различного назначения</li>
          <li>текстиль и ткани</li>
          <li>товары народного потребления</li>
          <li>мебель и предметы интерьера</li>
        </ul>
          </div>
    <div>
       <h3> Наши преимущества</h3>
       <ul class="plus">
        <li>Предоставляем полностью "белые" документы
        с НДС и ГТД, пройдем любую встречную проверку.</li>

        <li>Подбираем наилучшее индивидуальное решение по поставке товаров из других стран, с учетом особенностей Вашего бизнеса.</li>
        <li>Наличие собственных складов и транспорта на территории Китая.</li>
        <li>Предоставление личного менеджера – удаленного помощника в Китае.</li>
        <li>Работа без предоплаты с перечислением по договору денег только после проверки полученного груза.</li>
        <li>Прозрачность тарифов: на нашем сайте вы можете быстро рассчитать стоимость грузоперевозки под ключ.</li>
        <li>Перечисление денег поставщикам товаров и грузов в режиме онлайн.</li>
        
        

       </ul>
        
  </div>
  </div>
</section>
