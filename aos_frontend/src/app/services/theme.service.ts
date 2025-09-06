import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeKey = 'darkModeEnabled';

  constructor() {
    this.loadTheme();
  }

  isDarkMode(): boolean {
    return document.body.classList.contains('dark-mode');
  }

  toggleDarkMode(): void {
    if (this.isDarkMode()) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  enableDarkMode(): void {
    document.body.classList.add('dark-mode');
    localStorage.setItem(this.darkModeKey, 'true');
  }

  disableDarkMode(): void {
    document.body.classList.remove('dark-mode');
    localStorage.setItem(this.darkModeKey, 'false');
  }

  loadTheme(): void {
    const darkModeEnabled = localStorage.getItem(this.darkModeKey);
    if (darkModeEnabled === 'true') {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }
}
