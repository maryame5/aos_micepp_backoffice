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

  private async initializeLanguage(): Promise<void> {
    const savedLanguage = localStorage.getItem(this.LANGUAGE_KEY) || 'fr';
    console.log('Initializing language:', savedLanguage);
    await this.setLanguage(savedLanguage);
  }

  async setLanguage(language: string): Promise<void> {
    try {
      console.log(`Attempting to change language to: ${language}`);
      
      // Vérifier si la langue est disponible
      const availableLanguages = this.getAvailableLanguages();
      const isValidLanguage = availableLanguages.some(lang => lang.code === language);
      
      if (!isValidLanguage) {
        console.warn(`Language ${language} is not available. Falling back to 'fr'`);
        language = 'fr';
      }

      // Attendre que la traduction soit chargée
      const translation = await this.translate.use(language).toPromise();
      console.log('Translation loaded:', translation ? 'Success' : 'Failed');
      
      // Update the current language subject
      this.currentLanguageSubject.next(language);
      
 
      localStorage.setItem(this.LANGUAGE_KEY, language);
      
   
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
      
  
      document.body.classList.remove('rtl', 'ltr');
      document.body.classList.add(language === 'ar' ? 'rtl' : 'ltr');
      
      console.log(`Language successfully changed to: ${language}`);
      console.log('Current translate service language:', this.translate.currentLang);
      
    } catch (error) {
      console.error('Error changing language:', error);
    }
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

  // Method to get translated text with fallback
  getText(key: string, params?: any): string {
    const translation = this.translate.instant(key, params);
    
    // Si la traduction retourne la clé, cela signifie qu'elle n'a pas été trouvée
    if (translation === key) {
      console.warn(`Translation key '${key}' not found for language '${this.getCurrentLanguage()}'`);
    }
    
    return translation;
  }

  // Méthode pour forcer le rechargement des traductions
  async reloadTranslations(): Promise<void> {
    const currentLang = this.getCurrentLanguage();
    this.translate.reloadLang(currentLang);
    await this.translate.use(currentLang).toPromise();
  }
}