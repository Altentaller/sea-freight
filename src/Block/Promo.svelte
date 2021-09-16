<script>
    import Button from '../UI/Button.svelte'; 
    import Input from '../UI/Input.svelte'; 
</script>
    
<style>
#promo{
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
    padding: 50px 0;
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
    width: 600px;
    display: block;
    margin: 0 auto
}

.form{
    width: 500px;
    border: 10px solid #ebab2e;
    background: #fff;
}

h2{
    text-align: center;
    font-size: 32px;
    font-weight: 500;
}

form{
    width: 450px;
    margin: 0 auto;    
    padding: 5px 20px 20px 20px;
}

p{
    font-weight: 200;
    font-size: 16px
}
</style>

<section id="promo">
    <div class="title">
        <h1>Морские контейнерные перевозки <br>из Китая и Кореи</h1>
        <img src="assets/product.png" alt="cargo">
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
                id='description' 
                placeholder='Комментарий' 
                controlType='textarea'
                rows='2' />
            
            <Button type="button" caption="Жду расчет" />

            <p>Нажимая кнопку «Жду расчёт», Вы соглашаетесь на обработку персональных данных и с политикой конфиденциальности</p>
        </form>
    </div>
    
</section>
