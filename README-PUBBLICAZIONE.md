# Come pubblicare il sito

La cartella `web/` e' gia' completa: sono file statici, non serve nessun
programma sul server.

## Provarlo prima in locale
Da dentro questa cartella:

    python3 -m http.server 8000

poi apri http://localhost:8000 . Serve un server: aprendo `index.html` con
un doppio clic il browser blocca il caricamento dei dati.

## Metterlo online
- **GitHub Pages**: crea un repository, copia dentro il contenuto di `web/`,
  attiva Pages sul ramo principale. Il file `.nojekyll` e' gia' presente.
- **Netlify / Cloudflare Pages**: trascina la cartella `web/` nella pagina di
  deploy.

## Dopo aver scelto l'indirizzo
Le meta per l'anteprima su Facebook contengono ancora il segnaposto
`__BASE_URL__`. Rigenera con l'indirizzo vero:

    python3 _TABELLE/build_web.py "Italians in Ireland - censimenti aggiornati.html" --base-url https://iltuoindirizzo

Finche' resta il segnaposto, il link condiviso non mostrera' l'immagine di
anteprima.

## Quando aggiorni i dati
Il file di lavoro resta quello grande da 128 MB: continua a usarlo con
`apply_data.py`, `apply_locations.py` ecc. Poi rilancia `build_web.py` per
rigenerare `web/`.
