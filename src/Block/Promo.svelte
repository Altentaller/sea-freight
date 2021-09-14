<script>
 import Button from '../UI/Button.svelte'; 
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

input{
    width: 100%;
    font-weight: 300;
}

</style>

<section id="promo">
    <div class="title">
        <h1>Морские контейнерные грузоперевозки <br>из Китая и Кореи</h1>
        <img src="assets/product.png" alt="cargo">
    </div>
    <div class="form">
        <h2>Запрос коммерческого предложения</h2>
        <form>
            <input type="text" name="name" placeholder="Имя">
            <input type="text" name="phone"  placeholder="Телефон">
            <input type="email" name="email" placeholder="Email *"  required>
            <input type="text" name="item"  placeholder="Наименование товара">
            
            <Button type="button" caption="Жду расчет" />

            <p>Нажимая кнопку «Жду расчёт», Вы соглашаетесь на обработку персональных данных и с политикой конфиденциальности</p>
        </form>
    </div>
    
</section>
