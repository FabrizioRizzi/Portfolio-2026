# 🖥️ Fabrizio Rizzi - Interactive Terminal Portfolio

A retro-styled, accessible, and highly optimized interactive terminal portfolio built with Astro. Features a command-line interface where visitors can explore skills, and experience through terminal commands.

## ✨ Features

- **🚀 Blazing Fast** - Optimized for excellent Core Web Vitals
  - First Contentful Paint (FCP) < 1.0s
  - Server-side rendered content for instant visibility
  - Minimal JavaScript (only ~11KB total)
- **♿ Fully Accessible** - WCAG AAA compliant
  - Screen reader optimized with ARIA labels and live regions
  - Keyboard navigation support
  - High contrast mode support
  - Reduced motion support
- **💻 Terminal Interface** - Interactive command-line experience
  - Command history (↑/↓ arrows)
  - Tab autocompletion
  - Keyboard shortcuts (Ctrl+L to clear, etc.)
  - **Clickable links** - URLs and emails automatically detected and linkified
  - Mobile responsive with adaptive UI
- **🎨 Modern CSS** - Performance-optimized styling
  - CSS containment for reduced reflows
  - Content-visibility for lazy rendering
  - Optimized font rendering
- **🏗️ Clean Architecture** - Well-organized, maintainable codebase
  - Modular utility functions
  - Object-oriented design with classes
  - Full TypeScript support
  - Separation of concerns

## 🚀 Project Structure

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Terminal.astro           # Main terminal UI component (646 lines)
│   ├── layouts/
│   │   └── Layout.astro             # Base layout with global styles
│   ├── pages/
│   │   └── index.astro              # Homepage
│   └── utils/                       # Modular utility functions
│       ├── accessibility.ts         # Screen reader announcements
│       ├── commandHistory.ts        # Command history management
│       ├── commands.ts              # Terminal command logic & content
│       ├── domHelpers.ts            # DOM manipulation utilities
│       └── linkify.ts               # URL/email link detection
├── astro.config.mjs                 # Optimized Astro configuration
├── ACCESSIBILITY.md                 # Accessibility documentation
└── package.json
```

### Utilities Overview

- **`accessibility.ts`** - `ScreenReaderAnnouncer` class for ARIA live regions
- **`commandHistory.ts`** - `CommandHistory` class for navigating command history
- **`commands.ts`** - Command execution, content, and ASCII banners
- **`domHelpers.ts`** - DOM utilities (scroll, cursor position, breakpoints, debounce)
- **`linkify.ts`** - Automatic URL and email detection with XSS protection

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🎮 Terminal Commands

Once the app is running, you can use these commands in the terminal:

| Command      | Description                           |
| :----------- | :------------------------------------ |
| `help`       | Show available commands               |
| `about`      | Learn about Fabrizio                  |
| `skills`     | See technical skills                  |
| `experience` | View work experience                  |
| `contact`    | Get contact information               |
| `clear`      | Clear the terminal screen             |
| `?`          | Show keyboard shortcuts               |

### Keyboard Shortcuts

- **↑ / ↓** - Navigate command history
- **Tab** - Autocomplete commands
- **Enter** - Execute command
- **Esc** - Clear current input
- **Ctrl + L** - Clear terminal screen

### 🔗 Clickable Links

All URLs and email addresses in terminal output are automatically detected and converted to clickable links:

- **URLs**: `github.com/user`, `https://example.com`, `example.com/path`
- **Emails**: `name@example.com` (opens in default email client)
- Links open in new tabs with proper security attributes (`rel="noopener noreferrer"`)
- Full XSS protection with HTML escaping

## ⚡ Performance Optimizations

This portfolio is highly optimized for performance:

### Server-Side Rendering
- Welcome message rendered on the server for instant FCP
- No waiting for JavaScript to display content

### JavaScript Optimization
- Deferred DOM initialization
- Debounced resize handlers (150ms)
- Passive event listeners
- Console logs removed in production
- Terser minification with 2 passes

### CSS Performance
- CSS containment (`contain: layout style paint`)
- Content-visibility for off-screen rendering
- Single bundled CSS file (5.4KB)
- System fonts (no web font loading delay)

### Build Configuration
- HTML compression enabled
- CSS bundling for better caching
- Auto-inline small stylesheets
- Hover-based prefetching

### Expected Performance Metrics
- **FCP (First Contentful Paint)**: < 1.0s ⚡
- **LCP (Largest Contentful Paint)**: < 2.0s
- **TBT (Total Blocking Time)**: < 200ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Performance Score**: 95-100

## 🧪 Testing Performance

### Run Lighthouse Audit
1. Build the production version: `npm run build`
2. Preview the build: `npm run preview`
3. Open Chrome DevTools (F12)
4. Go to "Lighthouse" tab
5. Select "Performance" and run the audit

### Online Testing
- **Google PageSpeed Insights**: https://pagespeed.web.dev/
- **WebPageTest**: https://www.webpagetest.org/

## 🛠️ Customization

### Update Personal Information

1. **Edit `src/utils/commands.ts`** to update:
   - About section
   - Skills
   - Work experience
   - Contact information
   - Welcome banner

2. **Edit `src/layouts/Layout.astro`** to update:
   - Page title
   - Meta description
   - Theme colors
   - Global styles

3. **Edit `src/components/Terminal.astro`** to customize:
   - Terminal appearance
   - Command prompt text
   - UI behavior

### Add New Commands

To add a new command:

1. Open `src/utils/commands.ts`
2. Add your command to the `AVAILABLE_COMMANDS` array
3. Add a case in the `executeCommand` function switch statement
4. Create the content constant for your command

Example:
```typescript
const RESUME_TEXT = `
Resume
======
[Your resume content here]
`;

// In the executeCommand function:
case "resume":
  return { type: "success", content: RESUME_TEXT };
```

### Modify Link Detection

To customize how links are detected or styled:

1. **Link detection logic**: Edit `src/utils/linkify.ts`
   - Modify regex patterns in `processLine()` function
   - Add support for additional URL patterns

2. **Link styling**: Edit `src/components/Terminal.astro`
   - Update the `:global(.output-line a)` CSS rules
   - Customize colors, hover effects, and transitions

### Extend Utilities

The modular architecture makes it easy to extend functionality:

- **`accessibility.ts`** - Add new announcement types or ARIA features
- **`commandHistory.ts`** - Implement persistent history (localStorage)
- **`domHelpers.ts`** - Add new DOM manipulation utilities
- **`linkify.ts`** - Support for additional patterns (phone numbers, hashtags, etc.)

## 🏗️ Code Architecture

This project follows clean code principles with a modular, maintainable architecture:

### Design Patterns

- **Separation of Concerns**: UI logic (Terminal.astro) separate from business logic (utils/)
- **Single Responsibility**: Each utility module has one clear purpose
- **Object-Oriented Programming**: Classes for command history and accessibility
- **Pure Functions**: Stateless DOM helpers and link processing
- **Type Safety**: Full TypeScript coverage with proper interfaces

### Code Quality
  
✅ **5 focused utility modules** with clear responsibilities  
✅ **JSDoc documentation** on all public functions  
✅ **No linter errors** - Clean TypeScript throughout  
✅ **Testable code** - Pure functions and isolated modules  

### Module Responsibilities

| Module | Lines | Purpose |
|--------|-------|---------|
| `Terminal.astro` | 646 | UI rendering and event handling |
| `commands.ts` | 242 | Command execution and content |
| `linkify.ts` | 152 | URL/email detection and XSS protection |
| `commandHistory.ts` | 91 | Command history state management |
| `domHelpers.ts` | 71 | DOM manipulation utilities |
| `accessibility.ts` | 44 | Screen reader announcements |

## 📦 Dependencies

- **Astro** (v5.14.5) - Zero-JavaScript web framework
- **TypeScript** - Type safety
- **Terser** - JavaScript minification

## 🚢 Deployment

This static site can be deployed to any hosting platform:

### Recommended Platforms
- **Netlify** - Zero config deployment
- **Vercel** - Automatic deployments from Git
- **Cloudflare Pages** - Global edge network
- **GitHub Pages** - Free hosting for public repos

### Deploy to Netlify
```bash
npm run build
# Deploy the ./dist/ folder
```

### Deploy to Vercel
```bash
npx vercel --prod
```

## ♿ Accessibility

This portfolio follows WCAG AAA guidelines with comprehensive accessibility features:

- **ARIA Live Regions** - Command results announced to screen readers via `ScreenReaderAnnouncer` class
- **Semantic HTML** - Proper roles (`log`, `status`, `banner`)
- **Keyboard Navigation** - Full keyboard support for all interactions
- **Focus Management** - Visible focus indicators and logical tab order
- **Alternative Text** - Descriptive labels for all interactive elements
- **Reduced Motion** - Respects `prefers-reduced-motion` preference
- **High Contrast** - Tested with high contrast mode

## 🧑‍💻 Development Tips

### Working with the Codebase

1. **Start with commands.ts** - Update your personal information here first
2. **Terminal.astro is UI-focused** - Avoid adding business logic here
3. **Create new utilities** - Add new modules to `src/utils/` for new features
4. **Test accessibility** - Use a screen reader to verify announcements work
5. **Check performance** - Run Lighthouse after major changes

### Common Tasks

**Adding a new utility function:**
```typescript
// src/utils/myUtility.ts
export function myFunction() {
  // Your logic here
}

// Import in Terminal.astro
import { myFunction } from "../utils/myUtility";
```

**Modifying link styles:**
```css
/* In Terminal.astro <style> section */
:global(.output-line a) {
  color: var(--terminal-highlight);
  /* Your custom styles */
}
```

**Adding command history persistence:**
```typescript
// Extend CommandHistory class in commandHistory.ts
class CommandHistory {
  constructor() {
    this.loadFromLocalStorage();
  }
  
  private loadFromLocalStorage() {
    // Implementation
  }
}
```

## 📄 License

MIT License - feel free to use this template for your own portfolio!

## 👀 Learn More

- [Astro Documentation](https://docs.astro.build)
- [Astro Discord](https://astro.build/chat)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Built with ❤️ using [Astro](https://astro.build)

**Features:**
✨ Clickable links | 🏗️ Modular architecture | ♿ WCAG AAA accessible | 🚀 Optimized performance
