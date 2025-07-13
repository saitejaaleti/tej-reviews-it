import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatConfirmDialogComponent } from '../shared/mat-confirm-dialog.component';
import { ReviewService, Review, Comment } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatTooltipModule
  ],
  template: `
    @if (review()) {
      <div class="review-detail-container fade-in">
        <!-- Review Header -->
        <div class="review-header">
          <button mat-icon-button (click)="goBack()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          
          <div class="header-content">
            <div class="review-meta">
              <div class="category-badge">
                <mat-icon>{{ getCategoryIcon() }}</mat-icon>
                <span>{{ review()!.category | titlecase }}</span>
              </div>
              <div class="review-rating">
                @for (star of [1,2,3,4,5]; track star) {
                  <mat-icon class="star" [class.filled]="star <= review()!.rating">
                    {{ star <= review()!.rating ? 'star' : 'star_border' }}
                  </mat-icon>
                }
                <span class="rating-text">({{ review()!.rating }}/5)</span>
              </div>
            </div>
            
            <h1 class="review-title">{{ review()!.title }}</h1>
            
            <div class="review-info">
              <div class="author-info">
                <img [src]="review()!.author.avatar" [alt]="review()!.author.username" class="author-avatar">
                <div class="author-details">
                  <span class="author-name">by {{ review()!.author.username }}</span>
                  <span class="review-date">{{ getFormattedDate(review()!.createdAt) }}</span>
                  @if (review()!.updatedAt !== review()!.createdAt) {
                    <span class="updated-date">(Updated {{ getFormattedDate(review()!.updatedAt) }})</span>
                  }
                </div>
              </div>
              
              <div class="review-actions">
                <button mat-icon-button 
                        [class.liked]="isLikedByCurrentUser()"
                        (click)="toggleLike()"
                        [disabled]="!isAuthenticated()"
                        [matTooltip]="isAuthenticated() ? 'Like this review' : 'Login to like'">
                  <mat-icon>{{ isLikedByCurrentUser() ? 'favorite' : 'favorite_border' }}</mat-icon>
                </button>
                <span class="like-count">{{ review()!.likes }}</span>

                <button mat-icon-button (click)="shareReview()" matTooltip="Share review">
                  <mat-icon>share</mat-icon>
                </button>

                @if (canEdit()) {
                  <button mat-icon-button (click)="editReview()" matTooltip="Edit review">
                    <mat-icon>edit</mat-icon>
                  </button>
                  
                  <button mat-icon-button (click)="deleteReview()" matTooltip="Delete review" class="delete-btn">
                    <mat-icon>delete</mat-icon>
                  </button>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Review Images -->
        @if (review()!.images.length > 0) {
          <div class="images-section">
            <div class="images-grid" [class.single-image]="review()!.images.length === 1">
              @for (image of review()!.images; track image; let i = $index) {
                <div class="image-container" (click)="openImageGallery(i)">
                  <img [src]="image" [alt]="'Review image ' + (i + 1)" loading="lazy">
                  @if (review()!.images.length > 1 && i === 2 && review()!.images.length > 3) {
                    <div class="more-images-overlay">
                      <span>+{{ review()!.images.length - 3 }} more</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Review Content -->
        <mat-card class="review-content">
          <mat-card-content>
            <div class="description-section">
              <h2 class="section-title">Review</h2>
              <p class="review-description">{{ review()!.description }}</p>
            </div>

            @if (review()!.pros.length > 0 || review()!.cons.length > 0) {
              <div class="pros-cons-section">
                @if (review()!.pros.length > 0) {
                  <div class="pros-list">
                    <h3 class="pros-title">
                      <mat-icon class="pros-icon">thumb_up</mat-icon>
                      What's Great
                    </h3>
                    <ul>
                      @for (pro of review()!.pros; track pro) {
                        <li>{{ pro }}</li>
                      }
                    </ul>
                  </div>
                }

                @if (review()!.cons.length > 0) {
                  <div class="cons-list">
                    <h3 class="cons-title">
                      <mat-icon class="cons-icon">thumb_down</mat-icon>
                      What Could Be Better
                    </h3>
                    <ul>
                      @for (con of review()!.cons; track con) {
                        <li>{{ con }}</li>
                      }
                    </ul>
                  </div>
                }
              </div>
            }

            @if (review()!.tags.length > 0) {
              <div class="tags-section">
                <h3 class="section-title">Tags</h3>
                <div class="tags-list">
                  @for (tag of review()!.tags; track tag) {
                    <mat-chip (click)="searchTag(tag)" class="review-tag">{{ tag }}</mat-chip>
                  }
                </div>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <!-- Comments Section -->
        <mat-card class="comments-section">
          <mat-card-header>
            <mat-card-title>Comments ({{ reviewComments().length }})</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <!-- Add Comment Form -->
            @if (isAuthenticated()) {
              <div class="add-comment-form">
                <div class="comment-form-header">
                  <img [src]="currentUser()!.avatar" [alt]="currentUser()!.username" class="comment-avatar">
                  <span class="comment-username">{{ currentUser()!.username }}</span>
                </div>
                <mat-form-field appearance="outline" class="comment-field">
                  <mat-label>Add a comment...</mat-label>
                  <textarea matInput 
                            [formControl]="commentControl"
                            rows="3"
                            placeholder="Share your thoughts about this review..."></textarea>
                </mat-form-field>
                <div class="comment-actions">
                  <button mat-flat-button 
                          color="primary" 
                          (click)="addComment()"
                          [disabled]="commentControl.invalid">
                    <mat-icon>send</mat-icon>
                    Post Comment
                  </button>
                </div>
              </div>
            } @else {
              <div class="login-prompt">
                <p>Want to join the discussion?</p>
                <button mat-flat-button color="primary" routerLink="/login">
                  Sign In to Comment
                </button>
              </div>
            }

            <!-- Comments List -->
            @if (reviewComments().length > 0) {
              <div class="comments-list">
                @for (comment of reviewComments(); track comment.id) {
                  <div class="comment-item">
                    <div class="comment-header">
                      <img [src]="comment.author.avatar" [alt]="comment.author.username" class="comment-avatar">
                      <div class="comment-meta">
                        <span class="comment-author">{{ comment.author.username }}</span>
                        <span class="comment-date">{{ getRelativeDate(comment.createdAt) }}</span>
                      </div>
                      <div class="comment-actions">
                        <button mat-icon-button 
                                [class.liked]="isCommentLikedByCurrentUser(comment)"
                                (click)="toggleCommentLike(comment)"
                                [disabled]="!isAuthenticated()"
                                [matTooltip]="isAuthenticated() ? 'Like comment' : 'Login to like'">
                          <mat-icon>{{ isCommentLikedByCurrentUser(comment) ? 'favorite' : 'favorite_border' }}</mat-icon>
                        </button>
                        <span class="comment-like-count">{{ comment.likes }}</span>
                      </div>
                    </div>
                    <div class="comment-content">
                      <p>{{ comment.content }}</p>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="no-comments">
                <mat-icon>comment</mat-icon>
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>
    } @else {
      <div class="not-found">
        <mat-card>
          <mat-card-content>
            <div class="not-found-content">
              <mat-icon>error</mat-icon>
              <h2>Review Not Found</h2>
              <p>The review you're looking for doesn't exist or has been removed.</p>
              <button mat-flat-button color="primary" routerLink="/">
                Back to Home
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .review-detail-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .review-header {
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 20px;
      margin-bottom: 30px;
    }

    .back-button {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      backdrop-filter: blur(10px);
    }

    .header-content {
      margin-left: 60px;
    }

    .review-meta {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }

    .category-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 16px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }

    .review-rating {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .star {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.3);
    }

    .star.filled {
      color: #FFD700;
    }

    .rating-text {
      margin-left: 8px;
      font-weight: 600;
    }

    .review-title {
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1.3;
    }

    .review-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .author-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.3);
    }

    .author-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .author-name {
      font-weight: 600;
      font-size: 16px;
    }

    .review-date,
    .updated-date {
      font-size: 14px;
      opacity: 0.8;
    }

    .review-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .review-actions button {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .liked mat-icon {
      color: #ff6b6b;
    }

    .delete-btn {
      color: #ff6b6b !important;
    }

    .like-count {
      font-size: 14px;
      margin-right: 8px;
    }

    .images-section {
      margin-bottom: 30px;
    }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      border-radius: 15px;
      overflow: hidden;
    }

    .images-grid.single-image {
      grid-template-columns: 1fr;
      max-height: 400px;
    }

    .image-container {
      position: relative;
      cursor: pointer;
      overflow: hidden;
      aspect-ratio: 1;
    }

    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .image-container:hover img {
      transform: scale(1.05);
    }

    .more-images-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 18px;
    }

    .review-content {
      margin-bottom: 30px;
      border-radius: 15px;
    }

    .section-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
    }

    .review-description {
      font-size: 16px;
      line-height: 1.7;
      color: #444;
      margin-bottom: 30px;
    }

    .pros-cons-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }

    .pros-list,
    .cons-list {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 10px;
    }

    .pros-title,
    .cons-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
    }

    .pros-icon {
      color: #27ae60;
    }

    .cons-icon {
      color: #e74c3c;
    }

    .pros-list ul,
    .cons-list ul {
      margin: 0;
      padding-left: 20px;
    }

    .pros-list li,
    .cons-list li {
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .tags-section {
      margin-top: 30px;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .review-tag {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .review-tag:hover {
      background-color: #667eea;
      color: white;
    }

    .comments-section {
      border-radius: 15px;
    }

    .add-comment-form {
      margin-bottom: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 10px;
    }

    .comment-form-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .comment-username {
      font-weight: 600;
      color: #333;
    }

    .comment-field {
      width: 100%;
      margin-bottom: 15px;
    }

    .comment-actions {
      display: flex;
      justify-content: flex-end;
    }

    .login-prompt {
      text-align: center;
      padding: 30px;
      background: #f9f9f9;
      border-radius: 10px;
      margin-bottom: 20px;
    }

    .login-prompt p {
      margin-bottom: 15px;
      color: #666;
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .comment-item {
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 10px;
    }

    .comment-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .comment-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: 10px;
      flex: 1;
    }

    .comment-author {
      font-weight: 600;
      color: #333;
    }

    .comment-date {
      color: #666;
      font-size: 14px;
    }

    .comment-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .comment-like-count {
      font-size: 12px;
      color: #666;
    }

    .comment-content p {
      margin: 0;
      line-height: 1.6;
      color: #444;
    }

    .no-comments {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .no-comments mat-icon {
      font-size: 48px;
      margin-bottom: 15px;
      opacity: 0.5;
    }

    .not-found {
      min-height: 50vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .not-found-content {
      text-align: center;
      padding: 40px;
    }

    .not-found-content mat-icon {
      font-size: 64px;
      color: #e74c3c;
      margin-bottom: 20px;
    }

    .not-found-content h2 {
      color: #333;
      margin-bottom: 10px;
    }

    .not-found-content p {
      color: #666;
      margin-bottom: 20px;
    }

    @media (max-width: 768px) {
      .review-detail-container {
        padding: 10px;
      }

      .review-header {
        padding: 20px 20px 20px 70px;
      }

      .header-content {
        margin-left: 0;
      }

      .review-title {
        font-size: 1.8rem;
      }

      .review-info {
        flex-direction: column;
        align-items: flex-start;
      }

      .pros-cons-section {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .images-grid {
        grid-template-columns: 1fr;
      }

      .comment-header {
        flex-wrap: wrap;
      }
    }
  `]
})
export class ReviewDetailComponent implements OnInit {
  review = signal<Review | null>(null);
  commentControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  isAuthenticated!: typeof this.authService.isAuthenticated;
  currentUser!: typeof this.authService.currentUser;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reviewService: ReviewService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const reviewId = this.route.snapshot.paramMap.get('id');
    if (reviewId) {
      const foundReview = this.reviewService.getReviewById(reviewId);
      this.review.set(foundReview || null);
    }
    this.isAuthenticated = this.authService.isAuthenticated;
    this.currentUser = this.authService.currentUser;
  }

  

  reviewComments = computed(() => {
    const reviewId = this.review()?.id;
    return reviewId ? this.reviewService.getCommentsByReview(reviewId) : [];
  });

  getCategoryIcon(): string {
    const iconMap: { [key: string]: string } = {
      movies: 'movie',
      books: 'book',
      shoes: 'sports_cricket',
      electronics: 'devices',
      restaurants: 'restaurant',
      games: 'sports_esports'
    };
    return iconMap[this.review()?.category || ''] || 'category';
  }

  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getRelativeDate(date: Date): string {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInMs = now.getTime() - commentDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  }

  isLikedByCurrentUser(): boolean {
    const user = this.currentUser();
    const review = this.review();
    return user && review ? review.likedBy.includes(user.id) : false;
  }

  isCommentLikedByCurrentUser(comment: Comment): boolean {
    const user = this.currentUser();
    return user ? comment.likedBy.includes(user.id) : false;
  }

  canEdit(): boolean {
    const user = this.currentUser();
    const review = this.review();
    return user && review ? user.id === review.author.id : false;
  }

  goBack(): void {
    window.history.back();
  }

  toggleLike(): void {
    const user = this.currentUser();
    const review = this.review();
    if (!user || !review) {
      this.snackBar.open('Please login to like reviews', 'Close', { duration: 2000 });
      return;
    }

    const wasLiked = this.reviewService.toggleLike(review.id, user.id);
    const message = wasLiked ? 'Review liked!' : 'Review unliked!';
    this.snackBar.open(message, 'Close', { duration: 1000 });
    
    // Update local review data
    const updatedReview = this.reviewService.getReviewById(review.id);
    if (updatedReview) {
      this.review.set(updatedReview);
    }
  }

  shareReview(): void {
    const review = this.review();
    if (!review) return;

    const shareData = {
      title: `${review.title} - Review`,
      text: `Check out this review: ${review.title}`,
      url: window.location.href
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
    const review = this.review();
    if (review) {
      this.router.navigate(['/add-review'], { queryParams: { edit: review.id } });
    }
  }

  deleteReview(): void {
    const review = this.review();
    if (!review) return;

    const dialogRef = this.dialog.open(MatConfirmDialogComponent, {
      data: {
        title: 'Delete Review',
        message: 'Are you sure you want to delete this review? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && review) {
        const user = this.currentUser();
        if (user && this.reviewService.deleteReview(review.id, user.id)) {
          this.snackBar.open('Review deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/']);
        } else {
          this.snackBar.open('Failed to delete review', 'Close', { duration: 3000 });
        }
      }
    });
  }

  addComment(): void {
    const user = this.currentUser();
    const review = this.review();
    const content = this.commentControl.value?.trim();

    if (!user || !review || !content) return;

    const commentData = {
      reviewId: review.id,
      author: {
        id: user.id,
        username: user.username,
        avatar: user.avatar || ''
      },
      content
    };

    this.reviewService.addComment(commentData);
    this.commentControl.reset();
    this.snackBar.open('Comment added!', 'Close', { duration: 2000 });
  }

  toggleCommentLike(comment: Comment): void {
    const user = this.currentUser();
    if (!user) {
      this.snackBar.open('Please login to like comments', 'Close', { duration: 2000 });
      return;
    }

    const wasLiked = this.reviewService.toggleCommentLike(comment.id, user.id);
    const message = wasLiked ? 'Comment liked!' : 'Comment unliked!';
    this.snackBar.open(message, 'Close', { duration: 1000 });
  }

  searchTag(tag: string): void {
    this.router.navigate(['/search'], { queryParams: { q: tag } });
  }

  openImageGallery(index: number): void {
    // Implement image gallery modal
    console.log('Open image gallery at index:', index);
  }
}