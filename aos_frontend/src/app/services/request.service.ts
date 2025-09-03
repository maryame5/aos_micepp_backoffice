import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestStatus, Service, ServiceRequest } from '../models/request.model';
import { User } from '../models/user.model';

interface DocumentJustificatif {
  id: number;
  fileName: string;
  contentType: string;
  uploadedAt: string;
}

interface Demande {
  id: number;
  dateSoumission: string;
  statut: string;
  commentaire: string;
  utilisateurId: number;
  utilisateurNom: string;
  utilisateurEmail: string;
  documentsJustificatifs: DocumentJustificatif[];
  serviceNom: string;
  serviceId: number;
  assignedTo?: { id: number; username: string } | null;
}


@Injectable({
  providedIn: 'root'
})
export class RequestService {
  
  private apiUrl = 'http://localhost:8089/AOS_MICEPP/demandes';
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('aos_token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
    }

  constructor(private http: HttpClient) {}

  getRequests(): Observable<Demande[]> {
    return this.http.get<Demande[]>(this.apiUrl);
  }

  getRequestById(id: number): Observable<Demande> {
    return this.http.get<Demande>(`${this.apiUrl}/${id}`);
  }

  getDemandeServiceData(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/service-data`);
  }

  getSupportUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/support-users`, {
      headers: new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('aos_token')}`
    })
    });
  }

  assignRequest(id: number, userId: number): Observable<Demande> {
    return this.http.patch<Demande>(`${this.apiUrl}/${id}/assign`, { userId }, {
      headers: new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('aos_token')}`
    })
    });
  }

 downloadDocument(demandeId: number, documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${demandeId}/documents/${documentId}`, { responseType: 'blob' });
  }

  updateRequestStatus(id: number, status: string): Observable<Demande> {
    return this.http.patch<Demande>(`${this.apiUrl}/${id}/status`, { statut: status });
  }

  addComment(id: number, comment: string): Observable<any> {
    // Assuming comment structure { content: string }
    return this.http.post<any>(`${this.apiUrl}/${id}/comments`, { content: comment });
  }

  uploadResponseDocument(id: number, file: File): Observable<DocumentJustificatif> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<DocumentJustificatif>(`${this.apiUrl}/${id}/response-document`, formData);
  }

  getUserRequests(userId: string): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/user/${userId}`);
  }

  createRequest(request: Partial<ServiceRequest>): Observable<ServiceRequest> {
    return this.http.post<ServiceRequest>(this.apiUrl, request);
  }


 

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`);
  }

  getServiceById(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/services/${id}`);
  }

  getRequestsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  getPendingRequestsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/pending`);
  }

  getRecentRequests(limit: number = 5): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/recent?limit=${limit}`);
  }
}
