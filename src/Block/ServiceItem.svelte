<script>
    import Button from '../UI/Button.svelte'
    export let id;
    export let title;
    export let price;
    export let description;

  </script>
  
  <style>
    .service {
        width: 22%;
        box-sizing: border-box;
        border: 3px solid #ebab2e; 
        /* box-shadow: 4px 4px 1px #ebab2e; */
        padding: 25px;
        height: 230px;
        font-size: 20px;
        -moz-transition: 0.2s ease;
        -ms-transition: 0.2s ease;
        -o-transition: 0.2s ease;
        transition: all 0.2s ease 0s
    }
   .service:hover h2{
      scale: 1.01 
    }

    h2 {
        font-size: 20px;
        font-weight: 700;
        margin: 0;
        color: #fff;
        text-transform: uppercase;
    }

  
    p {
      margin-top: 10px;
      color: #fff;
    }


  </style>
  
  <div class="service">
    <div>
      <h2>{@html title}</h2>
      <p>{@html price}</p>
      <p>{@html description}</p>
    </div>
  </div>


  