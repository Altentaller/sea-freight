<script>
	import Button from '../UI/Button.svelte'; 
    import Input from '../UI/Input.svelte'; 
	import ModalView from '../UI/ModalView.svelte';
    import Modal from 'svelte-simple-modal';

	/* window.addEventListener( "load", function () {
		function sendData() {
			const XHR = new XMLHttpRequest();
			const FD = new FormData( order );
			XHR.open( "POST", "http://altenic.beget.tech/sea/mailer/smart.php" );
			XHR.send( FD );
		}

		const order = document.getElementById( "order" );
		order.addEventListener( "submit", function ( event ) {
			event.preventDefault();
			sendData();
			alert( 'Ваш запрос отправлен в отдел логистики!' );	
			event.target.reset(); 
		} );
	} ); */

	function submitForm(){
		function sendData() {
			const XHR = new XMLHttpRequest();
			const FD = new FormData( order );
			XHR.open( "POST", "https://konteynery-iz-kitaya.ru/mailer/smart.php" );
			XHR.send( FD );
		}

		const order = document.getElementById( "order" );
		order.addEventListener( "submit", function ( event ) {
			event.preventDefault();
			sendData();
			alert( 'Ваш запрос отправлен в отдел логистики!' );	
			event.target.reset(); 
		} );
	}

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
		font-size: 30px;
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

	@media (min-width: 960px) and (max-width: 1080px){        
		h1{		
			font-size: 40px;
		}
	}
	@media (min-width: 510px) and (max-width: 959px){        
		#promo{
			flex-direction: column;
			justify-content: center;
			align-items: center;
		}
		.title{
			width: 100%;			
		}
		h1{		
			font-size: 40px;
			margin-top: 40px;
		}
		img{
			width: 500px;
		}
		.form{
			margin-top: 10px;
		}
	}

	@media (max-width: 509px){ 
		#promo{
			flex-direction: column;
			justify-content: center;
			align-items: center;
		}
		.title{
			width: 100%;			
		}
		h1{		
			font-size: 30px;
			margin-top: 40px;
		}
		img{
			width: 100%;
		}
		.form{
			margin-top: 0;
			width: 90%;
		}
		h2{
			text-align: center;
			font-size: 25px;
			font-weight: 500;
		}

		form{
			width: 90%;
		}
	}
</style>

<section id="promo">
    <div class="title">
        <h1>Морские контейнерные перевозки <br>из Китая и Кореи</h1>
        <img src="assets/product2.png" alt="cargo">
    </div>
    <div class="form">
        <h2>Запрос коммерческого предложения</h2>

		 <form id="order" on:submit|preventDefault={submitForm}>
            <Input 
                id='name' 
				name='name'
                placeholder='Ваше имя' 
                type='text'/>
            <Input 
                id='phone' 
				name='phone'
				placeholder='+7 (000) 000-00-00'
                type='tel'/>
            <Input 
                id='email' 
				name='email'
                placeholder='Email *' 
                type='email'
				required="true"/>
            <!-- <Input 
                id='file' 
				name='file'
                controlType='file'/> -->
            <Input 
                id='description' 
				name='description'
                placeholder='Комментарий' 
                controlType='textarea'
                rows='2' />
            
            <Button on:click={submitForm} type="submit" caption="📧 Жду расчет" />

        	<Modal><ModalView /></Modal>
        </form> 
    </div>
    
</section>
