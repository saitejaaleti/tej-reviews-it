import { Component, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService, User } from '../../services/auth.service';
import { ReviewService, Review } from '../../services/review.service';
import { ReviewCardComponent } from '../review-card/review-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressBarModule,
    ReviewCardComponent
  ],
  template: `
    @if (!isAuthenticated()) {
      <div class="auth-required fade-in">
        <mat-card class="auth-card">
          <mat-card-content>
            <div class="auth-content">
              <mat-icon class="auth-icon">account_circle</mat-icon>
              <h2>Profile Access Required</h2>
              <p>You need to be logged in to view your profile.</p>
              <div class="auth-actions">
                <button mat-flat-button color="primary" routerLink="/login">Sign In</button>
                <button mat-stroked-button routerLink="/register">Create Account</button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    } @else {
      <div class="profile-container fade-in">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="profile-background"></div>
          <div class="profile-content">
            <div class="profile-avatar-section">
              <img [src]="currentUser()!.avatar" [alt]="currentUser()!.username" class="profile-avatar">
              <div class="profile-info">
                <h1 class="profile-name">{{ currentUser()!.username }}</h1>
                <p class="profile-email">{{ currentUser()!.email }}</p>
                <div class="profile-stats">
                  <div class="stat">
                    <span class="stat-number">{{ userReviews().length }}</span>
                    <span class="stat-label">Reviews</span>
                  </div>
                  <div class="stat">
                    <span class="stat-number">{{ totalLikes() }}</span>
                    <span class="stat-label">Likes</span>
                  </div>
                  <div class="stat">
                    <span class="stat-number">{{ averageRating() }}</span>
                    <span class="stat-label">Avg Rating</span>
                  </div>
                  <div class="stat">
                    <span class="stat-number">{{ membershipDays() }}</span>
                    <span class="stat-label">Days</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="profile-actions">
              <button mat-flat-button color="primary" routerLink="/add-review">
                <mat-icon>add</mat-icon>
                Write Review
              </button>
              <button mat-stroked-button (click)="toggleEditMode()">
                <mat-icon>{{ isEditMode() ? 'close' : 'edit' }}</mat-icon>
                {{ isEditMode() ? 'Cancel' : 'Edit Profile' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Edit Profile Form -->
        @if (isEditMode()) {
          <mat-card class="edit-profile-card slide-in">
            <mat-card-header>
              <mat-card-title>Edit Profile</mat-card-title>
              <mat-card-subtitle>Update your profile information</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="profile-form">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Username</mat-label>
                    <input matInput formControlName="username" placeholder="Your username">
                    @if (profileForm.get('username')?.hasError('required') && profileForm.get('username')?.touched) {
                      <mat-error>Username is required</mat-error>
                    }
                  </mat-form-field>
                </div>
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email" placeholder="Your email">
                    @if (profileForm.get('email')?.hasError('required') && profileForm.get('email')?.touched) {
                      <mat-error>Email is required</mat-error>
                    }
                    @if (profileForm.get('email')?.hasError('email') && profileForm.get('email')?.touched) {
                      <mat-error>Please enter a valid email</mat-error>
                    }
                  </mat-form-field>
                </div>
                <div class="form-actions">
                  <button mat-stroked-button type="button" (click)="cancelEdit()">Cancel</button>
                  <button mat-flat-button color="primary" type="submit" [disabled]="profileForm.invalid">
                    Save Changes
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        }

        <!-- Profile Content Tabs -->
        <mat-card class="profile-tabs-card">
          <mat-tab-group class="profile-tabs" [selectedIndex]="selectedTabIndex()">
            <!-- My Reviews Tab -->
            <mat-tab label="My Reviews">
              <div class="tab-content">
                <!-- Reviews Filter -->
                <div class="reviews-filter">
                  <div class="filter-header">
                    <h3>My Reviews ({{ userReviews().length }})</h3>
                    <div class="filter-controls">
                      <button mat-stroked-button [class.active]="reviewFilter() === 'all'" (click)="setReviewFilter('all')">
                        All
                      </button>
                      <button mat-stroked-button [class.active]="reviewFilter() === 'movies'" (click)="setReviewFilter('movies')">
                        Movies
                      </button>
                      <button mat-stroked-button [class.active]="reviewFilter() === 'books'" (click)="setReviewFilter('books')">
                        Books
                      </button>
                      <button mat-stroked-button [class.active]="reviewFilter() === 'shoes'" (click)="setReviewFilter('shoes')">
                        Shoes
                      </button>
                      <button mat-stroked-button [class.active]="reviewFilter() === 'electronics'" (click)="setReviewFilter('electronics')">
                        Electronics
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Reviews Grid -->
                @if (filteredUserReviews().length > 0) {
                  <div class="reviews-grid">
                    @for (review of filteredUserReviews(); track review.id) {
                      <app-review-card [review]="review"></app-review-card>
                    }
                  </div>
                } @else if (userReviews().length === 0) {
                  <div class="empty-state">
                    <mat-icon class="empty-icon">rate_review</mat-icon>
                    <h3>No reviews yet</h3>
                    <p>Start sharing your thoughts and experiences!</p>
                    <button mat-flat-button color="primary" routerLink="/add-review">
                      Write Your First Review
                    </button>
                  </div>
                } @else {
                  <div class="empty-filter">
                    <mat-icon class="empty-icon">filter_alt_off</mat-icon>
                    <h3>No {{ reviewFilter() }} reviews</h3>
                    <p>You haven't reviewed any {{ reviewFilter() }} yet.</p>
                    <button mat-stroked-button (click)="setReviewFilter('all')">
                      Show All Reviews
                    </button>
                  </div>
                }
              </div>
            </mat-tab>

            <!-- Analytics Tab -->
            <mat-tab label="Analytics">
              <div class="tab-content">
                <div class="analytics-section">
                  <h3>Review Analytics</h3>
                  
                  <!-- Category Breakdown -->
                  <div class="analytics-grid">
                    <mat-card class="analytics-card">
                      <mat-card-header>
                        <mat-card-title>Categories</mat-card-title>
                        <mat-card-subtitle>Reviews by category</mat-card-subtitle>
                      </mat-card-header>
                      <mat-card-content>
                        @for (category of categoryBreakdown(); track category.name) {
                          <div class="category-stat">
                            <div class="category-info">
                              <mat-icon>{{ category.icon }}</mat-icon>
                              <span class="category-name">{{ category.name }}</span>
                            </div>
                            <div class="category-data">
                              <span class="category-count">{{ category.count }}</span>
                              <div class="category-bar">
                                <mat-progress-bar mode="determinate" [value]="category.percentage"></mat-progress-bar>
                              </div>
                            </div>
                          </div>
                        }
                      </mat-card-content>
                    </mat-card>

                    <mat-card class="analytics-card">
                      <mat-card-header>
                        <mat-card-title>Rating Distribution</mat-card-title>
                        <mat-card-subtitle>How you rate things</mat-card-subtitle>
                      </mat-card-header>
                      <mat-card-content>
                        @for (rating of ratingDistribution(); track rating.stars) {
                          <div class="rating-stat">
                            <div class="rating-stars">
                              @for (star of [1,2,3,4,5]; track star) {
                                <mat-icon class="star" [class.filled]="star <= rating.stars">
                                  {{ star <= rating.stars ? 'star' : 'star_border' }}
                                </mat-icon>
                              }
                            </div>
                            <div class="rating-data">
                              <span class="rating-count">{{ rating.count }}</span>
                              <div class="rating-bar">
                                <mat-progress-bar mode="determinate" [value]="rating.percentage"></mat-progress-bar>
                              </div>
                            </div>
                          </div>
                        }
                      </mat-card-content>
                    </mat-card>
                  </div>

                  <!-- Popular Tags -->
                  @if (userPopularTags().length > 0) {
                    <mat-card class="analytics-card">
                      <mat-card-header>
                        <mat-card-title>Your Popular Tags</mat-card-title>
                        <mat-card-subtitle>Tags you use most often</mat-card-subtitle>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="tags-cloud">
                          @for (tag of userPopularTags(); track tag.name) {
                            <mat-chip class="tag-chip" [style.font-size.px]="12 + (tag.count * 2)">
                              {{ tag.name }}
                              <span class="tag-count">({{ tag.count }})</span>
                            </mat-chip>
                          }
                        </div>
                      </mat-card-content>
                    </mat-card>
                  }
                </div>
              </div>
            </mat-tab>

            <!-- Settings Tab -->
            <mat-tab label="Settings">
              <div class="tab-content">
                <div class="settings-section">
                  <h3>Account Settings</h3>
                  
                  <mat-card class="settings-card">
                    <mat-card-header>
                      <mat-card-title>Account Information</mat-card-title>
                      <mat-card-subtitle>Manage your account details</mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="settings-list">
                        <div class="setting-item">
                          <div class="setting-info">
                            <mat-icon>person</mat-icon>
                            <div>
                              <h4>Username</h4>
                              <p>{{ currentUser()!.username }}</p>
                            </div>
                          </div>
                          <button mat-stroked-button (click)="toggleEditMode()">Edit</button>
                        </div>

                        <div class="setting-item">
                          <div class="setting-info">
                            <mat-icon>email</mat-icon>
                            <div>
                              <h4>Email Address</h4>
                              <p>{{ currentUser()!.email }}</p>
                            </div>
                          </div>
                          <button mat-stroked-button (click)="toggleEditMode()">Edit</button>
                        </div>

                        <div class="setting-item">
                          <div class="setting-info">
                            <mat-icon>calendar_today</mat-icon>
                            <div>
                              <h4>Member Since</h4>
                              <p>{{ getMemberSinceDate() }}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <mat-card class="settings-card danger-card">
                    <mat-card-header>
                      <mat-card-title>Danger Zone</mat-card-title>
                      <mat-card-subtitle>Irreversible account actions</mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="danger-actions">
                        <div class="danger-item">
                          <div>
                            <h4>Log Out</h4>
                            <p>Sign out of your account on this device</p>
                          </div>
                          <button mat-stroked-button (click)="logout()">
                            <mat-icon>logout</mat-icon>
                            Log Out
                          </button>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .auth-required {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .auth-card {
      max-width: 400px;
      width: 100%;
      border-radius: 15px;
    }

    .auth-content {
      text-align: center;
      padding: 20px;
    }

    .auth-icon {
      font-size: 64px;
      color: #667eea;
      margin-bottom: 20px;
    }

    .auth-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 20px;
    }

    .profile-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }

    .profile-header {
      position: relative;
      margin-bottom: 30px;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .profile-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .profile-content {
      position: relative;
      padding: 40px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 30px;
    }

    .profile-avatar-section {
      display: flex;
      align-items: center;
      gap: 25px;
    }

    .profile-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 4px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .profile-name {
      font-size: 2.2rem;
      font-weight: 700;
      margin: 0 0 5px 0;
    }

    .profile-email {
      font-size: 1.1rem;
      opacity: 0.8;
      margin: 0 0 20px 0;
    }

    .profile-stats {
      display: flex;
      gap: 25px;
      flex-wrap: wrap;
    }

    .stat {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 1.8rem;
      font-weight: 700;
      color: #FFD700;
    }

    .stat-label {
      display: block;
      font-size: 0.9rem;
      opacity: 0.8;
      margin-top: 2px;
    }

    .profile-actions {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .profile-actions button {
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 16px;
    }

    .edit-profile-card {
      margin-bottom: 30px;
      border-radius: 15px;
    }

    .profile-form {
      max-width: 500px;
    }

    .form-row {
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 20px;
    }

    .profile-tabs-card {
      border-radius: 15px;
    }

    .profile-tabs {
      min-height: 400px;
    }

    .tab-content {
      padding: 30px;
    }

    .reviews-filter {
      margin-bottom: 30px;
    }

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .filter-header h3 {
      margin: 0;
      color: #333;
    }

    .filter-controls {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .filter-controls button {
      border-radius: 20px;
    }

    .filter-controls button.active {
      background-color: #667eea;
      color: white;
    }

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 25px;
    }

    .empty-state,
    .empty-filter {
      text-align: center;
      padding: 60px 20px;
      background: #f9f9f9;
      border-radius: 15px;
    }

    .empty-icon {
      font-size: 64px;
      color: #ccc;
      margin-bottom: 20px;
    }

    .empty-state h3,
    .empty-filter h3 {
      font-size: 1.5rem;
      color: #666;
      margin-bottom: 10px;
    }

    .empty-state p,
    .empty-filter p {
      color: #999;
      margin-bottom: 20px;
    }

    .analytics-section h3 {
      margin-bottom: 25px;
      color: #333;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
      margin-bottom: 30px;
    }

    .analytics-card {
      border-radius: 15px;
    }

    .category-stat,
    .rating-stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .category-name {
      font-weight: 500;
    }

    .category-data,
    .rating-data {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 80px;
    }

    .category-count,
    .rating-count {
      font-weight: 600;
      min-width: 20px;
      text-align: right;
    }

    .category-bar,
    .rating-bar {
      width: 60px;
    }

    .rating-stars {
      display: flex;
      gap: 2px;
    }

    .star {
      font-size: 16px;
      color: #ddd;
    }

    .star.filled {
      color: #FFD700;
    }

    .tags-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }

    .tag-chip {
      cursor: default;
    }

    .tag-count {
      opacity: 0.7;
      font-size: 0.8em;
      margin-left: 5px;
    }

    .settings-section h3 {
      margin-bottom: 25px;
      color: #333;
    }

    .settings-card {
      margin-bottom: 25px;
      border-radius: 15px;
    }

    .danger-card {
      border: 1px solid #ffebee;
    }

    .danger-card .mat-mdc-card-header .mat-mdc-card-title {
      color: #d32f2f;
    }

    .settings-list,
    .danger-actions {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .setting-item,
    .danger-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #eee;
    }

    .setting-item:last-child,
    .danger-item:last-child {
      border-bottom: none;
    }

    .setting-info {
      display: flex;
      align-items: center;
      gap: 15px;
      flex: 1;
    }

    .setting-info mat-icon {
      color: #666;
    }

    .setting-info h4 {
      margin: 0 0 5px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .setting-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 10px;
      }

      .profile-content {
        padding: 30px 20px;
        flex-direction: column;
        text-align: center;
      }

      .profile-avatar-section {
        flex-direction: column;
        text-align: center;
      }

      .profile-stats {
        justify-content: center;
      }

      .filter-header {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-controls {
        justify-content: center;
      }

      .reviews-grid {
        grid-template-columns: 1fr;
      }

      .analytics-grid {
        grid-template-columns: 1fr;
      }

      .setting-item,
      .danger-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isEditMode = signal(false);
  selectedTabIndex = signal(0);
  reviewFilter = signal<string>('all');
  isAuthenticated!: typeof this.authService.isAuthenticated;
  currentUser!: typeof this.authService.currentUser;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private reviewService: ReviewService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.initializeProfile();
    }
    this.isAuthenticated = this.authService.isAuthenticated;
    this.currentUser = this.authService.currentUser;
  }

  userReviews = computed(() => {
    const user = this.currentUser();
    return user ? this.reviewService.getReviewsByAuthor(user.id) : [];
  });

  filteredUserReviews = computed(() => {
    const reviews = this.userReviews();
    const filter = this.reviewFilter();
    
    if (filter === 'all') {
      return reviews;
    }
    
    return reviews.filter(review => review.category === filter);
  });

  totalLikes = computed(() => {
    return this.userReviews().reduce((total, review) => total + review.likes, 0);
  });

  averageRating = computed(() => {
    const reviews = this.userReviews();
    if (reviews.length === 0) return '0.0';
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  });

  membershipDays = computed(() => {
    const user = this.currentUser();
    if (!user) return 0;
    
    const joinDate = new Date(user.joinDate);
    const now = new Date();
    const diffInMs = now.getTime() - joinDate.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  });

  categoryBreakdown = computed(() => {
    const reviews = this.userReviews();
    const categories = [
      { name: 'Movies', key: 'movies', icon: 'movie' },
      { name: 'Books', key: 'books', icon: 'book' },
      { name: 'Shoes', key: 'shoes', icon: 'sports_cricket' },
      { name: 'Electronics', key: 'electronics', icon: 'devices' },
      { name: 'Restaurants', key: 'restaurants', icon: 'restaurant' },
      { name: 'Games', key: 'games', icon: 'sports_esports' }
    ];

    const categoryCounts: { [key: string]: number } = {};
    reviews.forEach(review => {
      categoryCounts[review.category] = (categoryCounts[review.category] || 0) + 1;
    });

    const totalReviews = reviews.length;

    return categories
      .map(cat => ({
        name: cat.name,
        icon: cat.icon,
        count: categoryCounts[cat.key] || 0,
        percentage: totalReviews > 0 ? ((categoryCounts[cat.key] || 0) / totalReviews) * 100 : 0
      }))
      .filter(cat => cat.count > 0)
      .sort((a, b) => b.count - a.count);
  });

  ratingDistribution = computed(() => {
    const reviews = this.userReviews();
    const ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
      ratingCounts[review.rating]++;
    });

    const totalReviews = reviews.length;

    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: ratingCounts[stars],
      percentage: totalReviews > 0 ? (ratingCounts[stars] / totalReviews) * 100 : 0
    }));
  });

  userPopularTags = computed(() => {
    const tagCounts: { [key: string]: number } = {};
    
    this.userReviews().forEach(review => {
      review.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  });

  initializeProfile(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        username: user.username,
        email: user.email
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode.set(!this.isEditMode());
    if (this.isEditMode()) {
      this.initializeProfile();
    }
  }

  cancelEdit(): void {
    this.isEditMode.set(false);
    this.initializeProfile();
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      // In a real app, this would make an API call
      const formValue = this.profileForm.value;
      
      // Update user data in auth service
      const currentUserData = this.currentUser();
      if (currentUserData) {
        const updatedUser = {
          ...currentUserData,
          username: formValue.username,
          email: formValue.email
        };
        
        // Update localStorage (in real app, this would be handled by the auth service)
        localStorage.setItem('tej_reviews_user', JSON.stringify(updatedUser));
        
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        this.isEditMode.set(false);
        
        // Force reload of user data
        window.location.reload();
      }
    }
  }

  setReviewFilter(filter: string): void {
    this.reviewFilter.set(filter);
  }

  getMemberSinceDate(): string {
    const user = this.currentUser();
    if (!user) return '';
    
    return new Date(user.joinDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  logout(): void {
    this.authService.logout();
  }
}