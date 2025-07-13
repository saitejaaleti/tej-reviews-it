import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReviewService, Review } from '../../services/review.service';
import { ReviewCardComponent } from '../review-card/review-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    ReviewCardComponent
  ],
  template: `
    <div class="search-container fade-in">
      <!-- Search Header -->
      <div class="search-header">
        <h1 class="search-title">
          <mat-icon>search</mat-icon>
          Search Reviews
        </h1>
        <p class="search-subtitle">Find the perfect review to help make your decision</p>
      </div>

      <!-- Search Filters -->
      <mat-card class="search-filters">
        <mat-card-content>
          <div class="filters-row">
            <!-- Search Query -->
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search reviews...</mat-label>
              <input matInput 
                     [formControl]="searchControl"
                     placeholder="Enter keywords, titles, or descriptions">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <!-- Category Filter -->
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Category</mat-label>
              <mat-select [formControl]="categoryControl" multiple>
                @for (category of categories; track category.value) {
                  <mat-option [value]="category.value">
                    <div class="category-option">
                      <mat-icon>{{ category.icon }}</mat-icon>
                      <span>{{ category.label }}</span>
                    </div>
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <!-- Rating Filter -->
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Minimum Rating</mat-label>
              <mat-select [formControl]="ratingControl">
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

            <!-- Sort By -->
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Sort By</mat-label>
              <mat-select [formControl]="sortControl">
                <mat-option value="newest">Newest First</mat-option>
                <mat-option value="oldest">Oldest First</mat-option>
                <mat-option value="rating-high">Highest Rated</mat-option>
                <mat-option value="rating-low">Lowest Rated</mat-option>
                <mat-option value="most-liked">Most Liked</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Applied Filters -->
          @if (hasActiveFilters()) {
            <div class="active-filters">
              <span class="filters-label">Active filters:</span>
              
              @if (searchControl.value) {
                <mat-chip (removed)="clearSearch()">
                  Search: "{{ searchControl.value }}"
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }

              @for (category of categoryControl.value || []; track category) {
                <mat-chip (removed)="removeCategory(category)">
                  {{ getCategoryLabel(category) }}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }

              @if (ratingControl.value && ratingControl.value > 0) {
                <mat-chip (removed)="clearRating()">
                  {{ ratingControl.value }}+ stars
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }

              <button mat-stroked-button (click)="clearAllFilters()" class="clear-all">
                Clear All
              </button>
            </div>
          }
        </mat-card-content>
      </mat-card>

      <!-- Search Results -->
      <div class="search-results">
        <!-- Results Header -->
        <div class="results-header">
          <div class="results-info">
            @if (isLoading()) {
              <div class="loading-info">
                <mat-spinner diameter="20"></mat-spinner>
                <span>Searching...</span>
              </div>
            } @else {
              <h2 class="results-count">
                {{ filteredReviews().length }} review{{ filteredReviews().length !== 1 ? 's' : '' }} found
              </h2>
              @if (searchQuery()) {
                <p class="search-query">for "{{ searchQuery() }}"</p>
              }
            }
          </div>
        </div>

        <!-- Results Grid -->
        @if (!isLoading()) {
          @if (filteredReviews().length > 0) {
            <div class="results-grid">
              @for (review of filteredReviews(); track review.id) {
                <app-review-card [review]="review"></app-review-card>
              }
            </div>
          } @else {
            <div class="no-results">
              <mat-icon class="no-results-icon">search_off</mat-icon>
              <h3>No reviews found</h3>
              @if (hasActiveFilters()) {
                <p>Try adjusting your search criteria or clearing some filters.</p>
                <button mat-flat-button color="primary" (click)="clearAllFilters()">
                  Clear All Filters
                </button>
              } @else {
                <p>Be the first to write a review!</p>
                <button mat-flat-button color="primary" routerLink="/add-review">
                  Write a Review
                </button>
              }
            </div>
          }
        }
      </div>

      <!-- Popular Tags -->
      @if (!hasActiveFilters() && popularTags().length > 0) {
        <mat-card class="popular-tags">
          <mat-card-header>
            <mat-card-title>Popular Tags</mat-card-title>
            <mat-card-subtitle>Try searching for these popular topics</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="tags-list">
              @for (tag of popularTags(); track tag.name) {
                <mat-chip-row (click)="searchByTag(tag.name)" class="popular-tag">
                  {{ tag.name }}
                  <span class="tag-count">({{ tag.count }})</span>
                </mat-chip-row>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .search-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .search-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 2.5rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
    }

    .search-title mat-icon {
      font-size: 2.5rem;
      color: #667eea;
    }

    .search-subtitle {
      font-size: 1.1rem;
      color: #666;
      margin: 0;
    }

    .search-filters {
      margin-bottom: 30px;
      border-radius: 15px;
    }

    .filters-row {
      display: grid;
      grid-template-columns: 2fr repeat(3, 1fr);
      gap: 15px;
      align-items: start;
    }

    .search-field {
      min-width: 0;
    }

    .filter-field {
      min-width: 0;
    }

    .category-option {
      display: flex;
      align-items: center;
      gap: 8px;
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

    .active-filters {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }

    .filters-label {
      font-weight: 600;
      color: #666;
      margin-right: 10px;
    }

    .clear-all {
      border-radius: 15px;
      margin-left: 10px;
    }

    .search-results {
      margin-bottom: 40px;
    }

    .results-header {
      margin-bottom: 25px;
    }

    .loading-info {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #666;
    }

    .results-count {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .search-query {
      color: #667eea;
      font-weight: 500;
      margin: 5px 0 0 0;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 25px;
    }

    .no-results {
      text-align: center;
      padding: 60px 20px;
      background: #f9f9f9;
      border-radius: 15px;
    }

    .no-results-icon {
      font-size: 64px;
      color: #ccc;
      margin-bottom: 20px;
    }

    .no-results h3 {
      font-size: 1.5rem;
      color: #666;
      margin-bottom: 10px;
    }

    .no-results p {
      color: #999;
      margin-bottom: 20px;
    }

    .popular-tags {
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
      .search-container {
        padding: 10px;
      }

      .search-title {
        font-size: 2rem;
      }

      .filters-row {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .results-grid {
        grid-template-columns: 1fr;
      }

      .active-filters {
        justify-content: center;
      }
    }
  `]
})
export class SearchComponent implements OnInit {
  searchControl = new FormControl('');
  categoryControl = new FormControl<string[]>([]);
  ratingControl = new FormControl(0);
  sortControl = new FormControl('newest');
  allReviews!: typeof this.reviewService.reviews;
  
  isLoading = signal(false);
  searchQuery = signal('');

  categories = [
    { value: 'movies', label: 'Movies', icon: 'movie' },
    { value: 'books', label: 'Books', icon: 'book' },
    { value: 'shoes', label: 'Shoes', icon: 'sports_cricket' },
    { value: 'electronics', label: 'Electronics', icon: 'devices' },
    { value: 'restaurants', label: 'Restaurants', icon: 'restaurant' },
    { value: 'games', label: 'Games', icon: 'sports_esports' }
  ];

  constructor(
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.allReviews = this.reviewService.reviews;
    // Get initial search query from URL
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchControl.setValue(params['q']);
        this.searchQuery.set(params['q']);
      }
    });

    // Set up reactive search
    this.searchControl.valueChanges.subscribe(value => {
      this.searchQuery.set(value || '');
      this.performSearch();
    });

    this.categoryControl.valueChanges.subscribe(() => this.performSearch());
    this.ratingControl.valueChanges.subscribe(() => this.performSearch());
    this.sortControl.valueChanges.subscribe(() => this.performSearch());

    // Initial search
    this.performSearch();
  }

  filteredReviews = computed(() => {
    let reviews = this.allReviews();
    
    // Filter by search query
    const query = this.searchQuery();
    if (query) {
      reviews = this.reviewService.searchReviews(query);
    }

    // Filter by categories
    const selectedCategories = this.categoryControl.value || [];
    if (selectedCategories.length > 0) {
      reviews = reviews.filter(review => selectedCategories.includes(review.category));
    }

    // Filter by rating
    const minRating = this.ratingControl.value || 0;
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

  popularTags = computed(() => {
    const tagCounts: { [key: string]: number } = {};
    
    this.allReviews().forEach(review => {
      review.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  });

  hasActiveFilters(): boolean {
    return !!(this.searchQuery() || 
             (this.categoryControl.value && this.categoryControl.value.length > 0) ||
             (this.ratingControl.value && this.ratingControl.value > 0));
  }

  getCategoryLabel(value: string): string {
    const category = this.categories.find(cat => cat.value === value);
    return category ? category.label : value;
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  removeCategory(category: string): void {
    const current = this.categoryControl.value || [];
    const updated = current.filter(cat => cat !== category);
    this.categoryControl.setValue(updated);
  }

  clearRating(): void {
    this.ratingControl.setValue(0);
  }

  clearAllFilters(): void {
    this.searchControl.setValue('');
    this.categoryControl.setValue([]);
    this.ratingControl.setValue(0);
    this.sortControl.setValue('newest');
  }

  searchByTag(tag: string): void {
    this.searchControl.setValue(tag);
  }

  private performSearch(): void {
    this.isLoading.set(true);
    
    // Simulate search delay
    setTimeout(() => {
      this.isLoading.set(false);
    }, 300);
  }
}