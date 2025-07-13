import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Tej Reviews</h3>
          <p>Your trusted platform for honest reviews on movies, books, shoes, and more!</p>
          <div class="social-links">
            <button mat-icon-button (click)="openLink('https://twitter.com')">
              <mat-icon>{{ getTwitterIcon() }}</mat-icon>
            </button>
            <button mat-icon-button (click)="openLink('https://facebook.com')">
              <mat-icon>facebook</mat-icon>
            </button>
            <button mat-icon-button (click)="openLink('https://instagram.com')">
              <mat-icon>{{ getInstagramIcon() }}</mat-icon>
            </button>
          </div>
        </div>

        <div class="footer-section">
          <h4>Categories</h4>
          <ul>
            <li><a routerLink="/movies">Movies</a></li>
            <li><a routerLink="/books">Books</a></li>
            <li><a routerLink="/shoes">Shoes</a></li>
            <li><a routerLink="/electronics">Electronics</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a routerLink="/add-review">Add Review</a></li>
            <li><a routerLink="/search">Search</a></li>
            <li><a routerLink="/profile">Profile</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>About</h4>
          <ul>
            <li><a href="#" (click)="openAbout()">About Us</a></li>
            <li><a href="#" (click)="openContact()">Contact</a></li>
            <li><a href="#" (click)="openPrivacy()">Privacy Policy</a></li>
            <li><a href="#" (click)="openTerms()">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2024 Tej Reviews. All rights reserved. Built with ❤️ using Angular 20.1.0</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: white;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }

    .footer-section h3 {
      color: #FFD700;
      margin-bottom: 15px;
      font-size: 24px;
    }

    .footer-section h4 {
      color: #ecf0f1;
      margin-bottom: 15px;
      font-size: 18px;
    }

    .footer-section p {
      color: #bdc3c7;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-section ul li {
      margin-bottom: 10px;
    }

    .footer-section ul li a {
      color: #bdc3c7;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-section ul li a:hover {
      color: #FFD700;
    }

    .social-links {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    .social-links button {
      color: #bdc3c7;
      transition: color 0.3s ease;
    }

    .social-links button:hover {
      color: #FFD700;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      padding: 20px;
      color: #95a5a6;
    }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {
  
  getTwitterIcon(): string {
    return 'alternate_email'; // Using alternate_email as a substitute for Twitter
  }

  getInstagramIcon(): string {
    return 'camera_alt'; // Using camera_alt as a substitute for Instagram
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }

  openAbout(): void {
    alert('About Us: Tej Reviews is a platform for sharing honest reviews!');
  }

  openContact(): void {
    alert('Contact: email@tejreviews.com');
  }

  openPrivacy(): void {
    alert('Privacy Policy: We respect your privacy and protect your data.');
  }

  openTerms(): void {
    alert('Terms of Service: Please use our platform responsibly.');
  }
}