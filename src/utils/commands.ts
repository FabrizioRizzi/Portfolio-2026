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
  projects    - View my projects
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

Hello! My name is Fabrizio and I'm a passionate developer who loves creating interactive and engaging
web experiences. I specialize in modern web technologies and have a keen eye
for design and user experience.

When I'm not coding, you can find me exploring new technologies, contributing
to open-source projects, or sharing knowledge with the developer community.

Current Focus:
- Building scalable web applications
- Exploring modern frontend frameworks
- Creating developer tools
`;

const PROJECTS_TEXT = `
Projects
========

1. Terminal Portfolio
   A retro-styled interactive terminal portfolio built with Astro
   Tech: Astro, TypeScript, CSS
   Status: You're looking at it! 🎉

2. [Add Your Project Here]
   Description of your project
   Tech: List technologies used
   Link: https://your-project-link.com

3. [Add Another Project]
   Description of another project
   Tech: List technologies used
   Link: https://your-project-link.com

Note: Replace this with your actual projects!
`;

const SKILLS_TEXT = `
Technical Skills
================

Languages:
  • JavaScript / TypeScript
  • HTML / CSS
  • Python
  • [Add your languages]

Frameworks & Libraries:
  • React / Vue / Svelte
  • Node.js / Express
  • Astro
  • [Add your frameworks]

Tools & Technologies:
  • Git / GitHub
  • Docker
  • CI/CD
  • [Add your tools]

Design:
  • Responsive Design
  • UI/UX Principles
  • Accessibility
  • [Add your design skills]
`;

const EXPERIENCE_TEXT = `
Work Experience
===============

Current Position
----------------
Role: Senior Software Engineer
Company: Nearform
Duration: December 2024 - Present

• I work on the developer experience team at Nearform, where I build tools and services for our developer community.
• I'm a senior software engineer, with a focus on building scalable and maintainable systems.
• I'm a polyglot programmer, with a focus on building scalable and maintainable systems.

Previous Position
-----------------
Role: [Previous Role]
Company: [Company Name]
Duration: [Start Date] - [End Date]

• Describe your key responsibilities
• Highlight major achievements
• List technologies used

Note: Update this with your actual work experience!
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

    case "projects":
      return { type: "success", content: PROJECTS_TEXT };

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
  "projects",
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
