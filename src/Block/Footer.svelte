<script>
    import Button from '../UI/Button.svelte';
    export let email;
    export let phone; 
    export let address;
</script>


<style>
    footer{
        position: relative;
        min-height: 400px;
        border-top: 15px solid #232d41;
        border-bottom: 30px solid #232d41;
        text-align: center;
    }
    .contact{
        position: absolute;
        top: 0;
        left: 100px;
        width: 300px;
        box-sizing: border-box;
        background: #232d41;
        padding: 30px;
        color: #fff;
        font-size: 18px;
        font-weight: 500;
    }

    a {
        color: #fff;
    }
	@media (min-width: 770px) and (max-width: 960px){ 
		.contact{
			top: 0;
			left: 0px;
			width: 300px;
			padding: 30px;
    	}
	}
	@media (max-width: 769px){ 
		.contact{
			top: 0;
			left: 0px;
			width: 200px;
			padding: 10px;
    	}
	}
</style>

<footer>
    <script charset="utf-8" async src="https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3A99789942423a09eabbb2af9377537ef8b96d6629c54857df6cf766bc75be481b&amp;width=100%25&amp;height=400&amp;lang=ru_RU&amp;scroll=true"></script>

    <div class="contact">
        <p>
            <Button href="mailto:{email}" caption="{email}" />
        </p>
        <p>
            <Button href="tel:{phone}" caption="{phone}" />
        </p>
        <p><a href="whatsapp://send?phone=79831702322" target=_blank> 💬 Написать в WhatsApp</a></p>
        <p><a href="weixin://dl/chat?wxid_mlik0ewa38aq22" target=_blank> 💬 Написать в WeChat</a></p>
        <a href="https://msng.link/o/?https%3A%2F%2Fu.wechat.com%2FkJ_N-dev-hnWmU8SbmxyWCA=wc"><img src="assets/wechat.png" alt="wechat"></a>
        
    </div>
</footer>