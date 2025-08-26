import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceRequest, RequestStatus, RequestPriority, Service } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = 'http://localhost:8089/AOS_MICEPP/requests';

  constructor(private http: HttpClient) {}

  getRequests(): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(this.apiUrl);
  }

  getRequestById(id: string): Observable<ServiceRequest> {
    return this.http.get<ServiceRequest>(`${this.apiUrl}/${id}`);
  }

  getUserRequests(userId: string): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/user/${userId}`);
  }

  createRequest(request: Partial<ServiceRequest>): Observable<ServiceRequest> {
    return this.http.post<ServiceRequest>(this.apiUrl, request);
  }

  updateRequestStatus(id: string, status: RequestStatus): Observable<ServiceRequest> {
    return this.http.patch<ServiceRequest>(`${this.apiUrl}/${id}/status`, { status });
  }

  assignRequest(id: string, assignedTo: string): Observable<ServiceRequest> {
    return this.http.patch<ServiceRequest>(`${this.apiUrl}/${id}/assign`, { assignedTo });
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