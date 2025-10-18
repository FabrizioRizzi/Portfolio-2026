/**
 * Accessibility utilities for screen reader announcements
 */

/**
 * Create an announcer for screen readers
 */
export class ScreenReaderAnnouncer {
  private announcer: HTMLElement | null = null;

  constructor(announcerId: string) {
    this.announcer = document.getElementById(announcerId);
  }

  /**
   * Announce a message to screen readers
   * @param message - The message to announce
   * @param priority - The urgency of the announcement
   */
  announce(
    message: string,
    priority: "polite" | "assertive" = "polite"
  ): void {
    if (!this.announcer) return;

    this.announcer.setAttribute("aria-live", priority);
    this.announcer.textContent = message;

    // Clear after announcement to allow the same message to be announced again
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = "";
      }
    }, 1000);
  }

  /**
   * Check if the announcer is initialized
   */
  isInitialized(): boolean {
    return this.announcer !== null;
  }
}

