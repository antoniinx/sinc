# Kalendář s AI Asistentem

Moderní webový kalendář s integrovaným AI asistentem pro vytváření událostí přirozeným jazykem.

## Funkce

- 📅 **Kalendářové zobrazení** - denní, týdenní, měsíční
- 🤖 **AI Asistent** - vytváření událostí pomocí přirozeného jazyka
- 👥 **Skupiny** - veřejné a soukromé skupiny
- 👫 **Přátelé** - správa přátel a sdílené události
- 🎨 **Moderní UI** - responzivní design s Tailwind CSS

## Technologie

### Frontend
- React.js
- Tailwind CSS
- React Big Calendar
- React Hook Form
- Axios

### Backend
- Node.js
- Express.js
- SQLite
- JWT Authentication
- Hugging Face AI

## Nasazení

### Lokální vývoj

1. **Backend:**
```bash
cd backend
npm install
npm start
```

2. **Frontend:**
```bash
cd frontend
npm install
npm start
```

### Produkční nasazení

- **Frontend:** Vercel
- **Backend:** Vercel/Railway
- **Databáze:** Supabase

## Environment Variables

### Backend (.env)
```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=production
HUGGING_FACE_TOKEN=your_hugging_face_token
```

### Frontend (.env)
```
REACT_APP_API_URL=your_backend_url
```

## AI Asistent

AI asistent podporuje vytváření událostí pomocí přirozeného jazyka:
- "zítra v 15:30 jdu k doktorovi"
- "schůzka v pondělí od 9 do 11"
- "oběd s klienty ve čtvrtek"

## Autor

Vytvořeno s ❤️ pro moderní správu kalendáře