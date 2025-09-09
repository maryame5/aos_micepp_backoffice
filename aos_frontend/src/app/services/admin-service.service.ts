import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceDTO {
  id?: number;
  nom: string;
  type: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  isActive?: boolean;
}

export interface CreateServiceRequest {
  nom: string;
  type: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
}

export interface UpdateServiceRequest {
  nom: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminServiceService {
  private apiUrl = `http://localhost:8089/AOS_MICEPP/api/admin/services`;

  constructor(private http: HttpClient) { }

  getAllServicesForAdmin(): Observable<ServiceDTO[]> {
    return this.http.get<ServiceDTO[]>(this.apiUrl);
  }

  getServiceById(id: number): Observable<ServiceDTO> {
    return this.http.get<ServiceDTO>(`${this.apiUrl}/${id}`);
  }

  createService(service: CreateServiceRequest): Observable<ServiceDTO> {
    return this.http.post<ServiceDTO>(this.apiUrl, service);
  }

  updateService(id: number, service: UpdateServiceRequest): Observable<ServiceDTO> {
    return this.http.put<ServiceDTO>(`${this.apiUrl}/${id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleServiceStatus(id: number): Observable<ServiceDTO> {
    return this.http.put<ServiceDTO>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  getAvailableServiceTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/types`);
  }
}