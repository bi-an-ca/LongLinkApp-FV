# LongLink - Love that travels with you

A beautiful, mobile-first MVP app designed for long-distance couples to stay emotionally connected through daily communication and shared moments.

![LongLink](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![Built with React](https://img.shields.io/badge/React-18.3.1-blue) ![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## ✨ Core Features

- **Real-Time Chat** - Private messaging with emoji reactions
- **Mood Check-Ins** - Daily emotional tracking with 8 different moods
- **Time Zone Display** - See both partners' current times at a glance
- **Memories Feed** - Private timeline for sharing photos, notes, and moments
- **Daily Prompts** - Thoughtful conversation starters to stay connected

## 🎨 Design

- Soft pastel color palette (pink, rose, amber)
- Mobile-first responsive layout
- Bottom navigation for easy one-handed use
- Smooth animations and transitions
- Clean, minimalist aesthetic

## 🚀 Quick Start

### Try Demo Mode

No setup required! Just run:
```bash
npm run dev
```

Then click **"Try Demo Mode"** on the login screen to explore the full interface with sample data.

### Full Setup

1. **Set up database**: Run `database-setup.sql` in your Supabase SQL Editor
2. **Start app**: `npm run dev`
3. **Sign up**: Both partners create accounts
4. **Link accounts**: Enter each other's email addresses

See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth.tsx           # Authentication screen
│   ├── Chat.tsx           # Real-time messaging
│   ├── DailyPrompts.tsx   # Daily conversation starters
│   ├── DemoMode.tsx       # Demo interface with mock data
│   ├── MainApp.tsx        # Main app layout
│   ├── MemoriesFeed.tsx   # Shared memories timeline
│   ├── MoodCheckin.tsx    # Daily mood tracking
│   └── PartnerSetup.tsx   # Partner linking
├── contexts/
│   └── AuthContext.tsx    # Authentication state
└── lib/
    ├── database.types.ts  # TypeScript types
    └── supabase.ts        # Supabase client
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own and partner's data
- Secure email/password authentication
- All data encrypted via Supabase

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 3 steps
- **[SETUP.md](SETUP.md)** - Detailed setup and usage guide
- **[FEATURES.md](FEATURES.md)** - Complete feature documentation
- **[database-setup.sql](database-setup.sql)** - Database schema

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Icons**: Lucide React
- **Build**: Vite

## 💡 Future Enhancements

- Image upload for chat and memories
- Voice messages
- Video call integration
- Calendar for shared events
- Push notifications
- Relationship milestones tracker

## 📄 License

This project is open source and available for personal use.

---

Built with ❤️ for long-distance couples everywhere.
