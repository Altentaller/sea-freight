<script>
    import Button from '../UI/Button.svelte'; 

    export let email;
    export let phone; 

</script>
    
<style>
    header{
        display: flex;
        justify-content: space-around;
        align-items: center;
        width: 100%;        
        position: fixed;
        top: 0;
        left: 0;
        height: 60px;
        background: #232d41;        
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.26);
        color: #ffffff;
        font-size: 16px;
        font-weight: 500;
    }
    .logo{
        height: 40px;
    }

    @media (min-width: 951px){
        header div:nth-of-type(5){ 
            display: none
        }
    }
    @media (min-width: 951px) and (max-width: 981px) {
        header div:nth-of-type(2){
            display: none
        }
    }

    @media (max-width: 950px) {
        header div:nth-of-type(2),
        header div:nth-of-type(4){
            display: none
        }
    }
    @media (max-width: 610px) {
        header div:nth-of-type(1){
            display: none
        }
    }
    @media (max-width: 450px) {
        header{
            flex-wrap: nowrap;
            flex-direction: column-reverse;
            height: 90px;
        }
    }
    
</style>

<header>
    <div>
        <img src="assets/logo.png" alt="logo" class="logo">
    </div>
    <div>
        Логистика и консалтинг под ключ
    </div>
    <div> 
       <Button href="mailto:{email}" caption="✉️ {email}" />
    </div>
    <div>
       <Button href="tel:{phone}" mode="outline" caption="{phone} ☎️ Отдел логистики" />
    </div>

    <div>
        <Button href="tel:{phone}" mode="outline" caption="☎️ {phone}" />
    </div>    
</header>