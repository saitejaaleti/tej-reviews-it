import { Component, Input, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Review } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <mat-card class="review-card" (click)="viewDetails()">
      <div class="card-header">
        <div class="review-category">
          <mat-icon [class]="'category-icon category-' + review.category">{{ getCategoryIcon() }}</mat-icon>
          <span class="category-text">{{ review.category | titlecase }}</span>
        </div>
        <div class="review-rating">
          @for (star of [1,2,3,4,5]; track star) {
            <mat-icon class="star" [class.filled]="star <= review.rating">
              {{ star <= review.rating ? 'star' : 'star_border' }}
            </mat-icon>
          }
        </div>
      </div>

      @if (review.images.length > 0) {
        <div class="card-image">
          <img [src]="review.images[0]" [alt]="review.title" loading="lazy">
          @if (review.images.length > 1) {
            <div class="image-count">
              <mat-icon>photo_library</mat-icon>
              <span>+{{ review.images.length - 1 }}</span>
            </div>
          }
        </div>
      }

      <mat-card-content class="card-content">
        <h3 class="review-title">{{ review.title }}</h3>
        <p class="review-description">{{ getShortDescription() }}</p>
        
        @if (review.tags.length > 0) {
          <div class="tags-section">
            @for (tag of review.tags.slice(0, 3); track tag) {
              <mat-chip class="review-tag">{{ tag }}</mat-chip>
            }
            @if (review.tags.length > 3) {
              <span class="more-tags">+{{ review.tags.length - 3 }} more</span>
            }
          </div>
        }

        @if (review.pros.length > 0 || review.cons.length > 0) {
          <div class="pros-cons-summary">
            @if (review.pros.length > 0) {
              <div class="pros-summary">
                <mat-icon class="pro-icon">thumb_up</mat-icon>
                <span>{{ review.pros.length }} pros</span>
              </div>
            }
            @if (review.cons.length > 0) {
              <div class="cons-summary">
                <mat-icon class="con-icon">thumb_down</mat-icon>
                <span>{{ review.cons.length }} cons</span>
              </div>
            }
          </div>
        }
      </mat-card-content>

      <mat-card-actions class="card-actions">
        <div class="author-info">
          <img [src]="review.author.avatar" [alt]="review.author.username" class="author-avatar">
          <div class="author-details">
            <span class="author-name">{{ review.author.username }}</span>
            <span class="review-date">{{ getRelativeDate() }}</span>
          </div>
        </div>

        <div class="action-buttons" (click)="$event.stopPropagation()">
          <button mat-icon-button 
                  [class.liked]="isLikedByCurrentUser()"
                  (click)="toggleLike()"
                  [disabled]="!isAuthenticated()"
                  [matTooltip]="isAuthenticated() ? 'Like this review' : 'Login to like'">
            <mat-icon>{{ isLikedByCurrentUser() ? 'favorite' : 'favorite_border' }}</mat-icon>
          </button>
          <span class="like-count">{{ review.likes }}</span>

          <button mat-icon-button (click)="shareReview()" matTooltip="Share review">
            <mat-icon>share</mat-icon>
          </button>

          @if (canEdit()) {
            <button mat-icon-button (click)="editReview()" matTooltip="Edit review">
              <mat-icon>edit</mat-icon>
            </button>
          }
        </div>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .review-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 15px;
      overflow: hidden;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .review-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .review-category {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .category-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .category-movies { color: #e74c3c; }
    .category-books { color: #3498db; }
    .category-shoes { color: #f39c12; }
    .category-electronics { color: #9b59b6; }
    .category-restaurants { color: #e67e22; }
    .category-games { color: #27ae60; }

    .category-text {
      font-weight: 600;
      font-size: 14px;
      text-transform: capitalize;
    }

    .review-rating {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .star {
      font-size: 18px;
      color: #ddd;
    }

    .star.filled {
      color: #FFD700;
    }

    .card-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .review-card:hover .card-image img {
      transform: scale(1.05);
    }

    .image-count {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }

    .image-count mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .card-content {
      flex: 1;
      padding: 16px;
    }

    .review-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
      line-height: 1.3;
      color: #333;
    }

    .review-description {
      color: #666;
      line-height: 1.5;
      margin: 0 0 16px 0;
      font-size: 14px;
    }

    .tags-section {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
      align-items: center;
    }

    .review-tag {
      font-size: 11px;
      height: 24px;
      min-height: 24px;
    }

    .more-tags {
      font-size: 12px;
      color: #666;
      font-style: italic;
    }

    .pros-cons-summary {
      display: flex;
      gap: 15px;
      margin-top: 12px;
    }

    .pros-summary,
    .cons-summary {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }

    .pro-icon {
      color: #27ae60;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .con-icon {
      color: #e74c3c;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-top: 1px solid #eee;
      background: #fafafa;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }

    .author-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .author-details {
      display: flex;
      flex-direction: column;
      font-size: 12px;
    }

    .author-name {
      font-weight: 600;
      color: #333;
    }

    .review-date {
      color: #666;
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .action-buttons button {
      width: 32px;
      height: 32px;
      line-height: 32px;
    }

    .action-buttons button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .liked mat-icon {
      color: #e74c3c;
    }

    .like-count {
      font-size: 12px;
      color: #666;
      margin-right: 8px;
      min-width: 20px;
    }

    @media (max-width: 768px) {
      .card-header {
        padding: 12px;
      }

      .card-content {
        padding: 12px;
      }

      .card-actions {
        padding: 8px 12px;
      }

      .review-title {
        font-size: 16px;
      }
    }
  `]
})
export class ReviewCardComponent {
  @Input() review!: Review;
  isAuthenticated!: typeof this.authService.isAuthenticated;
  currentUser!: typeof this.authService.currentUser;

  constructor(
    private router: Router,
    private authService: AuthService,
    private reviewService: ReviewService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated;
    this.currentUser = this.authService.currentUser;
  }

  getCategoryIcon(): string {
    const iconMap: { [key: string]: string } = {
      movies: 'movie',
      books: 'book',
      shoes: 'sports_cricket',
      electronics: 'devices',
      restaurants: 'restaurant',
      games: 'sports_esports'
    };
    return iconMap[this.review.category] || 'category';
  }

  getShortDescription(): string {
    return this.review.description.length > 120 
      ? this.review.description.substring(0, 120) + '...'
      : this.review.description;
  }

  getRelativeDate(): string {
    const now = new Date();
    const reviewDate = new Date(this.review.createdAt);
    const diffInMs = now.getTime() - reviewDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }

  isLikedByCurrentUser(): boolean {
    const user = this.currentUser();
    return user ? this.review.likedBy.includes(user.id) : false;
  }

  canEdit(): boolean {
    const user = this.currentUser();
    return user ? user.id === this.review.author.id : false;
  }

  viewDetails(): void {
    this.router.navigate(['/review', this.review.id]);
  }

  toggleLike(): void {
    const user = this.currentUser();
    if (!user) {
      this.snackBar.open('Please login to like reviews', 'Close', { duration: 2000 });
      return;
    }

    const wasLiked = this.reviewService.toggleLike(this.review.id, user.id);
    const message = wasLiked ? 'Review liked!' : 'Review unliked!';
    this.snackBar.open(message, 'Close', { duration: 1000 });
  }

  shareReview(): void {
    const shareData = {
      title: `${this.review.title} - Review`,
      text: `Check out this review: ${this.review.title}`,
      url: `${window.location.origin}/review/${this.review.id}`
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        console.log('Error sharing:', err);
        this.fallbackShare(shareData.url);
      });
    } else {
      this.fallbackShare(shareData.url);
    }
  }

  private fallbackShare(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Review link copied to clipboard!', 'Close', { duration: 2000 });
    }).catch(() => {
      this.snackBar.open('Unable to share. Try copying the URL manually.', 'Close', { duration: 3000 });
    });
  }

  editReview(): void {
    this.router.navigate(['/add-review'], { queryParams: { edit: this.review.id } });
  }
}