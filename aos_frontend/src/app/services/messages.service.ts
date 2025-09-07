import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MessageContact {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sujet: string;
  message: string;
  createdDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private apiUrl = 'http://localhost:8089/AOS_MICEPP/messages';
  private http = inject(HttpClient);

  getAllMessages(): Observable<MessageContact[]> {
    // Récupérer le token d'authentification
    const token = this.getAuthToken();
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<MessageContact[]>(this.apiUrl, { headers });
  }

  private getAuthToken(): string | null {
    // Ajustez cette méthode selon votre système d'authentification
    return localStorage.getItem('aos_token') || 
           sessionStorage.getItem('aos_token') || 
           null;
  }
}