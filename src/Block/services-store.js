import { writable } from 'svelte/store';

export const services = writable([
  {
    id: '1',
    title: 'Морские <br>грузоперевозки',
    price: '',
    description: '- Условия FOB и EXW<br>- Из любого порта Китая<br>- Фиксированная ставка'
  },
  {
    id: '2',
    title: 'Оплата <br>на производство',
    price: '',
    description: '- В различной валюте (¥, $)<br>- Срок 7 дней<br>- Только для юр. лиц'
  },
  {
    id: '3',
    title: 'Таможенное <br>оформление',
    price: '',
    description: '- 100% официально <br>- Оптимизация платежей <br>- Пакет документов'
  },
  {
    id: '4',
    title: 'Негабаритные <br>грузы',
    price: '',
    description: '<b>Минимальный вес</b>: 50 кг<br><b>Срок</b>: от 60 дней'
  }
]);
