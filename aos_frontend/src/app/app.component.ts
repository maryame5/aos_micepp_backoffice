import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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
  }

  ngOnInit(): void {
    // Initialize language from service
    const currentLang = this.languageService.getCurrentLanguage();
    this.translate.use(currentLang);
  }

  getCurrentLanguage(): string {
    return this.languageService.getCurrentLanguage();
  }

  isRTL(): boolean {
    return this.languageService.isRTL();
  }
}