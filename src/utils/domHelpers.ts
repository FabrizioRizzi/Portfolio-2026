/**
 * DOM manipulation helpers for terminal UI
 */

/**
 * Scroll element to bottom smoothly using requestAnimationFrame
 */
export function scrollToBottom(...elements: HTMLElement[]): void {
  requestAnimationFrame(() => {
    elements.forEach((element) => {
      element.scrollTop = element.scrollHeight;
    });
  });
}

/**
 * Calculate text width using canvas for accurate measurement
 */
export function measureTextWidth(text: string, font: string): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) return 0;

  context.font = font;
  return context.measureText(text).width;
}

/**
 * Update cursor position based on input text width
 */
export function updateCursorPosition(
  cursor: HTMLElement,
  input: HTMLInputElement,
  prompt: HTMLElement
): void {
  const promptRect = prompt.getBoundingClientRect();
  const font = window.getComputedStyle(input).font;
  const textWidth = measureTextWidth(input.value, font);
  cursor.style.left = `${promptRect.width + textWidth + 8}px`;
}

/**
 * Determine responsive breakpoint from window width
 */
export function getBreakpoint(width: number): "mobile" | "small" | "large" {
  if (width < 480) return "mobile";
  if (width < 768) return "small";
  return "large";
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
}

