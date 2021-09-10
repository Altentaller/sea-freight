import { writable } from 'svelte/store';

export const services = writable([
  {
    id: '1',
    title: 'Морские <br>грузоперевозки',
    price: 9.99,
    description: '<b>Минимальный вес</b>: 50 кг<br><b>Срок</b>: от 60 дней'
  },
  {
    id: '2',
    title: 'Ж/Д <br>перевозки',
    price: 99.99,
    description: '<b>Минимальный вес</b>: 50 кг<br><b>Срок</b>: от 60 дней'
  },
  {
    id: '3',
    title: 'Таможенное <br>оформление',
    price: 99.99,
    description: '<b>Минимальный вес</b>: 50 кг<br><b>Срок</b>: от 60 дней'
  },
  {
    id: '4',
    title: 'Негабаритные <br>грузы',
    price: 99.99,
    description: '<b>Минимальный вес</b>: 50 кг<br><b>Срок</b>: от 60 дней'
  }
]);
