<script>
import Button from '../UI/Button.svelte'; 


export let email;
export let phone; 
</script>
    
<style>

    header{
        position: fixed;
        width: 100%;
        top: 0;
        left: 0;
        height: 70px;
        background: #232d41;
        display: flex;
        justify-content: space-around;
        align-items: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.26);
        color: #ffffff;
    }

    a{
        color: #fff
    }

</style>

<header>
    <div>
        <Button href="href" caption="Лого" />
    </div>
    <div> 
       <Button href="mailto:{email}" caption="{email}" />
    </div>
    <div>
       <Button href="tel:{phone}" caption="{phone}" />
    </div>
    <div>
        <Button mode="outline" type="button" caption="Обратный звонок" />
    </div>


</header>
<!-- <Button href="mailto:{email}" caption="Contact" />
<Button mode="outline" type="button" caption="Favorite" />
 -->