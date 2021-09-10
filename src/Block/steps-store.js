import { writable } from 'svelte/store';

export const steps = writable([
  {
    id: '1',
    title: 'Оставьте заявку',
    description: 'Берёте и оставляете'
  },
  {
    id: '2',
    title: 'Наш звонок',
    description: 'Берем и звоним'
  },
  {
    id: '3',
    title: 'Заключаем договор',
    description: 'Берем и подписываем'
  },
  {
    id: '4',
    title: 'Забираем груз',
    description: 'Берем и забираем'
  },
  {
    id: '5',
    title: 'Экспорт',
    description: 'Берем и экспортируем'
  },
  {
    id: '6',
    title: 'Доставка клиенту',
    description: 'Берем и привозим'
  }
]);
