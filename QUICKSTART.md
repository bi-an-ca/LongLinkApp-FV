# LongLink - Quick Start Guide

## 👀 Try Demo Mode First!

Want to see what LongLink looks like before setting up? Click **"Try Demo Mode"** on the login screen to explore the full interface with sample data. No database setup or sign-up required!

The demo includes:
- Sample chat conversations with emoji reactions
- Mock mood check-ins for both partners
- Example memories and timeline posts
- Daily prompts with sample responses
- Full UI/UX experience

---

## 🚀 Get Started in 3 Steps

### Step 1: Set Up the Database
1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Go to SQL Editor
3. Copy and paste the entire contents of `database-setup.sql`
4. Click "Run"

✅ This creates all necessary tables and security policies

### Step 2: Run the App
The app is already connected to your Supabase project (check `.env` file).

Just start the development server:
```bash
npm run dev
```

### Step 3: Create Your Accounts
1. **Person 1**: Sign up with email and password
2. **Person 1**: Enter Person 2's email to link accounts
3. **Person 2**: Sign up with email and password
4. **Person 2**: Enter Person 1's email to link accounts

✅ You're now connected!

---

## 🎯 What You Can Do

### 💬 Chat
- Send real-time messages
- React with emojis
- See message history

### 💗 Mood Check-Ins
- Share how you're feeling (8 moods available)
- Add notes about your day
- See your partner's mood

### 🕐 Time Zones
- Always see both times at the top
- No more "Did I wake you up?" moments

### 🖼️ Memories
- Post photos and notes
- Build your shared timeline
- Delete your own posts

### 💭 Daily Prompts
- Answer thought-provoking questions
- Read your partner's responses
- New prompt each day

---

## 📱 Design Features

- Mobile-first layout
- Soft pastel colors (pink, rose, amber)
- Bottom navigation for easy one-handed use
- Smooth animations and transitions
- Real-time updates (no refresh needed!)

---

## 🔒 Security

- All data is private between you and your partner
- Row Level Security ensures data isolation
- Email/password authentication
- Secure connection via Supabase

---

## 💡 Tips

1. **Set your timezone** during signup for accurate time display
2. **Check in daily** with mood updates to stay connected
3. **Answer prompts together** to spark meaningful conversations
4. **Create memories** of special moments, no matter how small
5. **React to messages** with emojis to add personality

---

## 🛠️ Troubleshooting

**App shows "Please link with partner"**
- Make sure both people have signed up
- Both must enter each other's email in the partner setup screen

**Not seeing real-time updates**
- Check your internet connection
- Refresh the page
- Verify database setup was completed

**Database errors**
- Ensure you ran the `database-setup.sql` script in Supabase
- Check that all tables were created successfully

---

## 📞 Next Steps

Once you're both set up:
1. Send your first message
2. Check in with your mood
3. Answer today's prompt together
4. Create your first memory

Enjoy staying connected! ❤️
