# Shared Calendar Backend

Backend pro sdílený kalendář aplikaci s Node.js, Express a PostgreSQL.

## Instalace

1. Nainstalujte závislosti:
```bash
npm install
```

2. Nastavte PostgreSQL databázi:
   - Vytvořte databázi `shared_calendar`
   - Spusťte migrace z `database/migrations.sql`

3. Vytvořte `.env` soubor:
```
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/shared_calendar
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

## Spuštění

Pro vývoj:
```bash
npm run dev
```

Pro produkci:
```bash
npm start
```

Server běží na portu 5000.

## API Endpoints

### Autentizace
- `POST /api/auth/register` - Registrace
- `POST /api/auth/login` - Přihlášení
- `POST /api/auth/logout` - Odhlášení
- `GET /api/auth/me` - Získat aktuálního uživatele

### Kontakty
- `GET /api/contacts` - Získat kontakty
- `GET /api/contacts/search?q=query` - Vyhledat uživatele
- `POST /api/contacts` - Přidat kontakt
- `DELETE /api/contacts/:contactId` - Odebrat kontakt

### Skupiny
- `GET /api/groups` - Získat skupiny
- `GET /api/groups/:groupId` - Získat skupinu s členy
- `POST /api/groups` - Vytvořit skupinu
- `PUT /api/groups/:groupId` - Upravit skupinu
- `DELETE /api/groups/:groupId` - Smazat skupinu
- `POST /api/groups/:groupId/members` - Přidat člena
- `DELETE /api/groups/:groupId/members/:userId` - Odebrat člena

### Události
- `GET /api/events` - Získat události
- `GET /api/events/group/:groupId` - Získat události skupiny
- `GET /api/events/:eventId` - Získat událost s detaily
- `POST /api/events` - Vytvořit událost
- `PUT /api/events/:eventId` - Upravit událost
- `DELETE /api/events/:eventId` - Smazat událost
- `PUT /api/events/:eventId/attend` - Upravit účast

### Komentáře
- `GET /api/comments/event/:eventId` - Získat komentáře
- `POST /api/comments` - Přidat komentář
- `PUT /api/comments/:commentId` - Upravit komentář
- `DELETE /api/comments/:commentId` - Smazat komentář
