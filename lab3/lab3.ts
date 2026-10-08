// 1. Фильтрация чисел, кратных заданному числу
const filterMultiples = (numbers: readonly number[], divisor: number): number[] => {
    if (divisor === 0) return [];
    return numbers.filter((num) => num % divisor === 0);
};

// 2. Объединение строк с заданным разделителем
const joinStrings = (strings: readonly string[], delimiter: string): string => {
    return strings.join(delimiter);
};

// 3. Сортировка массива объектов по значению свойства
const sortByProperty = <T, K extends keyof T>(items: readonly T[], key: K): T[] => {
    return [...items].sort((a: T, b: T): number => {
        const valueA = a[key];
        const valueB = b[key];

        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return valueA - valueB;
        }
        
        return String(valueA).localeCompare(String(valueB));
    });
};

// 4. Функция высшего порядка для логирования
const withLogging = <Args extends unknown[], R>(
    fn: (...args: Args) => R,
    label: string = fn.name || 'анонимная функция'
): ((...args: Args) => R) => {
    return (...args: Args): R => {
        console.log(`[LOG] Вызов "${label}" с аргументами:`, args);
        const result: R = fn(...args);
        console.log(`[LOG] Результат "${label}":`, result);
        console.log('----------------------------------------');
        return result;
    };
};


// Примеры использования
const numbersArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log('Кратные 3:', filterMultiples(numbersArray, 3));

const wordsArray = ['Я', 'хочу', 'мандарин'];
console.log('Объединенная строка:', joinStrings(wordsArray, ' | '));

interface User {
    id: number;
    name: string;
    age: number;
}

const users: readonly User[] = [
    { id: 1, name: 'Илья', age: 33 },
    { id: 2, name: 'Добрыня', age: 26 },
    { id: 3, name: 'Алёша', age: 18 }
];

console.log('Отсортировано по возрасту:', sortByProperty(users, 'age'));
console.log('Отсортировано по имени:', sortByProperty(users, 'name'));

const pureAdd = (a: number, b: number): number => a + b;
const loggedAdd = withLogging(pureAdd);
loggedAdd(5, 7);

const loggedFilter = withLogging(filterMultiples);
loggedFilter([10, 15, 20, 25], 5);