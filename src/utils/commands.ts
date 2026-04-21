export interface CommandOutput {
  type: "success" | "error";
  content: string;
}

// Responsive banner that adapts to screen size
const ASCII_BANNER_LARGE = `
 ╔═══════════════════════════════════════════════════════════╗
 ║  Hi, my name is                                           ║
 ║  ███████╗ █████╗ ██████╗ ██████╗ ██╗███████╗██╗ ██████╗   ║
 ║  ██╔════╝██╔══██╗██╔══██╗██╔══██╗██║╚══███╔╝██║██╔═══██╗  ║
 ║  █████╗  ███████║██████╔╝██████╔╝██║  ███╔╝ ██║██║   ██║  ║
 ║  ██╔══╝  ██╔══██║██╔══██╗██╔══██╗██║ ███╔╝  ██║██║   ██║  ║
 ║  ██║     ██║  ██║██████╔╝██║  ██║██║███████╗██║╚██████╔╝  ║ 
 ║  ╚═╝     ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝╚═╝ ╚═════╝   ║
 ╚═══════════════════════════════════════════════════════════╝
`;

const ASCII_BANNER_MOBILE = `
╔══════════════════════════════════╗
║ Hi, my name is                   ║
║ ░█▀▀░█▀█░█▀▄░█▀▄░▀█▀░▀▀█░▀█▀░█▀█ ║
║ ░█▀▀░█▀█░█▀▄░█▀▄░░█░░▄▀░░░█░░█░█ ║
║ ░▀░░░▀░▀░▀▀░░▀░▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀ ║
╚══════════════════════════════════╝
`;

// Export banner variants for client-side selection
export function getBannerForWidth(width: number): string {
  if (width < 480) {
    return ASCII_BANNER_MOBILE;
  } else {
    return ASCII_BANNER_LARGE;
  }
}

export function getWelcomeMessage(width: number): string {
  const banner = getBannerForWidth(width);
  return `${banner}
Welcome to my portfolio!

Type 'help' to see available commands.
Press '?' for keyboard shortcuts.
`;
}
export const shortcuts = `
Keyboard Shortcuts
==================

Navigation:
  ↑ / ↓         - Navigate command history
  Tab           - Autocomplete command
  Enter         - Execute command
  Esc           - Clear current input
  Ctrl + L      - Clear terminal screen

Accessibility:
  ?             - Show this keyboard shortcuts help
    `;

const HELP_TEXT = `
Available Commands
==================

  help        - Show this help message
  about       - Learn about me
  skills      - See my technical skills
  experience  - View my work experience
  contact     - Get my contact information
  clear       - Clear the terminal screen
  ?           - Show keyboard shortcuts
  
Navigation Tips
===============
  ↑ / ↓       - Navigate command history
  Tab         - Autocomplete commands
  Enter       - Execute command
  Esc         - Clear current input
  Ctrl + L    - Clear terminal screen
`;

const ABOUT_TEXT = `
About Me
========

Hello! My name is Fabrizio, a senior software engineer who loves building
interactive and engaging web experiences. I specialize in modern web
technologies and care deeply about craft, design, and user experience.

Lately I've been experimenting with AI in my day-to-day engineering — from
pair-programming with agents to trying out spec-driven development, where
specs act as the source of truth and AI helps turn them into code, tests,
and docs. On the side, I'm also studying Python to broaden my toolbox
beyond the web stack.

When I'm not coding, you can find me playing guitar, reading books,
cooking, or spending time with my family.

Current Focus:
- Building scalable web applications with modern frontend frameworks
- Experimenting with AI-assisted and spec-driven development workflows
- Creating developer tools that make engineering more enjoyable
- Studying Python for automation, scripting, and AI tooling
`;

const SKILLS_TEXT = `
Technical Skills
================

Languages:
  • JavaScript / TypeScript
  • HTML / CSS
  • Python

Frameworks & Libraries:
  • React / Angular / Vue / Svelte
  • Next.js
  • Tailwind CSS
  • Shadcn UI
  • Node.js / Express / Fastify
  • Astro
  • Vite
  • PostgreSQL / MySQL / SQLite
  • ... and a lot more :D

Tools & Technologies:
  • Git / GitHub
  • Docker
  • CI/CD
  • AI / LLMs
  • Cursor / Copilot / Claude

Design:
  • Responsive Design
  • UI/UX Principles
  • Accessibility
`;

const EXPERIENCE_TEXT = `
Work Experience
===============

Current Position
----------------
Role: Senior Software Engineer
Company: Nearform
Duration: December 2024 - Present

• As a senior software engineer, I partner with international clients on production systems—clear communication, solid architecture, and pragmatic delivery.
• At Nearform I guide work from early conversations through production—partnering with stakeholders on scope, delivering in increments, and refining how things run once they're live.
• I'm growing into an AI-native engineer through Nearform's AI upskilling, weaving AI-assisted workflows into how I design, build, and review software.

Previous Position
-----------------
Role: Senior Front-end Developer
Company: SORINT.lab
Duration: November 2017 - November 2024 · Milan, Italy

• Team lead and lead front-end for a finance platform: 10+ web and hybrid desktop apps, real-time data, D3 charts, and a shared UI library—alongside a 20+ person cross-functional team.
• Lead front-end on a webmail client (custom design system / UI library), an internal open-source comms stack (chat, voice, video), and 10+ consulting projects for customers.
• Mentored juniors and wrote for the company technical blog.
`;

const CONTACT_TEXT = `
Contact Information
===================

Email:    <a target="_blank" href="mailto:fabrizio@fabriziorizzi.it">fabrizio@fabriziorizzi.it</a>
GitHub:   <a target="_blank" href="https://github.com/fabriziorizzi">github.com/fabriziorizzi</a>
LinkedIn: <a target="_blank" href="https://linkedin.com/in/fabriziorizzi">linkedin.com/in/fabriziorizzi</a>
Website:  <a target="_blank" href="https://fabriziorizzi.it">fabriziorizzi.it</a>

Feel free to reach out! I'm always open to discussing new projects,
creative ideas, or opportunities to be part of your visions.
`;

export function executeCommand(command: string, width: number): CommandOutput {
  const trimmedCommand = command.trim().toLowerCase();

  switch (trimmedCommand) {
    case "":
      return { type: "success", content: "" };

    case "help":
      return { type: "success", content: HELP_TEXT };

    case "about":
      return { type: "success", content: ABOUT_TEXT };

    case "skills":
      return { type: "success", content: SKILLS_TEXT };

    case "experience":
      return { type: "success", content: EXPERIENCE_TEXT };

    case "contact":
      return { type: "success", content: CONTACT_TEXT };

    case "clear":
      return { type: "success", content: "__CLEAR__" };

    default:
      return {
        type: "error",
        content: `Command not found: ${command}\nType 'help' to see available commands.`,
      };
  }
}

export const AVAILABLE_COMMANDS = [
  "help",
  "about",
  "skills",
  "experience",
  "contact",
  "clear",
];

export function getCommandSuggestion(partial: string): string | null {
  return (
    AVAILABLE_COMMANDS.find((cmd) => cmd.startsWith(partial.toLowerCase())) ??
    null
  );
}
