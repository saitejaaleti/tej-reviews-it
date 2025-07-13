import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="register-container fade-in">
      <mat-card class="register-card">
        <mat-card-header>
          <div class="register-header">
            <mat-icon class="register-icon">person_add</mat-icon>
            <mat-card-title>Join Tej Reviews</mat-card-title>
            <mat-card-subtitle>Create your account and start reviewing</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput 
                     type="text" 
                     formControlName="username"
                     placeholder="Choose a username"
                     [class.mat-input-invalid]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched">
              <mat-icon matSuffix>person</mat-icon>
              @if (registerForm.get('username')?.hasError('required') && registerForm.get('username')?.touched) {
                <mat-error>Username is required</mat-error>
              }
              @if (registerForm.get('username')?.hasError('minlength') && registerForm.get('username')?.touched) {
                <mat-error>Username must be at least 3 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput 
                     type="email" 
                     formControlName="email"
                     placeholder="Enter your email"
                     [class.mat-input-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              <mat-icon matSuffix>email</mat-icon>
              @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput 
                     [type]="hidePassword() ? 'password' : 'text'" 
                     formControlName="password"
                     placeholder="Create a password"
                     [class.mat-input-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              <button mat-icon-button matSuffix (click)="togglePasswordVisibility()" type="button">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
              @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
                <mat-error>Password must be at least 6 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input matInput 
                     [type]="hideConfirmPassword() ? 'password' : 'text'" 
                     formControlName="confirmPassword"
                     placeholder="Confirm your password"
                     [class.mat-input-invalid]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
              <button mat-icon-button matSuffix (click)="toggleConfirmPasswordVisibility()" type="button">
                <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('confirmPassword')?.hasError('required') && registerForm.get('confirmPassword')?.touched) {
                <mat-error>Please confirm your password</mat-error>
              }
              @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
                <mat-error>Passwords do not match</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <button mat-flat-button 
                      color="primary" 
                      type="submit" 
                      class="register-button"
                      [disabled]="registerForm.invalid || isLoading()">
                @if (isLoading()) {
                  <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                  Creating account...
                } @else {
                  <mat-icon>person_add</mat-icon>
                  Create Account
                }
              </button>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <div class="card-footer">
            <p>Already have an account? 
              <a routerLink="/login" class="login-link">Sign in here</a>
            </p>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    }

    .register-card {
      width: 100%;
      max-width: 400px;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .register-header {
      text-align: center;
      margin-bottom: 20px;
    }

    .register-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #667eea;
      margin-bottom: 10px;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      margin-top: 20px;
    }

    .register-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      border-radius: 25px;
    }

    .button-spinner {
      margin-right: 10px;
    }

    .card-footer {
      text-align: center;
      margin-top: 15px;
    }

    .login-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .login-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .register-container {
        padding: 10px;
      }
      
      .register-card {
        padding: 15px;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      
      const { username, email, password } = this.registerForm.value;
      
      try {
        const success = await this.authService.register(username, email, password);
        
        if (success) {
          this.snackBar.open('Account created successfully! Welcome to Tej Reviews.', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/']);
        } else {
          this.snackBar.open('Registration failed. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      } catch (error) {
        this.snackBar.open('Registration failed. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}