module.exports = {
    // проверка на содержащиеся повторные символы
    check_repeats (str) {
        for (let i = 0; i < str.length - 1; i++) {
            if (str.indexOf(str[i], i + 1) >= 0) {
                return true;
            }
        };
        return false;
    },
    // генерация 4 значного пароля в рамках заданой системы счисления
    generator (system = 10) {
        let base = [...'0123456789ABCDEF'].slice(0, system)
        let res = '';
        let n;

        while (res.length < 4) {
            n = ~~(Math.random() * system);
            res += base.splice(n, 1);
        };
      
        return res;
    },
    // проверка количества вхождений первого элемента во втором
    check_result (input, secret) {
        let bulls = 0, cows = 0;
        for (let i = 0; i < secret.length; i++) {
            if (input[i] == secret[i]) {
                bulls++;
            } else if (secret.indexOf(input[i]) >= 0) {
                cows++;
            };
        };
        return (bulls == secret.length) ? { win: 1 } : { bulls, cows };
    }
} ;
