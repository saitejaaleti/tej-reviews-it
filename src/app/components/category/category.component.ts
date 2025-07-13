import { Component, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ReviewService, Review } from '../../services/review.service';
import { ReviewCardComponent } from '../review-card/review-card.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    ReviewCardComponent
  ],
  template: `
    <div class="category-container fade-in">
      <!-- Category Header -->
      <div class="category-header">
        <div class="header-content">
          <div class="category-info">
            <div class="category-icon-wrapper">
              <mat-icon class="category-icon">{{ categoryIcon() }}</mat-icon>
            </div>
            <div class="category-details">
              <h1 class="category-title">{{ categoryTitle() }}</h1>
              <p class="category-description">{{ categoryDescription() }}</p>
              <div class="category-stats">
                <div class="stat">
                  <span class="stat-number">{{ categoryReviews().length }}</span>
                  <span class="stat-label">Reviews</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ averageRating() }}</span>
                  <span class="stat-label">Avg Rating</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ totalLikes() }}</span>
                  <span class="stat-label">Total Likes</span>
                </div>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button mat-flat-button color="primary" routerLink="/add-review" [queryParams]="{category: category()}">
              <mat-icon>add</mat-icon>
              Add {{ categoryTitle() }} Review
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Stats Cards -->
      @if (categoryReviews().length > 0) {
        <div class="stats-section">
          <div class="stats-grid">
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-card-content">
                  <mat-icon class="stat-icon top-rated">star</mat-icon>
                  <div class="stat-info">
                    <h3>Top Rated</h3>
                    <p>{{ topRatedReview()?.title || 'No reviews yet' }}</p>
                    @if (topRatedReview()) {
                      <div class="rating-display">
                        @for (star of [1,2,3,4,5]; track star) {
                          <mat-icon class="star" [class.filled]="star <= topRatedReview()!.rating">
                            {{ star <= topRatedReview()!.rating ? 'star' : 'star_border' }}
                          </mat-icon>
                        }
                      </div>
                    }
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-card-content">
                  <mat-icon class="stat-icon most-liked">favorite</mat-icon>
                  <div class="stat-info">
                    <h3>Most Liked</h3>
                    <p>{{ mostLikedReview()?.title || 'No reviews yet' }}</p>
                    @if (mostLikedReview()) {
                      <span class="likes-count">{{ mostLikedReview()!.likes }} likes</span>
                    }
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-card-content">
                  <mat-icon class="stat-icon recent">schedule</mat-icon>
                  <div class="stat-info">
                    <h3>Latest Review</h3>
                    <p>{{ latestReview()?.title || 'No reviews yet' }}</p>
                    @if (latestReview()) {
                      <span class="review-date">{{ getRelativeDate(latestReview()!.createdAt) }}</span>
                    }
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      }

      <!-- Filters and Sorting -->
      @if (categoryReviews().length > 0) {
        <div class="filters-section">
          <mat-card class="filters-card">
            <mat-card-content>
              <div class="filters-row">
                <mat-form-field appearance="outline" class="sort-field">
                  <mat-label>Sort By</mat-label>
                  <mat-select [formControl]="sortControl">
                    <mat-option value="newest">Newest First</mat-option>
                    <mat-option value="oldest">Oldest First</mat-option>
                    <mat-option value="rating-high">Highest Rated</mat-option>
                    <mat-option value="rating-low">Lowest Rated</mat-option>
                    <mat-option value="most-liked">Most Liked</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="rating-filter">
                  <mat-label>Min Rating</mat-label>
                  <mat-select [formControl]="ratingFilter">
                    <mat-option [value]="0">Any Rating</mat-option>
                    @for (rating of [5,4,3,2,1]; track rating) {
                      <mat-option [value]="rating">
                        <div class="rating-option">
                          @for (star of [1,2,3,4,5]; track star) {
                            <mat-icon class="rating-star" [class.filled]="star <= rating">
                              {{ star <= rating ? 'star' : 'star_border' }}
                            </mat-icon>
                          }
                          <span>& up</span>
                        </div>
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <div class="results-count">
                  {{ filteredReviews().length }} review{{ filteredReviews().length !== 1 ? 's' : '' }}
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }

      <!-- Reviews Grid -->
      <div class="reviews-section">
        @if (filteredReviews().length > 0) {
          <div class="reviews-grid">
            @for (review of filteredReviews(); track review.id) {
              <app-review-card [review]="review"></app-review-card>
            }
          </div>
        } @else if (categoryReviews().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">{{ categoryIcon() }}</mat-icon>
            <h3>No {{ categoryTitle() }} reviews yet</h3>
            <p>Be the first to share your {{ categoryTitle().toLowerCase() }} experience!</p>
            <button mat-flat-button color="primary" routerLink="/add-review" [queryParams]="{category: category()}">
              <mat-icon>add</mat-icon>
              Write the First Review
            </button>
          </div>
        } @else {
          <div class="filtered-empty">
            <mat-icon class="empty-icon">filter_alt_off</mat-icon>
            <h3>No reviews match your filters</h3>
            <p>Try adjusting your rating filter to see more results.</p>
            <button mat-stroked-button (click)="clearFilters()">
              Clear Filters
            </button>
          </div>
        }
      </div>

      <!-- Popular Tags for this category -->
      @if (popularTags().length > 0 && categoryReviews().length > 0) {
        <div class="tags-section">
          <mat-card class="tags-card">
            <mat-card-header>
              <mat-card-title>Popular {{ categoryTitle() }} Tags</mat-card-title>
              <mat-card-subtitle>Common topics in {{ categoryTitle().toLowerCase() }} reviews</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="tags-list">
                @for (tag of popularTags(); track tag.name) {
                  <mat-chip class="popular-tag" (click)="searchTag(tag.name)">
                    {{ tag.name }}
                    <span class="tag-count">({{ tag.count }})</span>
                  </mat-chip>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .category-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .category-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 30px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 30px;
      flex-wrap: wrap;
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 30px;
      flex: 1;
    }

    .category-icon-wrapper {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      padding: 25px;
      backdrop-filter: blur(10px);
    }

    .category-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #FFD700;
    }

    .category-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 10px;
      color: white;
    }

    .category-description {
      font-size: 1.1rem;
      opacity: 0.9;
      margin-bottom: 20px;
      line-height: 1.6;
    }

    .category-stats {
      display: flex;
      gap: 30px;
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
      margin-top: 5px;
    }

    .header-actions {
      flex-shrink: 0;
    }

    .header-actions button {
      padding: 15px 25px;
      font-size: 16px;
      border-radius: 25px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .stats-section {
      margin-bottom: 30px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .stat-card {
      border-radius: 15px;
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-3px);
    }

    .stat-card-content {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .stat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      padding: 15px;
    }

    .stat-icon.top-rated {
      background: linear-gradient(45deg, #FFD700, #FFA500);
      color: white;
    }

    .stat-icon.most-liked {
      background: linear-gradient(45deg, #e74c3c, #c0392b);
      color: white;
    }

    .stat-icon.recent {
      background: linear-gradient(45deg, #3498db, #2980b9);
      color: white;
    }

    .stat-info h3 {
      margin: 0 0 5px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .stat-info p {
      margin: 0 0 5px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
    }

    .rating-display {
      display: flex;
      gap: 2px;
    }

    .star {
      font-size: 14px;
      color: #ddd;
    }

    .star.filled {
      color: #FFD700;
    }

    .likes-count,
    .review-date {
      font-size: 12px;
      color: #667eea;
      font-weight: 500;
    }

    .filters-section {
      margin-bottom: 30px;
    }

    .filters-card {
      border-radius: 15px;
    }

    .filters-row {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .sort-field,
    .rating-filter {
      min-width: 180px;
    }

    .rating-option {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .rating-star {
      font-size: 14px;
      color: #ddd;
    }

    .rating-star.filled {
      color: #FFD700;
    }

    .results-count {
      margin-left: auto;
      font-weight: 600;
      color: #666;
    }

    .reviews-section {
      margin-bottom: 40px;
    }

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 25px;
    }

    .empty-state,
    .filtered-empty {
      text-align: center;
      padding: 80px 20px;
      background: #f9f9f9;
      border-radius: 20px;
    }

    .empty-icon {
      font-size: 80px;
      color: #ddd;
      margin-bottom: 20px;
    }

    .empty-state h3,
    .filtered-empty h3 {
      font-size: 1.5rem;
      color: #666;
      margin-bottom: 10px;
    }

    .empty-state p,
    .filtered-empty p {
      color: #999;
      margin-bottom: 25px;
      font-size: 1.1rem;
    }

    .tags-section {
      margin-bottom: 30px;
    }

    .tags-card {
      border-radius: 15px;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .popular-tag {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .popular-tag:hover {
      background-color: #667eea;
      color: white;
    }

    .tag-count {
      opacity: 0.7;
      font-size: 12px;
      margin-left: 5px;
    }

    @media (max-width: 768px) {
      .category-container {
        padding: 10px;
      }

      .category-header {
        padding: 30px 20px;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .category-info {
        flex-direction: column;
        text-align: center;
      }

      .category-title {
        font-size: 2rem;
      }

      .category-stats {
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .results-count {
        margin-left: 0;
        text-align: center;
      }

      .reviews-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CategoryComponent implements OnInit {
  category = computed(() => this.route.snapshot.data['category']);
  sortControl = new FormControl('newest');
  ratingFilter = new FormControl(0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.sortControl.valueChanges.subscribe(() => {
      // Trigger recomputation of filtered reviews
    });

    this.ratingFilter.valueChanges.subscribe(() => {
      // Trigger recomputation of filtered reviews
    });
  }

  categoryReviews = computed(() => {
    return this.reviewService.getReviewsByCategory(this.category());
  });

  filteredReviews = computed(() => {
    let reviews = this.categoryReviews();
    
    // Filter by rating
    const minRating = this.ratingFilter.value || 0;
    if (minRating > 0) {
      reviews = reviews.filter(review => review.rating >= minRating);
    }

    // Sort reviews
    const sortBy = this.sortControl.value;
    switch (sortBy) {
      case 'newest':
        reviews = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        reviews = [...reviews].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'rating-high':
        reviews = [...reviews].sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low':
        reviews = [...reviews].sort((a, b) => a.rating - b.rating);
        break;
      case 'most-liked':
        reviews = [...reviews].sort((a, b) => b.likes - a.likes);
        break;
      default:
        break;
    }

    return reviews;
  });

  categoryIcon = computed(() => {
    const iconMap: { [key: string]: string } = {
      movies: 'movie',
      books: 'book',
      shoes: 'sports_cricket',
      electronics: 'devices',
      restaurants: 'restaurant',
      games: 'sports_esports'
    };
    return iconMap[this.category()] || 'category';
  });

  categoryTitle = computed(() => {
    return this.category().charAt(0).toUpperCase() + this.category().slice(1);
  });

  categoryDescription = computed(() => {
    const descriptions: { [key: string]: string } = {
      movies: 'Discover honest reviews of the latest blockbusters, indie films, and classic cinema.',
      books: 'Find your next great read with detailed book reviews and recommendations.',
      shoes: 'Step into style with comprehensive shoe reviews covering comfort, quality, and design.',
      electronics: 'Make informed tech purchases with in-depth electronics and gadget reviews.',
      restaurants: 'Explore dining experiences with detailed restaurant and food reviews.',
      games: 'Level up your gaming with reviews of the latest video games and board games.'
    };
    return descriptions[this.category()] || `Explore ${this.categoryTitle().toLowerCase()} reviews from our community.`;
  });

  averageRating = computed(() => {
    const reviews = this.categoryReviews();
    if (reviews.length === 0) return '0.0';
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  });

  totalLikes = computed(() => {
    return this.categoryReviews().reduce((total, review) => total + review.likes, 0);
  });

  topRatedReview = computed(() => {
    const reviews = this.categoryReviews();
    if (reviews.length === 0) return null;
    
    return reviews.reduce((top, current) => 
      current.rating > top.rating ? current : top
    );
  });

  mostLikedReview = computed(() => {
    const reviews = this.categoryReviews();
    if (reviews.length === 0) return null;
    
    return reviews.reduce((most, current) => 
      current.likes > most.likes ? current : most
    );
  });

  latestReview = computed(() => {
    const reviews = this.categoryReviews();
    if (reviews.length === 0) return null;
    
    return reviews.reduce((latest, current) => 
      new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
    );
  });

  popularTags = computed(() => {
    const tagCounts: { [key: string]: number } = {};
    
    this.categoryReviews().forEach(review => {
      review.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  });

  getRelativeDate(date: Date): string {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffInMs = now.getTime() - reviewDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  }

  clearFilters(): void {
    this.ratingFilter.setValue(0);
  }

  searchTag(tag: string): void {
    this.router.navigate(['/search'], { 
      queryParams: { q: tag } 
    });
  }
}