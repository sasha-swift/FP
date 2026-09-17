// ----------------  ЧИСТЫЕ ФУНКЦИИ 
const filterEven = (numbers) => numbers.filter((n) => n % 2 === 0);

const square = (numbers) => numbers.map((n) => n * n);

const filterByProperty = (objects, prop) => objects.filter((obj) => Object.hasOwn(obj, prop));

const sum = (numbers) => numbers.reduce((acc, n) => acc + n, 0);

const average = (numbers) => numbers.length === 0 ? 0 : sum(numbers) / numbers.length;

// ---------------- ФУНКЦИЯ ВЫСШЕГО ПОРЯДКА
const applyToEach = (fn, array) => array.map(fn);

// ----------------  МАТЕМАТИЧЕСКИЕ ОПЕРАЦИИ
const sumOfSquaresOfEven = (numbers) => sum(square(filterEven(numbers)));

// Среднее значения key > threshold
const averageGreaterThan = (objects, key, threshold) =>
  average(objects.filter((obj) => obj[key] > threshold).map((obj) => obj[key]));


// ---------------- КОНСОЛЬ
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log('Исходный массив:', numbers);
console.log('Чётные числа:', filterEven(numbers));
console.log('Квадраты чисел:', square(numbers));
console.log('Сумма чисел:', sum(numbers));

const doubled = applyToEach((n) => n * 2, numbers);
console.log('Умножение каждого элемента на 2:', doubled);

const dogs = [
  { name: 'Арчи', awards: 4, age: 3 },
  { name: 'Рекс', age: 5 },
  { name: 'Ричи', awards: 2, age: 1 },
  { name: 'Рокки', age: 7 },
  { name: 'Джек', awards: 1, age: 2 },
];
console.log('Исходный массив:', dogs);
console.log('Объекты со свойством "awards":', filterByProperty(dogs, 'awards'));

// Задание 3
console.log('Сумма квадратов чётных чисел:', sumOfSquaresOfEven(numbers));
console.log('Средний возраст собак старше двух лет:', averageGreaterThan(dogs, 'age', 2));