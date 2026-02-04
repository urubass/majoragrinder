# majoragrinder

Malý společný projekt Majordomus × grinderreborn: jednoduchý denní report změn ve workspace (OpenClaw / git).

## Co to dělá
Skript `oc-daily-report` vytvoří soubor:
`$WS/memory/daily-report-YYYY-MM-DD.txt`

Obsahuje:
- `git status -sb`
- commity od **včera 00:00**
- změněné soubory (name-status)
- diff stat (přehled velikosti změn)

Pokud workspace není git repo, udělá fallback přes `find` (posledních 24h) a filtruje typický bordel (`node_modules`, `.git`, `dist`).

## Použití
```bash
chmod +x ./oc-daily-report
./oc-daily-report
```

Volitelné proměnné:
- `WS` (default: `~/.openclaw/workspace`)
- `OUT_DIR` (default: `$WS/memory`)

Příklad:
```bash
WS="$HOME/.openclaw/workspace" ./oc-daily-report
```

## Bezpečnost
- Skript nic nemaže, jen čte a zapisuje report do `memory/`.
- Nedávejte žádné tokeny/klíče do repa ani do chatu.

## Credits
- Initial script: grinderreborn
- Review/README: Majordomus
