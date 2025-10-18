/**
 * Command history management for terminal
 * Handles navigation through previously executed commands
 */

export class CommandHistory {
  private history: string[] = [];
  private currentIndex = -1;
  private currentInput = "";

  /**
   * Add a command to history
   */
  add(command: string): void {
    if (command.trim()) {
      this.history.unshift(command);
      this.reset();
    }
  }

  /**
   * Navigate to previous command in history
   * @returns The previous command, or null if at the beginning
   */
  navigateUp(): string | null {
    if (this.currentIndex < this.history.length - 1) {
      if (this.currentIndex === -1) {
        // Save current input before navigating history
        this.currentInput = "";
      }
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Navigate to next command in history
   * @returns The next command or the saved current input
   */
  navigateDown(): string {
    if (this.currentIndex > -1) {
      this.currentIndex--;
      if (this.currentIndex === -1) {
        return this.currentInput;
      }
      return this.history[this.currentIndex];
    }
    return this.currentInput;
  }

  /**
   * Save the current input before navigating history
   */
  saveCurrentInput(input: string): void {
    this.currentInput = input;
  }

  /**
   * Reset navigation index
   */
  reset(): void {
    this.currentIndex = -1;
    this.currentInput = "";
  }

  /**
   * Check if at the beginning of history
   */
  isAtBeginning(): boolean {
    return this.currentIndex >= this.history.length - 1;
  }

  /**
   * Check if at the end of history
   */
  isAtEnd(): boolean {
    return this.currentIndex <= -1;
  }

  /**
   * Get current command from history
   */
  getCurrent(): string | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }
}

