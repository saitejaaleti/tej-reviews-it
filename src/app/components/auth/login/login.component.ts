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
  selector: 'app-login',
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
    <div class="login-container fade-in">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="login-header">
            <mat-icon class="login-icon">login</mat-icon>
            <mat-card-title>Welcome Back</mat-card-title>
            <mat-card-subtitle>Sign in to your Tej Reviews account</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput 
                     type="email" 
                     formControlName="email"
                     placeholder="Enter your email"
                     [class.mat-input-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              <mat-icon matSuffix>email</mat-icon>
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput 
                     [type]="hidePassword() ? 'password' : 'text'" 
                     formControlName="password"
                     placeholder="Enter your password"
                     [class.mat-input-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              <button mat-icon-button matSuffix (click)="togglePasswordVisibility()" type="button">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
              @if (loginForm.get('password')?.hasError('minlength') && loginForm.get('password')?.touched) {
                <mat-error>Password must be at least 6 characters</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <button mat-flat-button 
                      color="primary" 
                      type="submit" 
                      class="login-button"
                      [disabled]="loginForm.invalid || isLoading()">
                @if (isLoading()) {
                  <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                  Signing in...
                } @else {
                  <mat-icon>login</mat-icon>
                  Sign In
                }
              </button>
            </div>
          </form>

          <div class="demo-credentials">
            <p class="demo-title">Demo Credentials:</p>
            <p class="demo-text">Email: demo@tejreviews.com | Password: demo123</p>
            <button mat-stroked-button (click)="fillDemoCredentials()" class="demo-button">
              Use Demo Account
            </button>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <div class="card-footer">
            <p>Don't have an account? 
              <a routerLink="/register" class="signup-link">Sign up here</a>
            </p>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .login-header {
      text-align: center;
      margin-bottom: 20px;
    }

    .login-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #667eea;
      margin-bottom: 10px;
    }

    .login-form {
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

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      border-radius: 25px;
    }

    .button-spinner {
      margin-right: 10px;
    }

    .demo-credentials {
      margin: 30px 0 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 10px;
      text-align: center;
    }

    .demo-title {
      font-weight: 600;
      margin-bottom: 5px;
      color: #333;
    }

    .demo-text {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }

    .demo-button {
      border-radius: 15px;
    }

    .card-footer {
      text-align: center;
      margin-top: 15px;
    }

    .signup-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .signup-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 10px;
      }
      
      .login-card {
        padding: 15px;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  hidePassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  fillDemoCredentials(): void {
    this.loginForm.patchValue({
      email: 'demo@tejreviews.com',
      password: 'demo123'
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      
      const { email, password } = this.loginForm.value;
      
      try {
        const success = await this.authService.login(email, password);
        
        if (success) {
          this.snackBar.open('Welcome back! Login successful.', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/']);
        } else {
          this.snackBar.open('Invalid credentials. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      } catch (error) {
        this.snackBar.open('Login failed. Please try again.', 'Close', {
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
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}