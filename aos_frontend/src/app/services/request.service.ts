import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ServiceRequest, RequestStatus, RequestPriority, Service } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private mockRequests: ServiceRequest[] = [
    {
      id: '1',
      userId: '3',
      serviceId: '1',
      title: 'Demande de congé exceptionnel',
      description: 'Demande de congé pour raisons familiales',
      status: RequestStatus.PENDING,
      priority: RequestPriority.MEDIUM,
      documents: [],
      comments: [],
      createdAt: new Date(2024, 0, 15),
      updatedAt: new Date(2024, 0, 15),
      dueDate: new Date(2024, 0, 30)
    },
    {
      id: '2',
      userId: '3',
      serviceId: '2',
      title: 'Remboursement frais médicaux',
      description: 'Demande de remboursement suite à consultation spécialisée',
      status: RequestStatus.IN_PROGRESS,
      priority: RequestPriority.HIGH,
      documents: [],
      comments: [],
      createdAt: new Date(2024, 0, 10),
      updatedAt: new Date(2024, 0, 12),
      assignedTo: '2'
    }
  ];

  private mockServices: Service[] = [
    {
      id: '1',
      name: 'Congé exceptionnel',
      description: 'Demande de congé pour raisons personnelles ou familiales',
      category: 'Ressources Humaines',
      isActive: true,
      formFields: [
        {
          id: '1',
          name: 'motif',
          type: 'select',
          label: 'Motif du congé',
          required: true,
          options: ['Maladie', 'Famille', 'Personnel', 'Autre']
        },
        {
          id: '2',
          name: 'dateDebut',
          type: 'date',
          label: 'Date de début',
          required: true
        },
        {
          id: '3',
          name: 'dateFin',
          type: 'date',
          label: 'Date de fin',
          required: true
        }
      ],
      requiredDocuments: ['Certificat médical', 'Justificatif']
    },
    {
      id: '2',
      name: 'Remboursement médical',
      description: 'Demande de remboursement de frais médicaux',
      category: 'Santé',
      isActive: true,
      formFields: [
        {
          id: '1',
          name: 'montant',
          type: 'number',
          label: 'Montant à rembourser (DH)',
          required: true
        },
        {
          id: '2',
          name: 'dateSoin',
          type: 'date',
          label: 'Date du soin',
          required: true
        }
      ],
      requiredDocuments: ['Facture originale', 'Ordonnance']
    }
  ];

  constructor(private http: HttpClient) {}

  getRequests(): Observable<ServiceRequest[]> {
    return of(this.mockRequests).pipe(delay(500));
  }

  getRequestById(id: string): Observable<ServiceRequest | undefined> {
    const request = this.mockRequests.find(r => r.id === id);
    return of(request).pipe(delay(300));
  }

  getUserRequests(userId: string): Observable<ServiceRequest[]> {
    const userRequests = this.mockRequests.filter(r => r.userId === userId);
    return of(userRequests).pipe(delay(500));
  }

  createRequest(request: Partial<ServiceRequest>): Observable<ServiceRequest> {
    const newRequest: ServiceRequest = {
      id: Date.now().toString(),
      userId: request.userId!,
      serviceId: request.serviceId!,
      title: request.title!,
      description: request.description!,
      status: RequestStatus.PENDING,
      priority: request.priority || RequestPriority.MEDIUM,
      documents: request.documents || [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockRequests.push(newRequest);
    return of(newRequest).pipe(delay(1000));
  }

  updateRequestStatus(id: string, status: RequestStatus): Observable<ServiceRequest> {
    const request = this.mockRequests.find(r => r.id === id);
    if (request) {
      request.status = status;
      request.updatedAt = new Date();
    }
    return of(request!).pipe(delay(500));
  }

  assignRequest(id: string, assignedTo: string): Observable<ServiceRequest> {
    const request = this.mockRequests.find(r => r.id === id);
    if (request) {
      request.assignedTo = assignedTo;
      request.updatedAt = new Date();
    }
    return of(request!).pipe(delay(500));
  }

  getServices(): Observable<Service[]> {
    return of(this.mockServices).pipe(delay(300));
  }

  getServiceById(id: string): Observable<Service | undefined> {
    const service = this.mockServices.find(s => s.id === id);
    return of(service).pipe(delay(300));
  }
}