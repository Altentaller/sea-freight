<script>
    import { getContext } from 'svelte';
    import PrivacyModal from '../Block/PrivacyModal.svelte';

    const { open } = getContext('simple-modal');
  
    const showPrivacyModal = () => {
      open(PrivacyModal, { title: "Политика в отношении обработки персональных данных" });
    };
</script>

<style>
	p{
		font-size: 12px;
		text-align: justify;
	}
	p:hover{
		cursor: pointer;
	}
</style>
  
  	<p on:click={showPrivacyModal}>
		Нажимая кнопку «Жду расчёт», Вы соглашаетесь на обработку персональных данных и с политикой конфиденциальности
	</p>