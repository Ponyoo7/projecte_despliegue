# Projecte d'Autenticació i Exposicions (Grupsexpress)

Aquest projecte és una aplicació web desenvolupada amb Express.js i MongoDB que gestiona exposicions temporals, pintors, quadres i museus. Inclou un sistema d'autenticació complet i està preparada per al desplegament en contenidors (Docker) i plataformes serverless (Vercel).

## 🚀 Posada en marxa

### Requisits previs
- Node.js (v22 o superior)
- MongoDB
- Docker i Docker Compose (opcional)

### 🌍 Arrancar en Producció

Per desplegar l'aplicació en un entorn de producció:

1. Clonar el repositori.
2. Configurar les variables d'entorn (veure `.env.example`).
3. Instal·lar dependències:
   ```bash
   npm install --production
   ```
4. Executar l'aplicació:
   ```bash
   npm start
   ```

Alternativament, si utilitzeu Vercel, el desplegament és automàtic mitjançant el fitxer `vercel.json` i la integració amb GitHub.

### 🐳 Arrancada amb Docker (Desenvolupament)

Per a un entorn de desenvolupament aïllat amb recàrrega automàtica (Hot Reload):

1. Assegureu-vos de tenir Docker Desktop funcionant.
2. Executeu:
   ```bash
   docker compose up --watch
   ```
   Això aixecarà els contenidors de l'aplicació i de la base de datos MongoDB. Els canvis al codi es sincronitzaran automàticament.

Per a una arrencada estàndard sense *watch mode*:
```bash
docker compose up --build
```

### 💾 Inicialització de la Base de Dades

El projecte no utilitza un sistema de migracions extern (com Sequelize o Knex), ja que utilitza Mongoose (ODM). L'estructura de la base de dades es defineix als models (`/models`).

**Seeders (Dades inicials):**
La inicialització de les dades bàsiques es realitza automàticament en connectar-se a la base de dades.
- L'arxiu `lib/db.js` conté la funció `createAdminUser()`.
- Quan l'aplicació s'inicia, comprova si existeix l'usuari administrador (definit a les variables d'entorn `ADMIN_USER`). Si no existeix, el crea automàticament.

## 🤝 Contribució

Si voleu col·laborar en aquest projecte, si us plau consulteu el fitxer [CONTRIBUTING.md](CONTRIBUTING.md) per a més detalls sobre com fer *Pull Requests* i reportar problemes.

## 📄 Llicència

Aquest projecte està sota la llicència [MIT](LICENSE).

## 🐛 Issues

Per reportar bugs o sol·licitar noves funcionalitats, utilitzeu la pestanya [Issues](https://github.com//Ponyoo7/projecte_despliegue/issues) d'aquest repositori.
