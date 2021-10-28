<script>
    export let id;
    export let title;
    export let price;
    export let description;

</script>
  
<style>
    .service {
        width: 22%;
        box-sizing: border-box;
        background: #ffffff;
        box-shadow: 6px 6px  #465a82;
        /* box-shadow: 4px 4px 1px #ebab2e; */
        padding: 25px;
        min-height: 200px;
        font-size: 20px;
        -moz-transition: 0.2s ease;
        -ms-transition: 0.2s ease;
        -o-transition: 0.2s ease;
        transition: all 0.2s ease 0s
    }

    h2 {
        font-size: 20px;
        font-weight: 700;
        margin: 0;
        color: #000000;
        text-transform: uppercase;
    }

  
    p {
      margin-top: 10px;
      color: #000000;
      font-size: 19px;
    }

	
	@media (min-width: 501px) and (max-width: 1187px){ 
		.service {
        	width: 45%;
			margin: 0 0 30px 0;
			min-height: 200px;
		}
	}
	@media (max-width: 500px){ 
		.service {
        	width: 97%;
			margin: 0 15px 30px 15px;
			min-height: 200px;
		}

		.service:nth-of-type(4){
			margin: 0 15px 0 15px;
		}
	}
</style>
  
<div class="service">
    <div>
      	<h2>{@html title}</h2>
      	<p>{@html price}</p>
      	<p>{@html description}</p>
	</div>
</div>


  