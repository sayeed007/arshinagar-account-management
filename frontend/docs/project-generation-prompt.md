# Clean Admin Panel UI - Project Generation Prompt

Use this prompt with Claude Code to generate a similar clean admin panel shell project.

## Prompt

```
Create a modern Next.js 14+ admin dashboard shell with the following specifications:

## Tech Stack
- Next.js 14+ (App Router with TypeScript)
- Tailwind CSS with custom design system
- shadcn/ui components (only install essential ones initially)
- Lucide React icons
- React Hook Form + Zod for forms (setup only, don't create forms yet)
- next-themes for dark/light mode
- next-intl for internationalization (English and Bangla)

## Core Dependencies (Minimal)
Install only these core packages:
- next, react, react-dom (latest stable)
- typescript, @types/node, @types/react, @types/react-dom
- tailwindcss, autoprefixer, postcss
- class-variance-authority, clsx, tailwind-merge
- lucide-react
- next-themes (for dark mode)
- next-intl (for i18n)

## Project Structure
Create this folder structure:
```
app/
├── layout.tsx (root layout with ThemeProvider)
├── globals.css (with shadcn/ui theme variables)
├── [locale]/
│   ├── layout.tsx (i18n locale layout)
│   └── dashboard/
│       ├── layout.tsx (uses AppShell)
│       └── page.tsx (welcome page with stats cards)

components/
├── layout/
│   ├── app-shell.tsx (main layout wrapper)
│   ├── side-nav.tsx (sidebar with grouped navigation)
│   └── top-nav.tsx (header with notifications, theme toggle, language switcher, user menu)
├── theme-toggle.tsx (dark/light/system theme switcher)
├── language-switcher.tsx (English/Bangla language switcher)
└── ui/ (shadcn components - install as needed)

lib/
├── utils.ts (cn helper function)
├── i18n/
│   ├── config.ts (locale configuration)
│   └── request.ts (next-intl request config)
└── providers/
    └── theme-provider.tsx (next-themes provider)

messages/
├── en.json (English translations)
└── bn.json (Bangla translations)

docs/
└── (documentation files)

middleware.ts (next-intl middleware for locale detection)
```

## Layout Architecture

### 1. AppShell Component (components/layout/app-shell.tsx)
- Flexbox layout with sidebar + main content area
- Fixed height (h-screen) with overflow handling
- Responsive sidebar (drawer on mobile, fixed on desktop)
- State management for sidebar open/close
- Structure: SideNav + (TopNav + Main content area)

### 2. SideNav Component (components/layout/side-nav.tsx)
Features:
- Fixed width sidebar (w-72) with border-right
- Logo/brand at top with icon
- Scrollable navigation area using ScrollArea
- **Grouped navigation sections** with:
  - Section headers (uppercase, smaller text, muted)
  - Navigation items with icons
  - Active state highlighting (bg change)
  - Smooth hover effects
- Mobile: Slide-in drawer with backdrop overlay
- Desktop: Always visible, relative positioning
- Close button (X) visible only on mobile

Navigation structure example:
- Dashboard (single item, no group)
- Group: "User Management"
  - Users
  - Roles
- Group: "Content"
  - Products
  - Documents
- Group: "Analytics"
  - Reports
  - Statistics
- Settings (single item, no group)

### 3. TopNav Component (components/layout/top-nav.tsx)
Features:
- Sticky header (sticky top-0) with border-bottom
- Height: h-16
- Menu hamburger button (left, mobile only)
- Spacer (flex-1)
- Right side:
  - Notifications dropdown with badge
  - Theme toggle (Light/Dark/System)
  - Language switcher (English/Bangla)
  - User dropdown menu (avatar, name, role badge, profile/settings links, logout)

### 4. Root Layout (app/layout.tsx)
- Inter font from next/font/google
- HTML with suppressHydrationWarning
- Metadata setup
- ThemeProvider wrapper
- Clean structure with provider comments

### 5. Locale Layout (app/[locale]/layout.tsx)
- NextIntlClientProvider for i18n
- Locale validation
- Message loading

### 6. Dashboard Layout (app/[locale]/dashboard/layout.tsx)
- Wraps children with AppShell component
- Placeholder comment for protected route wrapper

### 7. Dashboard Page (app/[locale]/dashboard/page.tsx)
- Welcome message
- 4 stat cards (Total Users, Total Products, Revenue, Active Sessions)
- Overview chart placeholder
- Recent activity list

## Styling Requirements

### globals.css
- Include full shadcn/ui CSS variables for both light and dark modes
- Use neutral/slate color scheme
- Define --radius custom property
- Include @layer base styles
- Support Tailwind v4 @theme syntax

### Tailwind Config
- Use Tailwind v4 inline configuration in globals.css
- darkMode: class-based
- Custom colors from CSS variables
- Border radius using CSS vars
- Full color system (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring)

## Design System
- Color scheme: Neutral/Slate with clean blacks and whites
- Border radius: Moderate (0.5rem default)
- Spacing: Consistent with Tailwind defaults
- Typography: Clean, readable with proper hierarchy
- Dark mode: Full support with class-based switching
- Shadows: Subtle, use sparingly
- Hover states: Subtle background changes
- Active states: Clear but not jarring
- Transitions: Fast (200ms) for UI feedback

## shadcn/ui Components to Install
Only install these initially:
- button
- dropdown-menu
- scroll-area
- badge
- separator
- card

Use the official shadcn CLI: `npx shadcn@latest add [component]`

## Key Features

### 1. Responsive Design
- Mobile: Hamburger menu, collapsible sidebar drawer
- Desktop: Fixed sidebar, always visible
- Breakpoint: lg (1024px)

### 2. Navigation
- Active route highlighting using usePathname
- Grouped sections with clear visual hierarchy
- Icons from lucide-react
- Smooth transitions

### 3. Dark Mode
- Light/Dark/System modes
- Theme toggle in top nav
- Proper color variables for both modes
- No flash on page load

### 4. Internationalization (i18n)
- Support for English and Bangla (বাংলা)
- Language switcher in top nav
- next-intl configuration
- URL-based locale routing ([locale])
- Translation files for all UI text
- Middleware for locale detection

### 5. Clean & Modern UI
- Minimalist design
- Ample whitespace
- Clear visual hierarchy
- Professional color scheme
- Consistent component styling

## Implementation Notes
- Use 'use client' directives where needed (interactive components)
- Implement proper TypeScript types for all props
- Use cn() utility for conditional classes
- Keep components modular and reusable
- Add placeholder content in dashboard page
- No authentication logic yet (just UI structure)
- No API routes yet
- No database setup

## File Creation Order
1. Setup Next.js project with TypeScript
2. Configure Tailwind
3. Create lib/utils.ts with cn() function
4. Setup globals.css with shadcn variables
5. Install next-themes and create ThemeProvider
6. Install next-intl and configure i18n
7. Create translation files (en.json, bn.json)
8. Create middleware for locale detection
9. Install essential shadcn components
10. Create theme-toggle and language-switcher components
11. Create layout components (app-shell, side-nav, top-nav)
12. Create app layouts (root, locale, dashboard)
13. Create dashboard page with stat cards

## i18n Configuration Details

### Locale Setup
- Supported locales: 'en' (English), 'bn' (Bangla)
- Default locale: 'en'
- Locale prefix: 'as-needed' (default locale doesn't show in URL)

### Translation Structure
All UI text should be externalized to messages/[locale].json files with these sections:
- common: App name, welcome message, common actions
- nav: Navigation menu items
- dashboard: Dashboard page content
- notifications: Notification messages
- theme: Theme-related text

### Middleware Configuration
```typescript
matcher: ['/', '/(bn|en)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
```

### next.config.ts
Include next-intl plugin wrapper

## Theme Configuration

### ThemeProvider Setup
- Attribute: 'class'
- Default theme: 'system'
- Enable system theme detection
- Disable transition on change

### Theme Toggle
- Three options: Light, Dark, System
- Visual indicator with Sun/Moon icons
- Dropdown menu for selection

The result should be a clean, production-ready shell that can be easily extended with features, without unnecessary dependencies bloating the package.json. The UI should be fully responsive, support both light and dark modes, and be available in English and Bangla languages.
```

## What's Included

This shell project includes:

1. **Modern UI Framework**: Next.js 14+ with App Router and TypeScript
2. **Styling**: Tailwind CSS with shadcn/ui component library
3. **Layout System**: Responsive sidebar and top navigation
4. **Theme Support**: Light/Dark/System modes with next-themes
5. **Internationalization**: English and Bangla support with next-intl
6. **Component Library**: Essential shadcn/ui components (button, dropdown, card, etc.)
7. **Navigation**: Grouped sidebar navigation with active state highlighting
8. **Clean Architecture**: Modular components, proper TypeScript typing, and clean folder structure

## How to Use This Prompt

1. Copy the entire prompt section above
2. Paste it into Claude Code
3. Claude Code will generate the complete project structure
4. Run `npm install` to install dependencies
5. Run `npm run dev` to start the development server
6. Access the app at `http://localhost:3000` or `http://localhost:3000/bn` for Bangla

## Customization

After generation, you can customize:

- **Navigation items**: Edit `components/layout/side-nav.tsx`
- **Theme colors**: Modify `app/globals.css` CSS variables
- **Translations**: Update `messages/en.json` and `messages/bn.json`
- **Supported languages**: Add more locales in `lib/i18n/config.ts` and create corresponding translation files
- **Dashboard stats**: Modify `app/[locale]/dashboard/page.tsx`

## Adding More Features

This is a shell project. To add more features:

1. **Authentication**: Add auth provider and protect routes
2. **Database**: Set up database connection and models
3. **API Routes**: Create API endpoints in `app/api`
4. **Forms**: Install react-hook-form and zod, create form components
5. **Data Tables**: Add data table components for CRUD operations
6. **Charts**: Integrate chart libraries for data visualization

## Dependencies Overview

### Core Dependencies
- `next`, `react`, `react-dom`: Framework
- `typescript`: Type safety
- `tailwindcss`: Styling
- `lucide-react`: Icons
- `next-themes`: Theme switching
- `next-intl`: Internationalization

### UI Components
- `@radix-ui/*`: Headless UI primitives (via shadcn)
- `class-variance-authority`: Component variants
- `clsx`, `tailwind-merge`: Utility classes

## Project Stats

- **Total Core Dependencies**: ~10
- **Total shadcn Components**: 6 (button, dropdown-menu, scroll-area, badge, separator, card)
- **File Size**: Minimal (only essential code)
- **Build Time**: Fast (no bloat)
- **Supported Languages**: 2 (English, Bangla)
- **Supported Themes**: 3 (Light, Dark, System)

---

Generated with Claude Code
