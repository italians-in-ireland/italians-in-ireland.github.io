# Il sito online

Indirizzo: https://italians-in-ireland.github.io
GitHub Pages pubblica automaticamente il ramo main, cartella radice.

## Provarlo in locale
Dalla cartella web del progetto lancia: python3 -m http.server 8000
Poi apri http://localhost:8000 . Serve un server: con il doppio clic su index.html il browser blocca il caricamento dei dati.

## Quando aggiorni i dati
Il file di lavoro resta quello grande da 128 MB, con apply_data.py, apply_locations.py e gli altri script. Dopo averlo aggiornato, dalla cartella del progetto:

python3 _TABELLE/build_web.py "Italians in Ireland - censimenti aggiornati.html" --base-url https://italians-in-ireland.github.io

python3 _TABELLE/add_colophon.py --dir web --base-url https://italians-in-ireland.github.io

Il secondo comando va sempre rilanciato dopo il primo: build_web.py rigenera index.html e app.js dal file di lavoro e cancella il colofone della home (citazione, nota sulle persone viventi, licenza), che add_colophon.py reinserisce. Entrambi sono idempotenti.

## Come mandare online le modifiche
Con GitHub Desktop: clona questo repository, copia dentro il contenuto aggiornato della cartella web, scrivi un messaggio di commit e premi Push origin. Il sito si aggiorna da solo in un minuto circa. Per una correzione minima si puo' modificare il file direttamente su github.com, con la matita in alto a destra.
