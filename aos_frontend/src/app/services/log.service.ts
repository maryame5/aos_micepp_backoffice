import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Log } from '../models/log.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = `${environment.apiUrl}/logs`;

  constructor(private http: HttpClient) {}

  getMyLogs(): Observable<Log[]> {
    return this.http.get<Log[]>(`${this.apiUrl}/my`);
  }

  getAllLogs(): Observable<Log[]> {
    return this.http.get<Log[]>(`${this.apiUrl}/all`);
  }
}
