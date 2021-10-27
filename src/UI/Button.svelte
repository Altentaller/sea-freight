<script>
    export let type="";
    export let caption="";
    export let href=null;
    export let mode="";
  </script>
  
  <style>
    a {
      color: #ffffff;
      text-decoration: none;
    }
    button
    {
      display: block;
      margin: 0 auto;
      text-decoration: none;
      color: #232d41;
      font-size: 18px;
      font-weight: 500;
      border: 1px solid #232d41;
      border-radius: 5px;
      background: #fff;
      padding: 10px 25px;      
      cursor: pointer;
      
      
    }
  
    button:focus {
      outline: none;
    }
  
    button:hover,
    button:active{
      background: #232d41;
      border-color: #232d41;
      color: #fff;
    }

    .success {
      background: #01a129;
      border-color: #01a129;
    }
  
    .success:hover,
    .success:active {
      background: #1ac745;
      border-color: #1ac745;
    }
  
    .outline {
      background: transparent;
      color: #ebab2e;
      border:  1px solid #ebab2e;
      font-weight: 500;
    }
  
    .outline:hover,
    .outline:active {
      background: #ebab2e;
      color: #000
    }
  

  
    .outline.success {
      border-color: #01a129;
      color: #01a129;
    }
  
    .outline.success:hover,
    .outline.success:active {
      background: #c2ffd1;
    }
  </style>
  
  {#if href}
    <a {href} class="{mode}">{@html caption}</a>
  {:else}
    <button class="{mode}" {type} on:click>{@html caption}</button>
  {/if}
  