<style>
	#freight{  
		background: #232d41;   
		padding: 80px 0 10px 0;
	}
	
	h2{
		color: #fff;
		text-transform: uppercase;
		padding: 0 0 50px 30px;
		font-size: 45px;
		margin: 0 30px 0 0;
	}

	.freight-items{
		display: flex;
		justify-content: space-around;
		align-items: center;
		font-size: 20px;
		color: #fff;
	}
	
	.freight-items div:nth-child(1) {
		width: 550px;
		padding: 30px;
		margin: 0 20px 0 40px;
		background: #ffffff;
		color: #000000;
		text-align: justify;
		box-shadow: 6px 6px  #465a82;
	}

	.freight-items div:nth-child(2) {
		width: 500px;
		margin: 0 40px 0 20px;
		border: 2px solid #ebab2e;
		border-radius: 10px;
		padding: 0 40px 0 20px;
	}
	
	.items li{
		list-style-type: none;
	}

	.items li:before{
		color: #048ba9;
		content: "➤";
		padding-right: 10px;
	}

	span{
		font-weight: 500;
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
	@media (max-width: 1030px){ 
		.freight-items{
			flex-direction: column;
			justify-content: flex-start;
		}
		.freight-items div:nth-child(1) {
			width: 85%;
			margin: 0;
			padding: 20px;
		}

		.freight-items div:nth-child(2) {
			width: 85%;
			margin: 20px 0 0 0 ;
			padding: 20px;
		}
	}

	@media (max-width: 790px){ 
		.freight-items{
			font-size: 18px;
		}
	}
</style>

<section id="freight">
    <h2>Комплексный подход к грузоперевозке 🚢</h2>

    <div class="freight-items">
        <div>
            <p>Доставка контейнеров из Китая 
                в Россию, а так же доставка из Кореи – одни из основных направлений деятельности нашей компании. Если вам требуется доставить груз из Китая или Кореи, или вы хотите узнать стоимость контейнера из Китая – обратитесь к нам. Наши специалисты в кратчайшие сроки предоставят расчёт, подберут оптимальный маршрут, обеспечив надёжную доставку груза.
            </p>
            <p>
				Основные направления доставки груза из Китая и Кореи: Владивосток, Волгоград, Воронеж, Екатеринбург, Казань, Кемерово, Краснодар, Красноярск, Липецк, Москва, Нижний Новгород, Новосибирск, Омск, Оренбург, Пенза, Пермь, Ростов, Самара, Санкт-Петербург, Саратов, Тверь, Томск, Ульяновск, Уфа, Чебоксары, Челябинск, Ярославль.
			</p>
        </div>
        <div>
            <p><span>Осуществляем перевозку различных видов грузов:</span></p>
            <ul class="items">
                <li>камеры видеонаблюдения, видеорегистраторы</li>
                <li>кабельная продукция (кабели коаксиальные, витая пара и т.д.)</li>          
                <li>оборудование различного назначения</li>          
                <li>светодиодная продукция (LED, люстры, светильники, прожекторы, промышленное освещение, панели и т.д.</li>
                <li>светодиодные экраны</li>
                <li>товары народного потребления (хоз. инвентарь)</li>
                <li>сельхоз запчасти</li>
                <li>ткани</li>
                <li>офисная мебель</li>
                <li>детские товары и игрушки</li>
            </ul>
          </div>
    <div>
</section>