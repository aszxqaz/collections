// const MIN_DATE = new Date(0);
// const MIN_YEAR = MIN_DATE.getFullYear().toString();

// function validateDateInput(s) {
//   if (s == '') return true;
//   if (s.length == 10) {
//     return new Date(s).toString() != 'Invalid Date';
//   }
//   if (s.length > 10) return false;
//   if (s.length <= 4) {
//     if (!['1', '2'].includes(s[0])) return false;
//     return Number(MIN_YEAR.slice(0, s.length)) <= Number(s);
//   }
//   if (s.length >= 5 && s[4] != '-') return false;
//   if (s.length >= 6 && Number(s[5]) > 1) return false;
//   if (s.length >= 7 && Number(s[5]) * 10 + Number(s[6]) > 12) return false;
//   if (s.length >= 8 && s[7] != '-') return false;
//   if (s.length >= 9 && Number(s[8]) > 3) return false;
//   return true;
// }

// console.log(validateDateInput('')); // true
// console.log(validateDateInput('a')); // // false
// console.log(validateDateInput('9')); // false
// console.log(validateDateInput('1')); // true
// console.log(validateDateInput('2')); // true
// console.log(validateDateInput('3')); // false
// console.log(validateDateInput('1920')); // false
// console.log(validateDateInput('1980')); // true
// console.log(validateDateInput('1980-01-01')); // true
// console.log(validateDateInput('1980-12-101')); // true

// console.log(`${undefined}`);

// const getRegex = query => new RegExp(`(^\\s*${query})|(\\s+${query})`, 'mi');

// const regex = getRegex('bird');

// console.log(regex.test('Bird')); // true
// console.log(regex.test(' bird')); //true
// console.log(regex.test('\nbird')); // true
// console.log(regex.test('mockingbird')); // false
// console.log(regex.test('\nmockingbird')); // false
// console.log(regex.test('\nmocking\nbird')); // true
// console.log(regex.test('\nmocking\n bird')); // true

// const pathname = '/collection/item';

// const segments = pathname.split('/').filter(s => s);
// const links = segments.reduce((acc, segment) => {
//   return [...acc, `${acc[acc.length - 1] || ''}/${segment}`];
// }, []);

// console.log(links);

//
