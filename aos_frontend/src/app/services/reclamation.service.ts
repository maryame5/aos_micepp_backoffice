import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { UserDTO } from '../models/user.model';

export interface Reclamation {
  id: number;
  objet: string;
  contenu: string;
  statut: string;
  dateSoumission: string;
  lastModifiedDate?: string;
  utilisateur: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  commentaire?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private apiUrl = 'http://localhost:8089/AOS_MICEPP/Reclamation'; 
  private userApiUrl = 'http://localhost:8089/AOS_MICEPP/demandes'; 
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHttpOptions() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // Récupérer toutes les réclamations
  getComplaints(): Observable<Reclamation[]> {
    console.log('ReclamationService: Getting all complaints');
    return this.http.get<Reclamation[]>(`${this.apiUrl}/All`, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error in getComplaints:', error);
          return throwError(() => error);
        })
      );
  }

  // Récupérer une réclamation par ID
  getComplaintById(id: number): Observable<Reclamation> {
    console.log('ReclamationService: Getting complaint by id:', id);
    return this.http.get<Reclamation>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error in getComplaintById:', error);
          return throwError(() => error);
        })
      );
  }

  // Affecter une réclamation à un utilisateur
  assignComplaint(complaintId: number, userId: number | null): Observable<Reclamation> {
    console.log('ReclamationService: Assigning complaint', { complaintId, userId });
    
    if (userId === null) {
      // Pour désaffecter, on peut envoyer une requête PATCH sans userId ou avec userId = null
      // Selon ton backend, tu peux avoir besoin d'ajuster cette partie
      return this.http.patch<Reclamation>(`${this.apiUrl}/${complaintId}/assign/null`, {}, this.getHttpOptions())
        .pipe(
          catchError(error => {
            console.error('Error in assignComplaint (unassign):', error);
            return throwError(() => error);
          })
        );
    }

    return this.http.patch<Reclamation>(`${this.apiUrl}/${complaintId}/assign/${userId}`, {}, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error in assignComplaint:', error);
          return throwError(() => error);
        })
      );
  }

  // Récupérer les utilisateurs avec le rôle SUPPORT
  getSupportUsers(): Observable<UserDTO[]> {
    console.log('ReclamationService: Getting support users');
    return this.http.get<UserDTO[]>(`${this.userApiUrl}/support-users`, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error in getSupportUsers:', error);
          // Si l'endpoint n'existe pas encore, tu peux retourner un tableau vide ou créer l'endpoint
          return throwError(() => error);
        })
      );
  }

  // Récupérer les réclamations assignées à un utilisateur
  getAssignedComplaints(userId: number): Observable<Reclamation[]> {
    console.log('ReclamationService: Getting assigned complaints for user:', userId);
    return this.http.get<Reclamation[]>(`${this.apiUrl}/assigned/${userId}`, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error in getAssignedComplaints:', error);
          return throwError(() => error);
        })
      );
  }



  // Update complaint with both status and comment in a single request
  updateComplaint(complaintId: number, status: string, comment: string): Observable<Reclamation> {
    const updateRequest = {
      statut: status,
      commentaire: comment
    };

    return this.http.patch<Reclamation>(`${this.apiUrl}/${complaintId}/update`, updateRequest, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error in updateComplaint:', error);
          return throwError(() => error);
        })
      );
  }
}