<script>
    export let id;
    export let title;
    export let description;

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
        font-size: 30px;
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
    }

    .num span{
        margin-left: 10px;
        font-weight: 500;
        color: #232d41;
    }

    .step:hover .num{
        scale: 1.1
    }

  </style>
  
  <div class="step">
    <div>
      <div class="num"><span>{id}</span></div>
      <h2>{@html title}</h2>
      <p>{@html description}</p>
    </div>
  </div>


  