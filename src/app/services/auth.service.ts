import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  joinDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);

  constructor(private router: Router) {
    this.loadUserFromStorage();
  }

  get currentUser() {
    return this.currentUserSignal.asReadonly();
  }

  get isAuthenticated() {
    return this.isAuthenticatedSignal.asReadonly();
  }

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        if (email && password) {
          const user: User = {
            id: this.generateId(),
            username: email.split('@')[0],
            email,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
            joinDate: new Date()
          };
          
          this.setUser(user);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  }

  register(username: string, email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: this.generateId(),
          username,
          email,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
          joinDate: new Date()
        };
        
        this.setUser(user);
        resolve(true);
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    localStorage.removeItem('tej_reviews_user');
    this.router.navigate(['/']);
  }

  private setUser(user: User): void {
    this.currentUserSignal.set(user);
    this.isAuthenticatedSignal.set(true);
    localStorage.setItem('tej_reviews_user', JSON.stringify(user));
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('tej_reviews_user');
    if (userData) {
      const user = JSON.parse(userData);
      this.currentUserSignal.set(user);
      this.isAuthenticatedSignal.set(true);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}