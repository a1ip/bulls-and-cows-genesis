// генератор возвращает случайный пароль из второго аргумента склееные в строку длинной lenght, БЕЗ ПОВТОРОВ!
module.exports = (length, passlist = "0123456789") => {
  let base = Array.from(passlist);
  let res = '';
  if (isNaN(length) || length < 1) length = 4;
  if (length > base.length) length = base.length;

  for (let i = 0; i < length; i++) {
      n = Math.floor(Math.random() * base.length);
      res += base[n];
      base.splice(n, 1);
  }

  return res
}