import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User, UserDTO, UserRole } from '../models/user.model';

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
  private apiUrl = 'http://localhost:8089/AOS_MICEPP/api/v1/admin/users';

  constructor(private http: HttpClient) {}

  /**
   * Register a new user
   */
  registerUser(userData: RegisterUserRequest): Observable<any> {
    console.log('Registering user with data:', userData);
    console.log('API URL:', `${this.apiUrl}/register-user`);

    return this.http.post(`${this.apiUrl}/register-user`, userData, { responseType: 'text' })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get all users
   */
  getAllUsers(): Observable<UserDTO[]> {
  
  return this.http.get<UserDTO[]>(this.apiUrl).pipe(
    map(users => users.map(user => ({
      id: user.id,
      firstName: user.firstname ,
      lastName: user.lastname ,
      department:user.department,
      email: user.email,
      user:user,
      role: user.role,
      usingTemporaryPassword: user.usingTemporaryPassword,
      phone: user.phone,
      createdAt: new Date(),
      updatedAt: new Date()
    } as unknown as UserDTO))),
    catchError(this.handleError)
  );
}

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get users count
   */
  getUsersCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get users by role
   */
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

  /**
   * Get recent users (last 30 days)
   */
  getRecentUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/recent`)
      .pipe(
        map(users => users.map(user => ({
          id: user.id,
          firstname: user.firstname || '',
          lastName: user.lastname || '',
          email: user.email,
          role: `ROLE_${user.role}` as string,
          phone: user.phone,

          createdAt: new Date(),
          updatedAt: new Date()
        } as unknown as UserDTO))),
      catchError(this.handleError)
      );
  }

  updateUser(user: UserDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}`, user)
      .pipe(
        catchError(this.handleError)
      );
  }


  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Server-side error
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
