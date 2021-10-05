<script>
    import Button from '../UI/Button.svelte'; 
    import Input from '../UI/Input.svelte'; 
</script>
    
<style>
	#promo{
		display: flex;
		justify-content: space-around;
		align-items: flex-start;
		width: 100%;
		box-sizing: border-box;
		padding: 50px 0 20px 0;
		min-height: 400px;
		background: #232d41;
		font-size: 19px;
	}

	.title{
		width: 50%
	}
	h1{
		text-align: center;
		margin-top: 70px;
		padding: 20px;
		font-size: 50px;
		font-weight: 700;
		text-transform: uppercase;
		color: #fff
	}

	img{
		width: 750px;
		display: block;
		margin: 0 auto;
		margin-top: -80px
	}

	.form{
		width: 480px;
		margin-top: 70px;
		border: 5px solid #ebab2e;
		background: #fff;  
		box-shadow: 8px 8px  #465a82;
	}

	h2{
		text-align: center;
		font-size: 25px;
		font-weight: 500;
	}

	form{
		width: 400px;
		margin: 0 auto;   
		padding: 5px 20px 20px 20px;
	}

	p{
		font-size: 14px
	}
</style>

<section id="promo">
    <div class="title">
        <h1>Морские контейнерные перевозки <br>из Китая и Кореи</h1>
        <img src="assets/product2.png" alt="cargo">
    </div>
    <div class="form">
        <h2>Запрос коммерческого предложения</h2>
        <form>
            <Input 
                id='name' 
                placeholder='Ваше имя' 
                type='text'/>
            <Input 
                id='phone' 
                placeholder='Телефон' 
                type='text'/>
            <Input 
                id='email' 
                placeholder='Email *' 
                type='text'/>
            <Input 
                id='file' 
                controlType='file'/>
            <Input 
                id='description' 
                placeholder='Комментарий' 
                controlType='textarea'
                rows='2' />
            
            <Button type="button" caption="📧 Жду расчет" />

            <p>Нажимая кнопку «Жду расчёт», Вы соглашаетесь на обработку персональных данных и с политикой конфиденциальности</p>
        </form>
    </div>
    
</section>
