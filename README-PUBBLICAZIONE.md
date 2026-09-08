# Il sito online

Indirizzo: **https://italians-in-ireland.github.io**

Repository: https://github.com/italians-in-ireland/italians-in-ireland.github.io
(organizzazione GitHub gratuita `italians-in-ireland`, di cui sei proprietario;
GitHub Pages pubblica automaticamente il ramo `main`, cartella radice).

## Provarlo in locale prima di pubblicare
Da dentro questa cartella:

    python3 -m http.server 8000

poi apri http://localhost:8000 . Serve un server: aprendo `index.html` con un
doppio clic il browser blocca il caricamento dei dati.

## Quando aggiorni i dati
Il file di lavoro resta quello grande da 128 MB: continua a usarlo con
`apply_data.py`, `apply_locations.py` ecc. Poi, dalla cartella del progetto:

    python3 _TABELLE/build_web.py "Italians in Ireland - censimenti aggiornati.html" --base-url https://italians-in-ireland.github.io
    python3 _TABELLE/add_colophon.py --dir web --base-url https://italians-in-ireland.github.io
    python3 _TABELLE/harden_web.py --dir web

Il secondo comando va sempre rilanciato dopo il primo: `build_web.py` rigenera
`index.html` e `app.js` dal file di lavoro e cancella il colofone della home
(citazione, nota sulle persone viventi, licenza), che `add_colophon.py`
reinserisce. Entrambi sono idempotenti.

## Come mandare online le modifiche
Con GitHub Desktop: clona una volta il repository qui sopra, copia dentro il
contenuto aggiornato di `web/`, scrivi un messaggio di commit e premi
*Push origin*. Il sito si aggiorna da solo in un minuto circa.

Per una correzione minima (un refuso in `index.html`) si puo' anche modificare
il file direttamente su github.com, con la matita in alto a destra.

Il terzo comando, `harden_web.py`, va anch'esso rilanciato dopo ogni build:
toglie dal `<head>` i richiami a Cloudflare e a Google Fonts e li sostituisce
con le copie locali in `web/vendor/` e `web/fonts/`, mette il testo alternativo
sulle fotografie e le etichette sui filtri. La prima volta scarica i file (serve
la rete); dalle volte successive li trova gia' sul posto. E' idempotente.

## Nota
`build_web.py` riscrive questo README a ogni esecuzione con la sua versione
generica: se lo modifichi, tieni una copia.
