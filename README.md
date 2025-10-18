# 🖥️ Fabrizio Rizzi - Interactive Terminal Portfolio

A retro-styled, accessible, and highly optimized interactive terminal portfolio built with Astro. Features a command-line interface where visitors can explore projects, skills, and experience through terminal commands.

## ✨ Features

- **🚀 Blazing Fast** - Optimized for excellent Core Web Vitals
  - First Contentful Paint (FCP) < 1.0s
  - Server-side rendered content for instant visibility
  - Minimal JavaScript (only ~11KB total)
- **♿ Fully Accessible** - WCAG AAA compliant
  - Screen reader optimized with ARIA labels
  - Keyboard navigation support
  - High contrast mode support
  - Reduced motion support
- **💻 Terminal Interface** - Interactive command-line experience
  - Command history (↑/↓ arrows)
  - Tab autocompletion
  - Keyboard shortcuts (Ctrl+L to clear, etc.)
  - Mobile responsive
- **🎨 Modern CSS** - Performance-optimized styling
  - CSS containment for reduced reflows
  - Content-visibility for lazy rendering
  - Optimized font rendering

## 🚀 Project Structure

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   ├── astro.svg
│   │   └── background.svg
│   ├── components/
│   │   └── Terminal.astro       # Main terminal component
│   ├── layouts/
│   │   └── Layout.astro          # Base layout with global styles
│   ├── pages/
│   │   └── index.astro           # Homepage
│   └── utils/
│       └── commands.ts           # Terminal command logic
├── astro.config.mjs              # Optimized Astro configuration
├── ACCESSIBILITY.md              # Accessibility documentation
└── package.json
```

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
| `projects`   | View projects                         |
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

1. **Edit commands.ts** to update:
   - About section
   - Projects list
   - Skills
   - Work experience
   - Contact information

2. **Edit Layout.astro** to update:
   - Page title
   - Meta description
   - Theme colors

3. **Edit Terminal.astro** to customize:
   - Terminal appearance
   - Command prompt text
   - Welcome banner

### Add New Commands

To add a new command:

1. Open `src/utils/commands.ts`
2. Add your command to the `AVAILABLE_COMMANDS` array
3. Add a case in the `executeCommand` function switch statement
4. Create the content for your command

Example:
```typescript
case "resume":
  return { type: "success", content: RESUME_TEXT };
```

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

This portfolio follows WCAG AAA guidelines.

## 📄 License

MIT License - feel free to use this template for your own portfolio!

## 👀 Learn More

- [Astro Documentation](https://docs.astro.build)
- [Astro Discord](https://astro.build/chat)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

Built with ❤️ using [Astro](https://astro.build)
