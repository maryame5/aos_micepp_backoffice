import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User, UserDTO, UserRole } from '../models/user.model';
import { environment } from '../../environments/environment';

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  cin: string;
  matricule: string;
  role: string;
  department: String;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl + '/api/v1/admin/users';

  constructor(private http: HttpClient) {}


  registerUser(userData: RegisterUserRequest): Observable<any> {
    console.log('Registering user with data:', userData);
    console.log('API URL:', `${this.apiUrl}/register-user`);

    return this.http.post(`${this.apiUrl}/register-user`, userData, { responseType: 'text' })
      .pipe(
        catchError(this.handleError)
      );
  }

 
  getAllUsers(): Observable<UserDTO[]> {

  return this.http.get<UserDTO[]>(this.apiUrl).pipe(
    map(users => users.map(user => ({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      department: user.department,
      email: user.email,
      username: user.username || '',
      enabled: user.enabled,
      role: user.role,
      usingTemporaryPassword: user.usingTemporaryPassword,
      phone: user.phone,
      cin: user.cin,
      matricule: user.matricule,
      createdAt: new Date(),
      updatedAt: new Date()
    } as unknown as UserDTO))),
    catchError(this.handleError)
  );
}

  
  getUserById(id: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/${id}`).pipe(
      map(user => ({
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        department: user.department,
        email: user.email,
        matricule: user.matricule,
        cin: user.cin,
        username: user.username || '',
        enabled: user.enabled,
        role: user.role,
        usingTemporaryPassword: user.usingTemporaryPassword,
        phone: user.phone,
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as UserDTO)),
      catchError(this.handleError)
    );
  }


  getUsersCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`)
      .pipe(
        
        catchError(this.handleError)
      );
  }

  
  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/role/${role}`)
      .pipe(
        map(users => users.map(user => ({
          id: user.id,
          firstname: user.firstName || '',
          lastname: user.lastName || '',
          email: user.email,
          role: `ROLE_${user.role}` as string,
          phone: user.phoneNumber,
        
          createdAt: new Date(),
          updatedAt: new Date()
        } as unknown as User))),
      catchError(this.handleError)
      );
  }

 
  getRecentUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/recent`)
      .pipe(
        map(users => users.map(user => ({
          id: user.id,
          firstname: user.firstname || '',
          lastname: user.lastname || '',
          email: user.email,
          username: user.username || '',
          enabled: user.enabled,
          role: `ROLE_${user.role}` as string,
          usingTemporaryPassword: user.usingTemporaryPassword,
          phone: user.phone,
          cin: user.cin,
          matricule: user.matricule,
          department: user.department,
          createdAt: new Date(),
          updatedAt: new Date()
        } as unknown as UserDTO))),
      catchError(this.handleError)
      );
  }

  updateUser(id: String, userData: Partial<UserDTO>): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/${id}`, userData);
  }

 
  resetUserPassword(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reset-password`, {});
  }

  toggleUserStatus(id: number, enabled: boolean): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggle-status`, null, {
      params: { enabled: enabled.toString() }
    });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
     
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
  
      switch (error.status) {
        case 400:
          errorMessage = 'Données invalides. Vérifiez les informations saisies.';
          break;
        case 401:
          errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
          break;
        case 403:
          errorMessage = 'Accès interdit. Vous n\'avez pas les permissions nécessaires.';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée.';
          break;
        case 409:
          errorMessage = 'Un utilisateur avec cet email, CIN ou matricule existe déjà.';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }
    
    console.error('UserService error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
