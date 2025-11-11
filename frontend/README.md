# Clean Admin Panel UI

A modern, clean, and minimal admin panel shell built with Next.js 14+, featuring a responsive layout, dark mode, and internationalization support.

## Features

- ✨ **Clean & Modern UI** - Minimalist design with shadcn/ui components
- 🌓 **Dark Mode** - Light/Dark/System theme support with next-themes
- 🌍 **Internationalization** - English and Bangla (বাংলা) language support
- 📱 **Responsive** - Mobile-first design with collapsible sidebar
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **Modular Components** - Reusable and maintainable code structure
- ⚡ **Fast** - Minimal dependencies for quick load times
- 🔧 **TypeScript** - Full type safety

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Theme**: next-themes
- **i18n**: next-intl

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
   - English: [http://localhost:3000](http://localhost:3000)
   - Bangla: [http://localhost:3000/bn](http://localhost:3000/bn)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
clean-admin-panel-ui/
├── app/
│   ├── [locale]/           # Internationalized routes
│   │   ├── dashboard/      # Dashboard pages
│   │   └── layout.tsx      # Locale layout
│   ├── globals.css         # Global styles with theme variables
│   └── layout.tsx          # Root layout with providers
├── components/
│   ├── layout/             # Layout components
│   │   ├── app-shell.tsx   # Main app wrapper
│   │   ├── side-nav.tsx    # Sidebar navigation
│   │   └── top-nav.tsx     # Top navigation bar
│   ├── ui/                 # shadcn/ui components
│   ├── language-switcher.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── i18n/               # Internationalization config
│   ├── providers/          # React providers
│   └── utils.ts            # Utility functions
├── messages/               # Translation files
│   ├── en.json            # English translations
│   └── bn.json            # Bangla translations
├── docs/                   # Documentation
└── middleware.ts          # Next.js middleware for i18n
```

## Customization

### Adding Navigation Items

Edit `components/layout/side-nav.tsx` to add or modify navigation items:

```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Your Section',
    items: [
      { name: 'Item 1', href: '/item-1', icon: YourIcon },
      { name: 'Item 2', href: '/item-2', icon: YourIcon },
    ],
  },
  // ... more items
]
```

### Changing Theme Colors

Modify the CSS variables in `app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... other variables */
}
```

### Adding Translations

1. Add new keys to `messages/en.json` and `messages/bn.json`
2. Use the translation in your components:

```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('yourSection');
return <h1>{t('title')}</h1>;
```

### Adding More Languages

1. Update `lib/i18n/config.ts`:
```typescript
export const locales = ['en', 'bn', 'fr'] as const;
export const localeNames = {
  en: 'English',
  bn: 'বাংলা',
  fr: 'Français',
};
```

2. Create `messages/fr.json` with translations
3. Update middleware matcher in `middleware.ts`

## Adding Features

This is a shell project. To add more features:

- **Authentication**: Implement auth provider and protected routes
- **Database**: Set up database connection (Prisma, MongoDB, etc.)
- **API Routes**: Create API endpoints in `app/api`
- **Forms**: Use react-hook-form and zod for form validation
- **Data Tables**: Add table components for data management
- **Charts**: Integrate charting libraries (Recharts, etc.)

## Installing Additional shadcn Components

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add table
npx shadcn@latest add form
npx shadcn@latest add dialog
```

## Documentation

For the complete project generation prompt and detailed documentation, see:
- [Project Generation Prompt](docs/project-generation-prompt.md)

## License

This project is open source and available for use.

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Lucide Icons](https://lucide.dev/)

---

Generated with [Claude Code](https://claude.com/claude-code)
