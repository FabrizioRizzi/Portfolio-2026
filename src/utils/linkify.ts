/**
 * Linkify utility - converts URLs and email addresses in plain text to clickable HTML links
 */

interface LinkMatch {
  start: number;
  end: number;
  url: string;
  type: "url" | "email" | "domain";
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Escapes HTML attributes (includes quotes)
 */
function escapeHtmlAttribute(text: string): string {
  return escapeHtml(text)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Processes a single line of text and converts URLs/emails to clickable links
 */
function processLine(line: string): string {
  // Regex patterns for different URL types
  const fullUrlRegex = /https?:\/\/[^\s]+/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  // Matches domain.tld or subdomain.domain.tld patterns
  const domainRegex =
    /(?:^|[\s])([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/g;

  let result = "";
  let lastIndex = 0;

  // Find all matches (URLs, emails, and domains)
  const matches: LinkMatch[] = [];

  // Find full URLs with protocol
  let match: RegExpExecArray | null;
  while ((match = fullUrlRegex.exec(line)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      url: match[0],
      type: "url",
    });
  }

  // Find email addresses
  emailRegex.lastIndex = 0;
  while ((match = emailRegex.exec(line)) !== null) {
    const start = match.index;
    const matchLength = match[0].length;
    const matchUrl = match[0];

    // Check if this match overlaps with any existing match
    const overlaps = matches.some(
      (m) =>
        (start >= m.start && start < m.end) ||
        (start + matchLength > m.start && start + matchLength <= m.end)
    );

    if (!overlaps) {
      matches.push({
        start: start,
        end: start + matchLength,
        url: matchUrl,
        type: "email",
      });
    }
  }

  // Find domain patterns
  fullUrlRegex.lastIndex = 0;
  domainRegex.lastIndex = 0;
  while ((match = domainRegex.exec(line)) !== null) {
    const url = match[1];
    const start = match.index + (line[match.index] === " " ? 1 : 0);

    // Check if this match overlaps with any existing match
    const overlaps = matches.some(
      (m) =>
        (start >= m.start && start < m.end) ||
        (start + url.length > m.start && start + url.length <= m.end)
    );

    if (!overlaps) {
      matches.push({
        start: start,
        end: start + url.length,
        url: url,
        type: "domain",
      });
    }
  }

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);

  // Build result with links
  matches.forEach((m) => {
    // Add text before this match
    const beforeText = line.substring(lastIndex, m.start);
    result += escapeHtml(beforeText);

    // Determine the href based on type
    let href: string;
    if (m.type === "email") {
      href = `mailto:${m.url}`;
    } else if (m.type === "url") {
      href = m.url;
    } else {
      href = `https://${m.url}`;
    }

    const escapedUrl = escapeHtmlAttribute(m.url);

    // Create the link
    result += `<a href="${href}" target="_blank" rel="noopener noreferrer">${escapedUrl}</a>`;
    lastIndex = m.end;
  });

  // Add remaining text after last match
  const remainingText = line.substring(lastIndex);
  result += escapeHtml(remainingText);

  return result;
}

/**
 * Converts URLs and email addresses in plain text to clickable HTML links
 * Handles XSS prevention by escaping HTML entities
 *
 * @param text - The plain text to linkify
 * @returns HTML string with clickable links
 */
export function linkifyText(text: string): string {
  const lines = text.split("\n");
  const processedLines = lines.map(processLine);
  return processedLines.join("\n");
}

