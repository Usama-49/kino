# Kino 🎬

A full-stack, full-featured video sharing platform where users can upload, stream, and interact with videos seamlessly.

> ⚠️ **Status:** Work in Progress (WIP). Active development underway!

---

## 🚀 Overview

**Kino** is designed to allow creators to upload, manage, and stream high-quality video content. Built on top of the modern Next.js App Router, Kino leverages serverless database pooling and ImageKit media processing for high-performance streaming.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication:** NextAuth.js _(In Progress)_
- **Media Storage & CDN:** ImageKit _(In Progress)_
- **Styling:** Tailwind CSS

---

## 🏗️ Current Progress & Roadmap

- [x] Database caching utility (`lib/db.ts`) configured for serverless HMR.
- [x] Database models established (`User`, `Video`).
- [ ] Authentication setup (NextAuth credentials provider).
- [ ] ImageKit integration for video uploads.
- [ ] Core API routes (Video CRUD operations).
- [ ] Frontend feed, player UI, and upload dashboard.

---

## ⚙️ Getting Started

### 1. Clone the repository

git clone https://github.com/Usama-49/kino.git
cd kino

### 2. Install dependencies

npm install

### 3. Set up environment variables

Create a `.env` file in the root directory (refer to `.env.example`):
MONGO_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret

### 4. Run the development server

npm run dev

Open http://localhost:3000 in your browser.

---

## 👨‍💻 Author

Crafted by **Usama** ([@Usama-49](https://github.com/Usama-49)).
