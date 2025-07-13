import { Component, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReviewService, Review } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { ReviewCardComponent } from '../review-card/review-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatGridListModule,
    MatProgressBarModule,
    ReviewCardComponent
  ],
  template: `
    <div class="dashboard-container fade-in">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Welcome to Tej Reviews</h1>
          <p class="hero-subtitle">Discover honest reviews on movies, books, shoes, and everything in between</p>
          @if (isAuthenticated()) {
            <button mat-flat-button color="primary" routerLink="/add-review" class="cta-button">
              <mat-icon>add</mat-icon>
              Write Your First Review
            </button>
          } @else {
            <div class="hero-actions">
              <button mat-flat-button color="primary" routerLink="/register" class="cta-button">
                <mat-icon>person_add</mat-icon>
                Join Now
              </button>
              <button mat-stroked-button routerLink="/login" class="secondary-button">
                Sign In
              </button>
            </div>
          }
        </div>
        <div class="hero-stats">
          <div class="stat-card">
            <mat-icon>rate_review</mat-icon>
            <span class="stat-number">{{ totalReviews() }}</span>
            <span class="stat-label">Reviews</span>
          </div>
          <div class="stat-card">
            <mat-icon>category</mat-icon>
            <span class="stat-number">{{ totalCategories() }}</span>
            <span class="stat-label">Categories</span>
          </div>
          <div class="stat-card">
            <mat-icon>people</mat-icon>
            <span class="stat-number">{{ totalUsers() }}</span>
            <span class="stat-label">Users</span>
          </div>
        </div>
      </section>

      <!-- Quick Categories -->
      <section class="categories-section">
        <h2 class="section-title">Browse by Category</h2>
        <div class="categories-grid">
          @for (category of categories(); track category.name) {
            <mat-card class="category-card" (click)="navigateToCategory(category.route)">
              <mat-card-content>
                <div class="category-icon">
                  <mat-icon>{{ category.icon }}</mat-icon>
                </div>
                <h3>{{ category.name }}</h3>
                <p>{{ category.count }} reviews</p>
                <div class="category-progress">
                  <mat-progress-bar mode="determinate" [value]="category.percentage"></mat-progress-bar>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </section>

      <!-- Recent Reviews -->
      <section class="reviews-section">
        <div class="section-header">
          <h2 class="section-title">Recent Reviews</h2>
          <button mat-stroked-button routerLink="/search" class="view-all-btn">
            View All
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>
        <div class="reviews-grid">
          @for (review of recentReviews(); track review.id) {
            <app-review-card [review]="review"></app-review-card>
          } @empty {
            <div class="empty-state">
              <mat-icon>rate_review</mat-icon>
              <h3>No reviews yet</h3>
              <p>Be the first to share your thoughts!</p>
              @if (isAuthenticated()) {
                <button mat-flat-button color="primary" routerLink="/add-review">
                  Write a Review
                </button>
              }
            </div>
          }
        </div>
      </section>

      <!-- Top Rated Reviews -->
      @if (topRatedReviews().length > 0) {
        <section class="reviews-section">
          <div class="section-header">
            <h2 class="section-title">Top Rated Reviews</h2>
            <button mat-stroked-button (click)="showTopRated = !showTopRated" class="view-all-btn">
              {{ showTopRated ? 'Show Less' : 'Show More' }}
              <mat-icon>{{ showTopRated ? 'expand_less' : 'expand_more' }}</mat-icon>
            </button>
          </div>
          @if (showTopRated) {
            <div class="reviews-grid slide-in">
              @for (review of topRatedReviews(); track review.id) {
                <app-review-card [review]="review"></app-review-card>
              }
            </div>
          }
        </section>
      }

      <!-- Most Liked Reviews -->
      @if (mostLikedReviews().length > 0) {
        <section class="reviews-section">
          <div class="section-header">
            <h2 class="section-title">Most Liked Reviews</h2>
            <button mat-stroked-button (click)="showMostLiked = !showMostLiked" class="view-all-btn">
              {{ showMostLiked ? 'Show Less' : 'Show More' }}
              <mat-icon>{{ showMostLiked ? 'expand_less' : 'expand_more' }}</mat-icon>
            </button>
          </div>
          @if (showMostLiked) {
            <div class="reviews-grid slide-in">
              @for (review of mostLikedReviews(); track review.id) {
                <app-review-card [review]="review"></app-review-card>
              }
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 60px 40px;
      border-radius: 20px;
      margin-bottom: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 30px;
    }

    .hero-content {
      flex: 1;
      min-width: 300px;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 16px;
      background: linear-gradient(45deg, #FFD700, #FFA500);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.2rem;
      margin-bottom: 30px;
      opacity: 0.9;
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .cta-button {
      padding: 15px 30px;
      font-size: 16px;
      border-radius: 25px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .secondary-button {
      padding: 15px 30px;
      font-size: 16px;
      border-radius: 25px;
      border-color: rgba(255, 255, 255, 0.5);
      color: white;
    }

    .hero-stats {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 15px;
      text-align: center;
      min-width: 120px;
      backdrop-filter: blur(10px);
    }

    .stat-card mat-icon {
      font-size: 32px;
      color: #FFD700;
      margin-bottom: 10px;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: white;
    }

    .stat-label {
      display: block;
      font-size: 0.9rem;
      opacity: 0.8;
      margin-top: 5px;
    }

    .categories-section {
      margin-bottom: 50px;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 25px;
      color: #333;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .category-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 15px;
    }

    .category-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    }

    .category-card mat-card-content {
      text-align: center;
      padding: 30px 20px;
    }

    .category-icon mat-icon {
      font-size: 48px;
      color: #667eea;
      margin-bottom: 15px;
    }

    .category-card h3 {
      margin: 10px 0 5px 0;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .category-card p {
      color: #666;
      margin-bottom: 15px;
    }

    .category-progress {
      width: 100%;
    }

    .reviews-section {
      margin-bottom: 50px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .view-all-btn {
      border-radius: 20px;
    }

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 25px;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      background: #f9f9f9;
      border-radius: 15px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      color: #ccc;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: #666;
      margin-bottom: 10px;
    }

    .empty-state p {
      color: #999;
      margin-bottom: 20px;
    }

    @media (max-width: 768px) {
      .hero-section {
        padding: 40px 20px;
        text-align: center;
      }

      .hero-title {
        font-size: 2.2rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .categories-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .reviews-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  showTopRated = false;
  showMostLiked = false;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Component initialization if needed
  }

  isAuthenticated = this.authService.isAuthenticated;
  
  reviews = this.reviewService.reviews;
  recentReviews = computed(() => this.reviewService.getRecentReviews(6));
  topRatedReviews = computed(() => this.reviewService.getTopRatedReviews(6));
  mostLikedReviews = computed(() => this.reviewService.getMostLikedReviews(6));
  
  totalReviews = computed(() => this.reviews().length);
  totalCategories = computed(() => Object.keys(this.reviewService.getCategoryStats()).length);
  totalUsers = computed(() => {
    const uniqueUsers = new Set(this.reviews().map(r => r.author.id));
    return uniqueUsers.size || 1;
  });

  categories = computed(() => {
    const stats = this.reviewService.getCategoryStats();
    const totalReviews = this.totalReviews();
    
    const categoryData = [
      { name: 'Movies', route: '/movies', icon: 'movie', key: 'movies' },
      { name: 'Books', route: '/books', icon: 'book', key: 'books' },
      { name: 'Shoes', route: '/shoes', icon: 'sports_cricket', key: 'shoes' },
      { name: 'Electronics', route: '/electronics', icon: 'devices', key: 'electronics' },
      { name: 'Restaurants', route: '/restaurants', icon: 'restaurant', key: 'restaurants' },
      { name: 'Games', route: '/games', icon: 'sports_esports', key: 'games' }
    ];

    return categoryData.map(cat => ({
      ...cat,
      count: stats[cat.key] || 0,
      percentage: totalReviews > 0 ? ((stats[cat.key] || 0) / totalReviews) * 100 : 0
    }));
  });

  navigateToCategory(route: string): void {
    this.router.navigate([route]);
  }
}