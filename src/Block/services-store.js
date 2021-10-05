import { writable } from 'svelte/store';

export const services = writable([
  {
    id: '1',
    title: '🚢 Морские <br>грузоперевозки',
    price: '',
    description: '- Из любого порта Китая <br>- Развёрнутый расчёт расходов'
  },
  {
    id: '2',
    title: '💴 Оплата <br>на производство',
    price: '',
    description: '- В различной валюте (¥, $)<br>- Только для юридических лиц'
  },
  {
    id: '3',
    title: '☑️ Таможенное <br>оформление',
    price: '',
    description: '- 100% официально <br>- Подбор кода ТНВЭД <br>- Оптимизация платежей'
  },
  {
    id: '4',
    title: '📃 Пакет <br>документов',
    price: '',
    description: '- Договор с российской компанией <br>- УПД с НДС, ГТД'
  }
]);
