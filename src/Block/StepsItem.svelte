<script>
    export let id;
    export let title;
</script>
  
  <style>
    .step {         
        box-sizing: border-box; 
        width: 350px;
        font-size: 20px; 
        padding: 20px;  
        margin: 20px;   
        border: 1px solid gray;
        color: #fff;
        -moz-transition: 0.5s ease;
        -ms-transition: 0.5s ease;
        -o-transition: 0.5s ease;
        transition:all 0.5s ease 0s
    }
    .step:nth-child(3n) {
        page-break-after: always;
        break-after: always; 
    }

    h2 {
        font-size: 26px;
        font-weight: 500;
        margin: 0;
        color: #fff;
    }

    .num{
        display: block;
        background: #ebab2e ;
        width: 30px;
        height: 30px;
        -moz-border-radius: 50px;
        -webkit-border-radius: 50px;
        border-radius: 50px;
        margin-bottom: 20px;
    }

    .num span{
        margin-left: 10px;
        font-weight: 500;
        color: #232d41;
    }

    .step:hover .num{
        scale: 1.1
    }


    @media (min-width: 780px) and (max-width: 1169px){ 
		.step:nth-child(3n) {
            page-break-after: avoid;
            break-after: avoid; 
        }
	}

	@media (max-width: 500px){ 
		h2{
			font-size: 25px;
		}
	}
</style>
  
	<div class="step">
    	<div>
      		<div class="num"><span>{id}</span></div>
      		<h2>{@html title}</h2>
    	</div>
  	</div>


  