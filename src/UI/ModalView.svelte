<script>
    import { getContext } from 'svelte';
    import CallbackPopUp from '../Block/CallbackPopUp.svelte';
    import Button from '../UI/Button.svelte'; 

    const { open } = getContext('simple-modal');
  
    const showCallbackPopUp = () => {
      open(CallbackPopUp, { title: "Обратный звонок" });
    };
  </script>
  
  <Button on:click={showCallbackPopUp} mode="outline" type="button" caption="Обратный звонок" />