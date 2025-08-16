import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container" [dir]="isRTL() ? 'rtl' : 'ltr'" [lang]="getCurrentLanguage()">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'AOS MICEPP';

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    console.log('AppComponent constructor called');
    // Configure default language
    this.translate.setDefaultLang('fr');
    
    // Set available languages
    this.translate.addLangs(['fr', 'ar']);
    
    console.log('Translation service configured');
  }

  ngOnInit(): void {
    console.log('AppComponent ngOnInit called');
    // Initialize language from service
    const currentLang = this.languageService.getCurrentLanguage();
    console.log('Current language:', currentLang);
    this.translate.use(currentLang);
    console.log('Language set in translation service');
  }

  getCurrentLanguage(): string {
    return this.languageService.getCurrentLanguage();
  }

  isRTL(): boolean {
    return this.languageService.isRTL();
  }
}