import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { UserRole } from './models/user.model';

export const routes: Routes = [
 
  // Root redirect
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },



  // Authentication routes
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [GuestGuard],
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
      },
      
      {
        path: 'change-password',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
      }
    ]
  },



  // Admin routes
  {
    path: 'admin',
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    canActivate: [AuthGuard],
    data: { roles: [UserRole.ADMIN, UserRole.SUPPORT] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users/admin-users.component').then(m => m.AdminUsersComponent),
        canActivate: [AuthGuard],
        data: { roles: [UserRole.ADMIN] }
      },
      {
        path: 'users/add',
        loadComponent: () => import('./pages/admin/users/add-user/add-user.component').then(m => m.AddUserComponent),
        canActivate: [AuthGuard],
        data: { roles: [UserRole.ADMIN] }
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./pages/admin/users/detail_user/detail_user.component').then(m => m.UserDetailsComponent),
        canActivate: [AuthGuard],
        data: { roles: [UserRole.ADMIN] }
      },
      {
        path: 'requests',
        loadComponent: () => import('./pages/admin/requests/admin-requests.component').then(m => m.AdminRequestsComponent),
        canActivate: [AuthGuard],
        data: { roles: [UserRole.ADMIN] }
      },

      {
        path: 'requests/:id',
        loadComponent: () => import('./pages/admin/requests/request-detail/request-detail.component').then(m => m.AdminRequestDetailComponent)
      },
      {
        path: 'my-requests',
        loadComponent: () => import('./pages/admin/my-requests/my-requests.component').then(m => m.MyRequestsComponent)
      },
      {
        path: 'complaints',
        loadComponent: () => import('./pages/admin/complaints/admin-complaints.component').then(m => m.AdminComplaintsComponent),
        canActivate: [AuthGuard],
        data: { roles: [UserRole.ADMIN] }
      },
      {
        path: 'complaints/:id',
        loadComponent: () => import('./pages/admin/complaints/complaint-detail/complaint-detail.component').then(m => m.AdminComplaintDetailComponent),
        canActivate: [AuthGuard],
        data: { roles: [UserRole.ADMIN] }
      },
      {
        path: 'my-complaints',
        loadComponent: () => import('./pages/admin/my-complaints/my-complaints.component').then(m => m.MyComplaintsComponent)
      },
        {
          path: 'contact',
          loadComponent: () => import('./pages/public/contact/contact.component').then(c =>c.AdminMessagesComponent)
         },
      {
        path: 'services',
        loadComponent: () => import('./pages/admin/services/admin-services.component').then(m => m.AdminServicesComponent),
        canActivate: [AuthGuard],
        data: { roles: [UserRole.ADMIN] }
      },
      {
        path: 'news',
        loadComponent: () => import('./pages/admin/news/admin-news.component').then(m => m.AdminNewsComponent),
        canActivate: [AuthGuard],
        data: { roles: [UserRole.ADMIN] }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },



  // Error routes
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/error/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '404',
    loadComponent: () => import('./pages/error/not-found/not-found.component').then(m => m.NotFoundComponent)
  },

  // Wildcard route
  {
    path: '**',
    redirectTo: '/404'
  }
];