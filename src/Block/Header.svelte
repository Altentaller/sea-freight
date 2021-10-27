<script>
    import Button from '../UI/Button.svelte'; 
    import ModalView from '../UI/ModalView.svelte';
    import Modal from 'svelte-simple-modal';

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
    a{
        color: #fff;
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
       <Button href="tel:{phone}" caption="{phone} ☎️ Отдел логистики" />
    </div>
    <!-- <div>
        <Modal>
            <ModalView />
        </Modal>
    </div> -->
</header>