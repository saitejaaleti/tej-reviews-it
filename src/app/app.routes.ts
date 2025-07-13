import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register', 
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'add-review',
    loadComponent: () => import('./components/review-form/review-form.component').then(m => m.ReviewFormComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./components/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'movies',
    loadComponent: () => import('./components/category/category.component').then(m => m.CategoryComponent),
    data: { category: 'movies' }
  },
  {
    path: 'books',
    loadComponent: () => import('./components/category/category.component').then(m => m.CategoryComponent),
    data: { category: 'books' }
  },
  {
    path: 'shoes',
    loadComponent: () => import('./components/category/category.component').then(m => m.CategoryComponent),
    data: { category: 'shoes' }
  },
  {
    path: 'electronics',
    loadComponent: () => import('./components/category/category.component').then(m => m.CategoryComponent),
    data: { category: 'electronics' }
  },
  {
    path: 'review/:id',
    loadComponent: () => import('./components/review-detail/review-detail.component').then(m => m.ReviewDetailComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];