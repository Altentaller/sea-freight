import { writable } from 'svelte/store';

export const steps = writable([
  {
    id: '1',
    title: '✉️ Оставьте заявку'
  },
  {
    id: '2',
    title: '📞 Наш звонок'
  },
  {
    id: '3',
    title: '📃 Заключаем договор'
  },
  {
    id: '4',
    title: '📦 Забираем груз'
  },
  {
    id: '5',
    title: '☑️ Экспорт'
  },
  {
    id: '6',
    title: '✅ Доставка клиенту'
  }
]);
