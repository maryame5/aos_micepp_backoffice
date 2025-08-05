import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header moderne avec palette bleue -->
      <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <!-- Logo et titre -->
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span class="text-blue-600 font-bold text-lg">AOS</span>
              </div>
              <div>
                <h1 class="text-xl font-bold">AOS MICEPP</h1>
                <p class="text-xs text-blue-100">Association des Œuvres Sociales</p>
              </div>
            </div>

            <!-- Navigation -->
            <nav class="hidden md:flex space-x-8">
              <a routerLink="/" routerLinkActive="text-blue-200" class="hover:text-blue-200 transition-colors flex items-center space-x-1">
                <i class="fas fa-home"></i>
                <span>Accueil</span>
              </a>
              <a routerLink="/services" routerLinkActive="text-blue-200" class="hover:text-blue-200 transition-colors flex items-center space-x-1">
                <i class="fas fa-cogs"></i>
                <span>Services</span>
              </a>
              <a routerLink="/news" routerLinkActive="text-blue-200" class="hover:text-blue-200 transition-colors flex items-center space-x-1">
                <i class="fas fa-newspaper"></i>
                <span>Actualités</span>
              </a>
              <a routerLink="/contact" routerLinkActive="text-blue-200" class="hover:text-blue-200 transition-colors flex items-center space-x-1">
                <i class="fas fa-envelope"></i>
                <span>Contact</span>
              </a>
            </nav>

            <!-- Actions -->
            <div class="flex items-center space-x-4">
              <!-- Sélecteur de langue -->
              <div class="flex items-center space-x-2">
                <i class="fas fa-globe"></i>
                <span class="text-sm">FR</span>
              </div>
              
              <!-- Bouton connexion -->
              <a routerLink="/auth/login" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <i class="fas fa-sign-in-alt"></i>
                <span>Connexion</span>
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Contenu principal -->
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class PublicLayoutComponent {}