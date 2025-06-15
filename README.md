# MasterPrima Site

A modern web application for Bimbel (tutoring/education services), built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/), and [Tailwind CSS](https://tailwindcss.com/).

This project is part of academic research for a thesis and demonstrates the integration of scalable web technologies for online education.

## Features

* ✨ Next.js 14 App Router (React 18)
* 🎨 Tailwind CSS for modern, responsive design
* 🗃️ Supabase as the backend/database
* 📈 Data visualization with Recharts
* 📝 Markdown and WYSIWYG editing (BlockNote, React Markdown)
* ⚡ Optimized for fast performance and easy deployment

## Getting Started

To run the project locally, clone this repository and install dependencies:

```bash
git clone https://github.com/mp-codespace/masterprima-site.git
cd masterprima-site
npm install
```

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file in the root folder and add your Supabase credentials and any other required environment variables.
*Never commit `.env` files to version control!*

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

* `/app` - Next.js application code (pages, layouts, components)
* `/public` - Static assets
* `/styles` - Global CSS
* `/utils` - Helper functions

## Available Scripts

* `npm run dev` — Start development server
* `npm run build` — Build for production
* `npm run start` — Start production server
* `npm run lint` — Lint the code

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).
See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.

## Learn More

* [Next.js Documentation](https://nextjs.org/docs)
* [Supabase Documentation](https://supabase.com/docs)
* [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

> **Developed by Irfan Rahmat**
> For academic purposes & educational research.
