<script>
    import Button from '../UI/Button.svelte'
    export let id;
    export let title;
    export let price;
    export let description;

  </script>
  
  <style>
    .service {
        width: 23%;
        background: white;
        box-sizing: border-box;
        border-left: 1px solid #232d41;
        box-shadow: 4px 4px 1px #f0f0f0;
        padding: 25px 20px;
        margin: 0 15px;
        height: 370px;
        font-size: 20px;
        -moz-transition: 0.5s ease;
        -ms-transition: 0.5s ease;
        -o-transition: 0.5s ease;
        transition:all 0.5s ease 0s
    }
   .service:hover{
        border-left: 1px solid #ebab2e;
    }

    h2 {
        font-size: 30px;
        font-weight: 500;
        margin: 0;
        color: #475985;
    }

  
    p {
      margin-top: 10px;
    }


  </style>
  
  <div class="service">
    <div>
      <h2>{@html title}</h2>
      <p>{@html price}</p>
      <p>{@html description}</p>
      <br>
      <Button type="button" caption="Заказать услугу" />
    </div>
  </div>


  