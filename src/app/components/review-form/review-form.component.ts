import { Component, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthService } from '../../services/auth.service';
import { ReviewService, Review } from '../../services/review.service';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatStepperModule
  ],
  template: `
    @if (!isAuthenticated()) {
      <div class="auth-required fade-in">
        <mat-card class="auth-card">
          <mat-card-content>
            <div class="auth-content">
              <mat-icon class="auth-icon">login</mat-icon>
              <h2>Authentication Required</h2>
              <p>You need to be logged in to write a review.</p>
              <div class="auth-actions">
                <button mat-flat-button color="primary" routerLink="/login">Sign In</button>
                <button mat-stroked-button routerLink="/register">Create Account</button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    } @else {
      <div class="review-form-container fade-in">
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>
              <div class="form-header">
                <mat-icon>rate_review</mat-icon>
                <span>{{ isEditMode() ? 'Edit Review' : 'Write a Review' }}</span>
              </div>
            </mat-card-title>
            <mat-card-subtitle>Share your honest thoughts and help others make informed decisions</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <mat-stepper [linear]="true" #stepper class="review-stepper">
              <!-- Step 1: Basic Information -->
              <mat-step [stepControl]="basicInfoForm" label="Basic Information">
                <form [formGroup]="basicInfoForm" class="step-form">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Review Title</mat-label>
                      <input matInput 
                             formControlName="title"
                             placeholder="e.g., Amazing Spider-Man movie review"
                             maxlength="100">
                      <mat-hint align="end">{{ basicInfoForm.get('title')?.value?.length || 0 }}/100</mat-hint>
                      @if (basicInfoForm.get('title')?.hasError('required') && basicInfoForm.get('title')?.touched) {
                        <mat-error>Title is required</mat-error>
                      }
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Category</mat-label>
                      <mat-select formControlName="category">
                        @for (category of categories; track category.value) {
                          <mat-option [value]="category.value">
                            <div class="category-option">
                              <mat-icon>{{ category.icon }}</mat-icon>
                              <span>{{ category.label }}</span>
                            </div>
                          </mat-option>
                        }
                      </mat-select>
                      @if (basicInfoForm.get('category')?.hasError('required') && basicInfoForm.get('category')?.touched) {
                        <mat-error>Please select a category</mat-error>
                      }
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Rating</mat-label>
                      <mat-select formControlName="rating">
                        @for (rating of [5,4,3,2,1]; track rating) {
                          <mat-option [value]="rating">
                            <div class="rating-option">
                              @for (star of [1,2,3,4,5]; track star) {
                                <mat-icon class="rating-star" [class.filled]="star <= rating">
                                  {{ star <= rating ? 'star' : 'star_border' }}
                                </mat-icon>
                              }
                              <span class="rating-text">{{ getRatingText(rating) }}</span>
                            </div>
                          </mat-option>
                        }
                      </mat-select>
                      @if (basicInfoForm.get('rating')?.hasError('required') && basicInfoForm.get('rating')?.touched) {
                        <mat-error>Please select a rating</mat-error>
                      }
                    </mat-form-field>
                  </div>

                  <div class="step-actions">
                    <button mat-flat-button color="primary" matStepperNext [disabled]="basicInfoForm.invalid">
                      Next <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Step 2: Detailed Review -->
              <mat-step [stepControl]="detailForm" label="Review Details">
                <form [formGroup]="detailForm" class="step-form">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Detailed Review</mat-label>
                      <textarea matInput 
                                formControlName="description"
                                placeholder="Share your detailed thoughts, experience, and recommendations..."
                                rows="6"
                                maxlength="2000"></textarea>
                      <mat-hint align="end">{{ detailForm.get('description')?.value?.length || 0 }}/2000</mat-hint>
                      @if (detailForm.get('description')?.hasError('required') && detailForm.get('description')?.touched) {
                        <mat-error>Review description is required</mat-error>
                      }
                    </mat-form-field>
                  </div>

                  <!-- Pros Section -->
                  <div class="form-section">
                    <h4 class="section-title">
                      <mat-icon class="section-icon pros-icon">thumb_up</mat-icon>
                      What did you like? (Pros)
                    </h4>
                    <div formArrayName="pros">
                      @for (pro of prosControls.controls; track $index; let i = $index) {
                        <div class="dynamic-input">
                          <mat-form-field appearance="outline" class="flex-field">
                            <mat-label>Pro {{ i + 1 }}</mat-label>
                            <input matInput [formControlName]="i" placeholder="What was good about it?">
                          </mat-form-field>
                          <button mat-icon-button type="button" (click)="removePro(i)" [disabled]="prosControls.length <= 1">
                            <mat-icon>remove_circle</mat-icon>
                          </button>
                        </div>
                      }
                    </div>
                    <button mat-stroked-button type="button" (click)="addPro()" class="add-button">
                      <mat-icon>add</mat-icon> Add Another Pro
                    </button>
                  </div>

                  <!-- Cons Section -->
                  <div class="form-section">
                    <h4 class="section-title">
                      <mat-icon class="section-icon cons-icon">thumb_down</mat-icon>
                      What could be improved? (Cons)
                    </h4>
                    <div formArrayName="cons">
                      @for (con of consControls.controls; track $index; let i = $index) {
                        <div class="dynamic-input">
                          <mat-form-field appearance="outline" class="flex-field">
                            <mat-label>Con {{ i + 1 }}</mat-label>
                            <input matInput [formControlName]="i" placeholder="What could be better?">
                          </mat-form-field>
                          <button mat-icon-button type="button" (click)="removeCon(i)" [disabled]="consControls.length <= 1">
                            <mat-icon>remove_circle</mat-icon>
                          </button>
                        </div>
                      }
                    </div>
                    <button mat-stroked-button type="button" (click)="addCon()" class="add-button">
                      <mat-icon>add</mat-icon> Add Another Con
                    </button>
                  </div>

                  <div class="step-actions">
                    <button mat-stroked-button matStepperPrevious>
                      <mat-icon>arrow_back</mat-icon> Back
                    </button>
                    <button mat-flat-button color="primary" matStepperNext [disabled]="detailForm.invalid">
                      Next <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Step 3: Tags and Images -->
              <mat-step [stepControl]="mediaForm" label="Tags & Media">
                <form [formGroup]="mediaForm" class="step-form">
                  <!-- Tags Section -->
                  <div class="form-section">
                    <h4 class="section-title">
                      <mat-icon class="section-icon">label</mat-icon>
                      Tags (Optional)
                    </h4>
                    <div class="tags-input-section">
                      <mat-form-field appearance="outline" class="tag-input">
                        <mat-label>Add tags</mat-label>
                        <input matInput 
                               [(ngModel)]="newTag" 
                               [ngModelOptions]="{standalone: true}"
                               (keyup.enter)="addTag()"
                               placeholder="e.g., action, superhero, marvel">
                        <button mat-icon-button matSuffix (click)="addTag()" type="button">
                          <mat-icon>add</mat-icon>
                        </button>
                      </mat-form-field>
                    </div>
                    
                    @if (tags().length > 0) {
                      <div class="tags-display">
                        @for (tag of tags(); track tag; let i = $index) {
                          <mat-chip-row (removed)="removeTag(i)">
                            {{ tag }}
                            <mat-icon matChipRemove>cancel</mat-icon>
                          </mat-chip-row>
                        }
                      </div>
                    }
                  </div>

                  <!-- Images Section -->
                  <div class="form-section">
                    <h4 class="section-title">
                      <mat-icon class="section-icon">photo_camera</mat-icon>
                      Images (Optional)
                    </h4>
                    <div class="image-upload-section">
                      <input type="file" 
                             #fileInput 
                             (change)="onImageSelected($event)" 
                             accept="image/*" 
                             multiple 
                             style="display: none;">
                      <button mat-stroked-button (click)="fileInput.click()" type="button" class="upload-button">
                        <mat-icon>cloud_upload</mat-icon>
                        Upload Images
                      </button>
                      <p class="upload-hint">Upload up to 5 images (JPG, PNG, GIF - Max 5MB each)</p>
                    </div>

                    @if (selectedImages().length > 0) {
                      <div class="images-preview">
                        @for (image of selectedImages(); track image; let i = $index) {
                          <div class="image-preview">
                            <img [src]="image" [alt]="'Preview ' + (i + 1)">
                            <button mat-icon-button (click)="removeImage(i)" class="remove-image">
                              <mat-icon>close</mat-icon>
                            </button>
                          </div>
                        }
                      </div>
                    }
                  </div>

                  <div class="step-actions">
                    <button mat-stroked-button matStepperPrevious>
                      <mat-icon>arrow_back</mat-icon> Back
                    </button>
                    <button mat-flat-button color="primary" matStepperNext>
                      Next <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Step 4: Review and Submit -->
              <mat-step label="Review & Submit">
                <div class="review-summary">
                  <h3>Review Summary</h3>
                  
                  <div class="summary-section">
                    <h4>{{ basicInfoForm.get('title')?.value }}</h4>
                    <div class="summary-meta">
                      <span class="category">{{ getCategoryLabel(basicInfoForm.get('category')?.value) }}</span>
                      <div class="rating-display">
                        @for (star of [1,2,3,4,5]; track star) {
                          <mat-icon class="star" [class.filled]="star <= basicInfoForm.get('rating')?.value">
                            {{ star <= basicInfoForm.get('rating')?.value ? 'star' : 'star_border' }}
                          </mat-icon>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="summary-description">
                    <p>{{ detailForm.get('description')?.value }}</p>
                  </div>

                  @if (prosControls.controls.some(control => control.value)) {
                    <div class="summary-pros-cons">
                      <div class="pros-list">
                        <h5><mat-icon>thumb_up</mat-icon> Pros:</h5>
                        <ul>
                          @for (pro of prosControls.controls; track $index) {
                            @if (pro.value) {
                              <li>{{ pro.value }}</li>
                            }
                          }
                        </ul>
                      </div>
                    </div>
                  }

                  @if (consControls.controls.some(control => control.value)) {
                    <div class="summary-pros-cons">
                      <div class="cons-list">
                        <h5><mat-icon>thumb_down</mat-icon> Cons:</h5>
                        <ul>
                          @for (con of consControls.controls; track $index) {
                            @if (con.value) {
                              <li>{{ con.value }}</li>
                            }
                          }
                        </ul>
                      </div>
                    </div>
                  }

                  @if (tags().length > 0) {
                    <div class="summary-tags">
                      <h5>Tags:</h5>
                      <div class="tags-list">
                        @for (tag of tags(); track tag) {
                          <mat-chip>{{ tag }}</mat-chip>
                        }
                      </div>
                    </div>
                  }
                </div>

                <div class="final-actions">
                  <button mat-stroked-button matStepperPrevious [disabled]="isSubmitting()">
                    <mat-icon>arrow_back</mat-icon> Back
                  </button>
                  <button mat-flat-button 
                          color="primary" 
                          (click)="submitReview()" 
                          [disabled]="isSubmitting() || !isFormValid()">
                    @if (isSubmitting()) {
                      <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                      {{ isEditMode() ? 'Updating...' : 'Publishing...' }}
                    } @else {
                      <mat-icon>publish</mat-icon>
                      {{ isEditMode() ? 'Update Review' : 'Publish Review' }}
                    }
                  </button>
                </div>
              </mat-step>
            </mat-stepper>
          </mat-card-content>
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

    .review-form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .form-card {
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .form-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .form-header mat-icon {
      color: #667eea;
      font-size: 28px;
    }

    .review-stepper {
      margin: 20px 0;
    }

    .step-form {
      padding: 20px 0;
    }

    .form-row {
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
    }

    .category-option {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .rating-option {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .rating-star {
      font-size: 16px;
      color: #ddd;
    }

    .rating-star.filled {
      color: #FFD700;
    }

    .rating-text {
      font-size: 14px;
      color: #666;
    }

    .form-section {
      margin: 30px 0;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 10px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: 600;
    }

    .section-icon {
      font-size: 20px;
    }

    .pros-icon {
      color: #27ae60;
    }

    .cons-icon {
      color: #e74c3c;
    }

    .dynamic-input {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 15px;
    }

    .flex-field {
      flex: 1;
    }

    .add-button {
      margin-top: 10px;
      border-radius: 20px;
    }

    .tags-input-section {
      margin-bottom: 15px;
    }

    .tag-input {
      width: 100%;
    }

    .tags-display {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .image-upload-section {
      text-align: center;
      margin-bottom: 20px;
    }

    .upload-button {
      margin-bottom: 10px;
      border-radius: 20px;
    }

    .upload-hint {
      color: #666;
      font-size: 12px;
      margin: 0;
    }

    .images-preview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }

    .image-preview {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      aspect-ratio: 1;
    }

    .image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-image {
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      width: 24px;
      height: 24px;
      line-height: 24px;
    }

    .remove-image mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      gap: 15px;
    }

    .review-summary {
      padding: 20px;
      background: #f9f9f9;
      border-radius: 10px;
      margin-bottom: 30px;
    }

    .summary-section h4 {
      font-size: 20px;
      margin-bottom: 10px;
      color: #333;
    }

    .summary-meta {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    }

    .category {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 12px;
      text-transform: capitalize;
    }

    .rating-display {
      display: flex;
      gap: 2px;
    }

    .star {
      font-size: 18px;
      color: #ddd;
    }

    .star.filled {
      color: #FFD700;
    }

    .summary-description p {
      line-height: 1.6;
      color: #666;
      margin-bottom: 20px;
    }

    .summary-pros-cons {
      margin: 15px 0;
    }

    .pros-list,
    .cons-list {
      margin-bottom: 15px;
    }

    .pros-list h5,
    .cons-list h5 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .pros-list h5 mat-icon {
      color: #27ae60;
    }

    .cons-list h5 mat-icon {
      color: #e74c3c;
    }

    .pros-list ul,
    .cons-list ul {
      margin: 0;
      padding-left: 20px;
    }

    .summary-tags h5 {
      margin-bottom: 10px;
      font-size: 14px;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .final-actions {
      display: flex;
      justify-content: space-between;
      gap: 15px;
    }

    .button-spinner {
      margin-right: 10px;
    }

    @media (max-width: 768px) {
      .review-form-container {
        padding: 10px;
      }

      .dynamic-input {
        flex-direction: column;
        gap: 5px;
      }

      .step-actions {
        flex-direction: column;
      }

      .final-actions {
        flex-direction: column;
      }

      .summary-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
    }
  `]
})
export class ReviewFormComponent implements OnInit {
  basicInfoForm: FormGroup;
  detailForm: FormGroup;
  mediaForm: FormGroup;
  
  isSubmitting = signal(false);
  isEditMode = signal(false);
  editingReviewId = signal<string | null>(null);
  tags = signal<string[]>([]);
  selectedImages = signal<string[]>([]);
  newTag = '';

  categories = [
    { value: 'movies', label: 'Movies', icon: 'movie' },
    { value: 'books', label: 'Books', icon: 'book' },
    { value: 'shoes', label: 'Shoes', icon: 'sports_cricket' },
    { value: 'electronics', label: 'Electronics', icon: 'devices' },
    { value: 'restaurants', label: 'Restaurants', icon: 'restaurant' },
    { value: 'games', label: 'Games', icon: 'sports_esports' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private reviewService: ReviewService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      category: ['', Validators.required],
      rating: ['', Validators.required]
    });

    this.detailForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(2000)]],
      pros: this.fb.array([this.fb.control('')]),
      cons: this.fb.array([this.fb.control('')])
    });

    this.mediaForm = this.fb.group({});
  }

  ngOnInit(): void {
    // Check if editing mode
    this.route.queryParams.subscribe(params => {
      if (params['edit']) {
        this.loadReviewForEditing(params['edit']);
      }
    });
  }

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;

  get prosControls() {
    return this.detailForm.get('pros') as FormArray;
  }

  get consControls() {
    return this.detailForm.get('cons') as FormArray;
  }

  loadReviewForEditing(reviewId: string): void {
    const review = this.reviewService.getReviewById(reviewId);
    if (review && review.author.id === this.currentUser()?.id) {
      this.isEditMode.set(true);
      this.editingReviewId.set(reviewId);
      
      // Populate forms
      this.basicInfoForm.patchValue({
        title: review.title,
        category: review.category,
        rating: review.rating
      });

      this.detailForm.patchValue({
        description: review.description
      });

      // Set pros
      this.prosControls.clear();
      review.pros.forEach(pro => {
        this.prosControls.push(this.fb.control(pro));
      });
      if (this.prosControls.length === 0) {
        this.prosControls.push(this.fb.control(''));
      }

      // Set cons
      this.consControls.clear();
      review.cons.forEach(con => {
        this.consControls.push(this.fb.control(con));
      });
      if (this.consControls.length === 0) {
        this.consControls.push(this.fb.control(''));
      }

      // Set tags and images
      this.tags.set([...review.tags]);
      this.selectedImages.set([...review.images]);
    }
  }

  getRatingText(rating: number): string {
    const ratingTexts = {
      5: 'Excellent',
      4: 'Good',
      3: 'Average',
      2: 'Poor',
      1: 'Terrible'
    };
    return ratingTexts[rating as keyof typeof ratingTexts] || '';
  }

  getCategoryLabel(value: string): string {
    const category = this.categories.find(cat => cat.value === value);
    return category ? category.label : value;
  }

  addPro(): void {
    this.prosControls.push(this.fb.control(''));
  }

  removePro(index: number): void {
    if (this.prosControls.length > 1) {
      this.prosControls.removeAt(index);
    }
  }

  addCon(): void {
    this.consControls.push(this.fb.control(''));
  }

  removeCon(index: number): void {
    if (this.consControls.length > 1) {
      this.consControls.removeAt(index);
    }
  }

  addTag(): void {
    const tag = this.newTag.trim().toLowerCase();
    if (tag && !this.tags().includes(tag) && this.tags().length < 10) {
      this.tags.set([...this.tags(), tag]);
      this.newTag = '';
    }
  }

  removeTag(index: number): void {
    const currentTags = this.tags();
    currentTags.splice(index, 1);
    this.tags.set([...currentTags]);
  }

  onImageSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      Array.from(files).forEach(file => {
        if (this.selectedImages().length < 5) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            this.selectedImages.set([...this.selectedImages(), result]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeImage(index: number): void {
    const currentImages = this.selectedImages();
    currentImages.splice(index, 1);
    this.selectedImages.set([...currentImages]);
  }

  isFormValid(): boolean {
    return this.basicInfoForm.valid && this.detailForm.valid;
  }

  async submitReview(): Promise<void> {
    if (!this.isFormValid()) return;

    this.isSubmitting.set(true);

    try {
      const user = this.currentUser()!;
      
      const reviewData = {
        title: this.basicInfoForm.get('title')?.value,
        description: this.detailForm.get('description')?.value,
        category: this.basicInfoForm.get('category')?.value,
        rating: this.basicInfoForm.get('rating')?.value,
        images: this.selectedImages(),
        author: {
          id: user.id,
          username: user.username,
          avatar: user.avatar || ''
        },
        tags: this.tags(),
        pros: this.prosControls.controls
          .map(control => control.value)
          .filter(value => value.trim() !== ''),
        cons: this.consControls.controls
          .map(control => control.value)
          .filter(value => value.trim() !== '')
      };

      let reviewId: string;

      if (this.isEditMode()) {
        const success = this.reviewService.updateReview(this.editingReviewId()!, reviewData);
        if (success) {
          reviewId = this.editingReviewId()!;
          this.snackBar.open('Review updated successfully!', 'Close', { duration: 3000 });
        } else {
          throw new Error('Update failed');
        }
      } else {
        reviewId = this.reviewService.addReview(reviewData);
        this.snackBar.open('Review published successfully!', 'Close', { duration: 3000 });
      }

      // Navigate to review detail
      this.router.navigate(['/review', reviewId]);
      
    } catch (error) {
      this.snackBar.open('Failed to save review. Please try again.', 'Close', { duration: 3000 });
    } finally {
      this.isSubmitting.set(false);
    }
  }
}