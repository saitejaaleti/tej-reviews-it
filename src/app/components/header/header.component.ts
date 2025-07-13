import { Component, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <mat-toolbar class="header-toolbar">
      <div class="header-content">
        <!-- Logo and Title -->
        <div class="logo-section">
          <button mat-icon-button routerLink="/" class="logo-btn">
            <mat-icon class="logo-icon">rate_review</mat-icon>
          </button>
          <h1 class="app-title" routerLink="/">Tej Reviews</h1>
        </div>

        <!-- Search Bar -->
        <div class="search-section">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search reviews...</mat-label>
            <input matInput 
                   [(ngModel)]="searchQuery" 
                   (keyup.enter)="onSearch()"
                   placeholder="Movies, books, shoes...">
            <button mat-icon-button matSuffix (click)="onSearch()">
              <mat-icon>search</mat-icon>
            </button>
          </mat-form-field>
        </div>

        <!-- Navigation and User Menu -->
        <div class="nav-section">
          @if (isAuthenticated()) {
            <!-- Authenticated User Menu -->
            <button mat-stroked-button routerLink="/add-review" class="add-review-btn">
              <mat-icon>add</mat-icon>
              Add Review
            </button>

            <button mat-icon-button [matMenuTriggerFor]="categoriesMenu">
              <mat-icon>category</mat-icon>
            </button>

            <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-avatar">
              <img [src]="currentUser()?.avatar" [alt]="currentUser()?.username" class="avatar-img">
            </button>
          } @else {
            <!-- Guest User Menu -->
            <button mat-stroked-button routerLink="/login">Login</button>
            <button mat-flat-button routerLink="/register" color="primary">Sign Up</button>
          }
        </div>
      </div>
    </mat-toolbar>

    <!-- Categories Menu -->
    <mat-menu #categoriesMenu="matMenu" class="categories-menu">
      <button mat-menu-item routerLink="/movies">
        <mat-icon>movie</mat-icon>
        <span>Movies</span>
        <span class="category-count">({{ getCategoryCount('movies') }})</span>
      </button>
      <button mat-menu-item routerLink="/books">
        <mat-icon>book</mat-icon>
        <span>Books</span>
        <span class="category-count">({{ getCategoryCount('books') }})</span>
      </button>
      <button mat-menu-item routerLink="/shoes">
        <mat-icon>sports_cricket</mat-icon>
        <span>Shoes</span>
        <span class="category-count">({{ getCategoryCount('shoes') }})</span>
      </button>
      <button mat-menu-item routerLink="/electronics">
        <mat-icon>devices</mat-icon>
        <span>Electronics</span>
        <span class="category-count">({{ getCategoryCount('electronics') }})</span>
      </button>
      <button mat-menu-item routerLink="/restaurants">
        <mat-icon>restaurant</mat-icon>
        <span>Restaurants</span>
        <span class="category-count">({{ getCategoryCount('restaurants') }})</span>
      </button>
      <button mat-menu-item routerLink="/games">
        <mat-icon>sports_esports</mat-icon>
        <span>Games</span>
        <span class="category-count">({{ getCategoryCount('games') }})</span>
      </button>
    </mat-menu>

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu" class="user-menu">
      <div class="user-info">
        <img [src]="currentUser()?.avatar" [alt]="currentUser()?.username" class="menu-avatar">
        <div class="user-details">
          <div class="username">{{ currentUser()?.username }}</div>
          <div class="email">{{ currentUser()?.email }}</div>
        </div>
      </div>
      <mat-divider></mat-divider>
      <button mat-menu-item routerLink="/profile">
        <mat-icon>person</mat-icon>
        <span>My Profile</span>
      </button>
      <button mat-menu-item routerLink="/profile">
        <mat-icon>rate_review</mat-icon>
        <span>My Reviews</span>
      </button>
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        <span>Logout</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .header-toolbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .logo-icon {
      font-size: 32px;
      color: #FFD700;
    }

    .app-title {
      margin: 0 0 0 10px;
      font-size: 24px;
      font-weight: 600;
      text-decoration: none;
      color: white;
      cursor: pointer;
    }

    .search-section {
      flex: 1;
      max-width: 400px;
      margin: 0 20px;
    }

    .search-field {
      width: 100%;
    }

    .search-field .mat-mdc-form-field-focus-overlay {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .add-review-btn {
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .user-avatar {
      border-radius: 50%;
      overflow: hidden;
    }

    .avatar-img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .categories-menu .mat-mdc-menu-item {
      min-height: 48px;
    }

    .category-count {
      margin-left: auto;
      color: #666;
      font-size: 12px;
    }

    .user-menu .user-info {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #f5f5f5;
      margin: -8px -8px 8px -8px;
    }

    .menu-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-right: 12px;
    }

    .user-details .username {
      font-weight: 600;
      font-size: 16px;
    }

    .user-details .email {
      color: #666;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .search-section {
        display: none;
      }
      
      .app-title {
        font-size: 18px;
      }
      
      .header-content {
        padding: 0 10px;
      }
    }
  `]
})
export class HeaderComponent {
  searchQuery = '';

  constructor(
    private authService: AuthService,
    private reviewService: ReviewService,
    private router: Router
  ) {}

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;
  
  categoryStats = computed(() => this.reviewService.getCategoryStats());

  getCategoryCount(category: string): number {
    return this.categoryStats()[category] || 0;
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery.trim() } 
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}