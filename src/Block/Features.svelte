<script>
    import { services } from './services-store.js';
    import ServiceItem from "./ServiceItem.svelte";

   
</script>
        
<style>
#features{    
    padding: 80px 0 30px 0;
    box-sizing: border-box;
    min-height: 400px;
    background: #232d41;
}

h2{
  color: #fff;
  text-transform: uppercase;
  padding: 0 0 20px 30px;
  font-size: 45px;
  margin: 0;
}

.plus{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
}
.plus div:nth-child(3n) {
    page-break-after: always;
    break-after: always; 
}
.plus div{         
        box-sizing: border-box; 
        width: 350px;
        min-height: 170px;
        font-size: 20px; 
        padding: 20px;  
        margin: 20px;   
        background: #ffffff;
        color: #000000;
        box-shadow: 6px 6px  #465a82;
        -ms-transition: 0.5s ease;
        -o-transition: 0.5s ease;
        transition:all 0.5s ease 0s
    }

.plus div:before{
    color: #ebab2e;
    content: "★";
    padding-right: 10px;
    font-size: 30px
}
    
</style>
    
<section id="features">
     <h2>
      Наши преимущества 🌟
    </h2>   
       
    <div class="plus">
        <div>Предоставляем полностью "белые" документы
        с НДС и ГТД, пройдем любую встречную проверку.</div>
        <div>Подбираем оптимальный код ТНВЭД, соответсвующий категории вашего товара.</div>
        <div>Возможность таможенного представительства вашего контракта (работа по прямому контракту клиента, ВТТ).</div>        
        <div>Предоставление личного менеджера.</div>
        <div>Прозрачность тарифов: распишем все пошлины и налоги по коду ТНВЭД.</div>
        <div>Перечисление денег поставщикам с предоставлением SWIFT.</div>
        <div>Помощь в оформлении сертификатов.</div>
        <div>Возможность присутвия нашего представителя при досмотре груза в порту Владивостока.</div>
        <div>Возможность сотрудничества с федеральными организациями.</div>
    </div>
</section>
