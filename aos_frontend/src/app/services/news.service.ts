import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DocumentPublicDTO {
  id: number;
  titre: string;
  description: string;
  contentType: string;
  fileName: string;
  type: string;
  publishedByName: string;
  createdDate: string;
  uploadedAt: string;
  published: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}/documents-public`;

  constructor(private http: HttpClient) { }

  getAllDocuments(): Observable<DocumentPublicDTO[]> {
    return this.http.get<DocumentPublicDTO[]>(this.apiUrl);
  }

  getDocumentById(id: number): Observable<DocumentPublicDTO> {
    return this.http.get<DocumentPublicDTO>(`${this.apiUrl}/${id}`);
  }

  createDocument(formData: FormData): Observable<DocumentPublicDTO> {
    return this.http.post<DocumentPublicDTO>(this.apiUrl, formData);
  }

  updateDocument(id: number, formData: FormData): Observable<DocumentPublicDTO> {
    return this.http.put<DocumentPublicDTO>(`${this.apiUrl}/${id}`, formData);
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }
}
