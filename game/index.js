const rls = require('readline-sync');
const dayjs = require('dayjs');

const { generator, check_repeats, check_result } = require('./functions');
const { RESET, BRIGHT, RED, GREEN, YELLOW } = require('./ansi_styles.js');
const { read_logs, write_logs } = require('./logger.js');
const { ENG, RUS } = require('./game_strings.js');

module.exports = class Game {
  constructor (difficulty = 10, debug = true) {
    this.secret = '';
    this.hardness = difficulty; // тут решаем какая система счисления
    this.turns = 0;
    this.player_text = null;
    this.debug = debug;
    this.txt = ENG;
    this.stats = [];
    this.cmds = [
      this.play,
      this.set_difficulty,
      this.set_language,
      this.printStats,
      this.clearStats,
      this._splashScreen,
      this.exit
    ];
            
    this._splashScreen();
  };

  _splashScreen = () => {
    console.clear();
    console.log(
      '\n', BRIGHT, this.txt.GAMENAME, RESET, '\n\n',
      YELLOW + this.txt.RULES + RESET, '\n',
      this.txt.RULE1, '\n\n',
      this.txt.RULE2, '\n',
      this.txt.RULE3, '\n'
    );

    rls.keyInPause(this.txt.PRESSSPACE, {guide: false});
    this.menu();
  }

  menu = () => {
    console.clear();
    console.log('\n', BRIGHT, YELLOW, this.txt.MENU_TEXT, RESET);
    const select = rls.keyInSelect([
      this.txt.MENU_PLAY,
      this.txt.MENU_DIFF.replace('%HARDNESS', YELLOW + this.hardness + RESET),
      this.txt.MENU_LANG.replace('%CURRENT', YELLOW + (this.txt === ENG ? 'ENG' : 'RUS') + RESET),
      this.txt.MENU_SHOWSTATS,
      this.txt.MENU_CLEARSTATS,
      this.txt.MENU_SHOWRULES,
      this.txt.EXIT
    ], this.txt.YOUR_CHOICE, { cancel: false });
    
    this.cmds[select]()
  }

  play = () => {
    console.clear();
    console.log(this)
    this.game_reset();
    this.player_turn();
    this.afterGameMenu();
  }

  set_difficulty = (key) => {
    console.clear();
    console.log(
      '\n', BRIGHT, this.txt.DIFFICULTY_TEXT, RESET, '\n\n',
      `[${YELLOW}1${RESET}] <-- --> [${YELLOW}2${RESET}] ${this.txt.ACCEPT}: [${YELLOW + this.txt.SPACE + RESET}]\n\n`
    );
    while (true) {
      console.log('   \x1B[1A\x1B[K|' + GREEN + BRIGHT +
        (new Array(this.hardness-5)).join('==') + RESET +
        (new Array(16 - this.hardness + 1)).join('..') + '| ' + YELLOW + this.hardness + RESET
      );
      
      key = rls.keyIn('', {hideEchoBack: true, mask: '', limit: '12 '});

      if (key === '1' && this.hardness > 6) this.hardness--;
      else if (key === '2' && this.hardness < 16) this.hardness++;
      else if (key === ' ') break; 
    }
    this.menu();
  }

  set_language = () => {
    this.txt = this.txt === ENG ? RUS : ENG;
    this.menu();
  }
  
  game_reset = () => {
    this.secret = generator(this.hardness);
    this.debug ? console.log(BRIGHT + RED + 'DEBUG:' + RESET, 
      this.txt.DEBUG_TEXT.replace('%CODE', YELLOW + this.secret + RESET)
    ) : null;
    this.turns = 0;
  }

  player_turn = (text = '') => {
    let input = rls.question((text ? text : this.txt.SOLVE_TEXT + '\n').replace('%X', YELLOW + '0123456789ABCDEF'[this.hardness-1] + RESET)).toUpperCase();
    this.turns++;

    if (input === '' && rls.keyInYNStrict(BRIGHT + this.txt.RLY_SURREND + RESET)) {
      console.log(this.txt.SURRENDER
        .replace('%TURNS', GREEN + this.turns + RESET)
        .replace('%SECRET', YELLOW + this.secret + RESET)
      );
      write_logs({ date: dayjs().format('DD/MM/YYYY HH:mm:ss'), win: 0, turns: this.turns, secret: this.secret });
      return;
    };

    if (input != null && input.length === 4 && !check_repeats(input)) {
      const { win, bulls, cows } = check_result(input, this.secret);
        if (win) {
          console.log(
            BRIGHT + GREEN + this.txt.WIN_TEXT1.replace('%SECRET', YELLOW + this.secret + GREEN), RESET + '\n' +
            this.txt.WIN_TEXT2.replace('%TURNS', YELLOW + this.turns + RESET)
          );
          write_logs({ date: dayjs().format('DD/MM/YYYY HH:mm:ss'), win, turns: this.turns, secret: this.secret });
        } else {
          this.player_turn(
            this.txt.SOLVE_TURN
              .replace('%INPUT', GREEN + BRIGHT + input + RESET)
              .replace('%BULLS', YELLOW + bulls + RESET)
              .replace('%COWS', YELLOW + cows + RESET)
            + '\n'
          );
        };
    } else {
      this.player_turn(this.txt.SOLVE_ERROR + '\n');
    };
  };

  printStats = () => {
    let stats = read_logs();
    let wins = 0, loses = 0, winrate, games = '';
    console.clear();
    console.log(BRIGHT, this.txt.STATS, RESET);

    if (stats.length) {
      stats.forEach(stat => {
        stat.win ? wins++ : loses++;
        games += stat.date + ' - ' + BRIGHT + (stat.win ? GREEN + this.txt.WIN : RED + this.txt.LOSE) + RESET + ' - ' + 
          this.txt.STAT_TEXT
            .replace('%SECRET', YELLOW + stat.secret + RESET)
            .replace('%TURNS', YELLOW + stat.turns + RESET)
            .replace('%HARDNESS', YELLOW + stat.secret.length + RESET + '\n')
      });
  
      winrate = (wins / (wins + loses) * 100).toFixed(0);
      console.log(
        this.txt.STATS_SUMMARY
          .replace('%ALL', YELLOW + (wins+loses) + RESET)
          .replace('%WINS', GREEN + wins + RESET)
          .replace('%WINRATE', GREEN + winrate + '%' + RESET)
          .replace('%LOSES', RED + loses + RESET)
        + '\n' + games
      );
    } else {
      console.log(this.txt.NO_STATS);
    };

    rls.keyInPause(this.txt.PRESSSPACE, {guide: false});
    this.menu();
  };

  clearStats = () => {
    write_logs();
    console.clear();
    console.log(YELLOW + this.txt.STATS_IS_CLEAR + RESET + '\n');
    rls.keyInPause(this.txt.PRESSSPACE, {guide: false});
    this.menu();
  };

  afterGameMenu = () => {
    if (rls.keyInYNStrict(BRIGHT + this.txt.PLAY_AGAIN + RESET)) {
      this.play();
    } else {
      this.menu();
    };
  };

  exit = () => {
    console.log('\n', YELLOW, BRIGHT, this.txt.GAME, this.txt.EXIT, RESET, '\n');
  };
};
