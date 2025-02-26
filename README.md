# Applicazione di Gestione Query SQL

Questa applicazione permette di gestire ed eseguire query SQL attraverso un'interfaccia web realizzata con React e Vite, collegandosi a un backend Python Flask.

## Cosa fa l'applicazione

Quest'applicazione consente di:
- Visualizzare informazioni su persone, corsi e iscrizioni nel database
- Cercare persone specifiche attraverso il nome
- Visualizzare i dettagli dei corsi disponibili
- Vedere le iscrizioni ai corsi con relative informazioni

## Prerequisiti

Prima di procedere, assicurati di avere installato:

- [Node.js](https://nodejs.org/) (v14 o successiva)
- [npm](https://www.npmjs.com/) (v6 o successiva) (installato automaticamente con Node.js)
- [Python](https://www.python.org/) (v3.6 o successiva)
- [pip](https://pip.pypa.io/en/stable/installation/) (gestore pacchetti Python)

### Comandi di installazione
```bash
# Installare Node.js e npm
sudo apt update
sudo apt install nodejs npm

# Verificare l'installazione
node --version
npm --version

# Installare Python e pip
sudo apt install python3 python3-pip

# Verificare l'installazione
python3 --version
pip3 --version
```

## Guida all'installazione

### 1. Preparazione dell'ambiente

Clona o scarica il repository nella tua macchina locale e naviga alla directory del progetto:


### 2. Installazione dipendenze del frontend (React)

Nella directory principale del progetto esegui:

```bash
npm install
```

Questo installerà tutte le dipendenze React necessarie come specificato nel file `package.json`.

### 3. Installazione dipendenze del backend (Python)

Nella directory del progetto, installa Flask e altre dipendenze Python necessarie:

```bash
pip install flask
pip install sqlite3
```

### 4. Struttura del database

Assicurati che il database SQLite sia presente nella directory corretta:
- Il file `accademia.db` dovrebbe trovarsi nella cartella `/db`
- Se non è presente, crea la directory `db` e posiziona lì il file del database

## Avvio dell'applicazione

### 1. Avvio del server backend

Prima di tutto, avvia il server Python Flask che gestisce le chiamate API:

```bash
python scripts/chiamata.py
```

Il server sarà attivo su `http://127.0.0.1:8080`

### 2. Avvio del frontend React

Apri un nuovo terminale (mantieni il server Python in esecuzione) e avvia l'applicazione React:

```bash
npm run dev
```

L'applicazione web sarà disponibile all'indirizzo `http://localhost:5173`

## Utilizzo dell'applicazione

1. **Home Page**: Visualizza la dashboard principale con i pulsanti per accedere alle diverse funzionalità

2. **Persone**: Visualizza l'elenco completo delle persone presenti nel database
   - Puoi cercare persone specifiche utilizzando la barra di ricerca

3. **Corsi**: Mostra tutti i corsi disponibili con dettagli come:
   - Nome del corso
   - Docente
   - Crediti e ore
   - Numero di iscritti

4. **Iscrizioni**: Visualizza tutte le iscrizioni ai corsi con:
   - Nome e cognome dello studente
   - Corso associato
   - Data di iscrizione
   - Voto (se disponibile)

## Funzionamento tecnico

L'applicazione è strutturata in due parti principali:

1. **Backend (Python/Flask)**:
   - Gestisce la connessione al database SQLite
   - Espone API REST per l'accesso ai dati
   - Implementa la logica di business per query e ricerche

2. **Frontend (React/Vite)**:
   - Fornisce un'interfaccia utente reattiva
   - Comunica con il backend tramite chiamate API
   - Visualizza i dati in modo strutturato e facilmente navigabile


## Note per gli sviluppatori

- Il codice del backend si trova in `scripts/chiamata.py`
- I componenti React sono nella directory `src/`
- Il database SQLite è in `db/accademia.db`
