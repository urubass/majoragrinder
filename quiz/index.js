const readline = require('readline');
const os = require('os');

// Colors
const RESET = "\x1b[0m";
const BRIGHT = "\x1b[1m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const CYAN = "\x1b[36m";

const questions = [
  {
    q: "Kdo za všechno může v tomhle státě i v tomhle kódu?",
    options: ["Špatné počasí", "Programátor", "Kalousek a tradičníci"],
    correct: 2,
    msg: "Přesně tak! Za všechno můžou oni!"
  },
  {
    q: "Co chceme mít znova na našich polích, protože máme rádi přírodu?",
    options: ["Betonové haly", "Motýle", "Pesticidy"],
    correct: 1,
    msg: "Správně! My chceme znova motýle!"
  },
  {
    q: "Kolik dotací je pro naše impérium tak akorát?",
    options: ["Jedna malá", "Žádná", "Všechny a ještě víc, protože my makáme!"],
    correct: 2,
    msg: "Ano! Cinká to! 💰"
  },
  {
    q: "Kde se nejlépe přemýšlí o budoucnosti hnutí ANO?",
    options: ["V kanceláři v Praze", "Na Čapím hnízdě", "V Bruselu"],
    correct: 1,
    msg: "Samozřejmě! Čapák je symbol!"
  },
  {
    q: "Co dělá Andrej Babiš, když vy všichni ostatní spíte?",
    options: ["Kouká na televizi", "Spí taky", "Maká pro lidi 18 hodin denně!"],
    correct: 2,
    msg: "Přesně! 18 hodin denně! Žádný spánek!"
  },
  {
    q: "Co je v programování nejhorší, stejně jako v politice tradičních stran?",
    options: ["Špatná káva", "Bugy a korupce v systému", "Málo barev na monitoru"],
    correct: 1,
    msg: "Ano! Musíme to opravit! Všechno přepsat!"
  },
  {
    q: "Jaký je rozdíl mezi 'Clean Code' a mým štítem?",
    options: ["V kódu jsou mezery", "Žádný, obojí je naprosto čisté!", "Kód se dá opravit"],
    correct: 1,
    msg: "Samozřejmě! Čistota je základ státu i kódu!"
  },
  {
    q: "Proč je Open Source jako hnutí ANO?",
    options: ["Protože je to zadarmo", "Protože je to pro lidi a každý šikovný se může zapojit!", "Protože je to open"],
    correct: 1,
    msg: "Přesně tak! Je to pro lidi! 🇨🇿"
  }
];

let score = 0;
let currentQ = 0;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function clearScreen() {
  console.clear();
  console.log(`${YELLOW}${BRIGHT}
   _____      _           _
  / ____|    (_)         | |
 | |  __ _ __ _ _ __   __| | ___ _ __
 | | |_ | '__| | '_ \\ / _\` |/ _ \\ '__|
 | |__| | |  | | | | | (_| |  __/ |
  \\_____|_|  |_|_| |_|\\__,_|\\___|_|${RESET}
  -------------------------------------
  ${CYAN}${BRIGHT}BABIŠ & GRINDER SUPER KVÍZ${RESET}
  -------------------------------------
  `);
}

function askQuestion() {
  if (currentQ >= questions.length) {
    finishQuiz();
    return;
  }

  const q = questions[currentQ];
  console.log(`\n${BRIGHT}Otázka ${currentQ + 1}:${RESET} ${q.q}\n`);
  
  q.options.forEach((opt, i) => {
    console.log(`  ${YELLOW}${i + 1})${RESET} ${opt}`);
  });

  rl.question(`\n${CYAN}Tvoje volba (1-3): ${RESET}`, (answer) => {
    const choice = parseInt(answer) - 1;
    
    if (choice === q.correct) {
      console.log(`\n${GREEN}${BRIGHT}✅ ${q.msg}${RESET}`);
      score++;
    } else {
      console.log(`\n${RED}${BRIGHT}❌ SORRY JAKO! To je kampaň!${RESET}`);
      console.log(`Správně bylo: ${q.options[q.correct]}`);
    }

    setTimeout(() => {
      currentQ++;
      clearScreen();
      askQuestion();
    }, 2000);
  });
}

function finishQuiz() {
  clearScreen();
  console.log(`${BRIGHT}KONEC KVÍZU!${RESET}\n`);
  console.log(`Tvoje skóre: ${YELLOW}${score} / ${questions.length}${RESET}`);

  if (score === questions.length) {
    console.log(`\n${GREEN}${BRIGHT}🏆 GRATULUJEME! Jsi pravý srdcař Hnutí!${RESET}`);
    console.log("Máš nárok na koblihu a funkci ministra!");
  } else if (score > 2) {
    console.log(`\n${YELLOW}Není to špatné, ale chce to víc makat!${RESET}`);
  } else {
    console.log(`\n${RED}To je katastrofa! Ty jsi snad od Kalouska?!${RESET}`);
  }
  
  rl.close();
}

clearScreen();
askQuestion();
