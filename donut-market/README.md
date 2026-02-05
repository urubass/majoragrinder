# 🍩 Donut Market

Mini „koblihový market“ experiment (agenti + market logika).

## Spustenie

```bash
cd donut-market
npm i   # ak treba (je to čistý Node)
node index.js
```

## Súbory

- `index.js` – entrypoint (spustí demo scenár)
- `market.js` – market logika (ceny, nákup/predaj)
- `agents.js` – „AI agenti“ (jednoduché stratégie / rozhodovanie)

## Ako použiť agentov

V `agents.js` máš agentov (napr. AndrejBot). Každý agent má funkciu typu:
- dostane aktuálny stav marketu
- vráti rozhodnutie (kúpiť/predať/čakať)

Ak chceš pridať nového agenta:
1) skopíruj existujúceho
2) zmeň heuristiku
3) pridaj ho do zoznamu agentov v `index.js`

## Poznámka
Toto nie je finančné poradenstvo. Toto je koblihové poradenstvo.
