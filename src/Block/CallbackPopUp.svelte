<script>
    import Button from '../UI/Button.svelte'; 
    import Input from '../UI/Input.svelte'; 
    export let title;
</script>
  
<style>
	p{
    	font-size: 14px;
		font-weight: 200;
	}
</style>

    <h2>📞 {title}</h2>

    <form>
        <Input 
            id='name' 
            placeholder='Ваше имя' 
            type='text'/>
        <Input 
            id='phone' 
            placeholder='Телефон' 
            type='text'/>
            
        <Button type="button" caption="📧 Отправить" />

        <p>Нажимая кнопку «Отправить», Вы соглашаетесь на обработку персональных данных и с политикой конфиденциальности</p>
    </form>
 