<script>
   
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

	@media (min-width: 781px) and (max-width: 1170px){ 		
		.plus div:nth-child(3n) {
			page-break-after: avoid;
			break-after: avoid; 
		}		
	}
	@media (min-width: 501px) and (max-width: 780px){ 		
		.plus div{
			width: 40%;
			min-height: 240px;
		 }
		 .plus div:nth-child(4) {
			display: none;
		}
		.plus div:nth-child(3n) {
			page-break-after: avoid;
			break-after: avoid; 
		}		
	}
	@media (max-width: 780px){ 
		.plus div{
			font-size: 18px
		 }
	}

</style>
    
<section id="features">
    <h2>Наши преимущества 🌟</h2>   
       
    <div class="plus">
        <div>Предоставляем полностью "белые" документы
        с НДС и ГТД, пройдем любую встречную проверку.</div>
        <div>Подбираем оптимальный код ТНВЭД, соответсвующий категории вашего товара.</div>
        <div>Возможность таможенного представительства вашего контракта (работа по прямому контракту клиента, ВТТ).</div>        
        <div>Предоставление личного менеджера.</div>
        <div>Прозрачность тарифов: распишем все пошлины и налоги по коду ТНВЭД.</div>
        <div>Перечисление денег поставщикам с предоставлением SWIFT.</div>
        <div>Помощь в оформлении сертификатов. Наличие своих сертификатов.</div>
        <div>Возможность присутвия нашего представителя при досмотре груза в порту Владивостока.</div>
        <div>Возможность сотрудничества с федеральными организациями.</div>
    </div>
</section>
