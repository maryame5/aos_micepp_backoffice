import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>('fr');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private readonly LANGUAGE_KEY = 'aos_language';

  constructor(private translate: TranslateService) {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    const savedLanguage = localStorage.getItem(this.LANGUAGE_KEY) || 'fr';
    this.setLanguage(savedLanguage);
  }

  setLanguage(language: string): void {
    this.translate.use(language);
    this.currentLanguageSubject.next(language);
    localStorage.setItem(this.LANGUAGE_KEY, language);
    
    // Set document direction for RTL languages
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  isRTL(): boolean {
    return this.getCurrentLanguage() === 'ar';
  }

  getAvailableLanguages(): Array<{code: string, name: string, flag: string}> {
    return [
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'ar', name: 'العربية', flag: '🇲🇦' }
    ];
  }
}