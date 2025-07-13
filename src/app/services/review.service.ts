import { Injectable, signal } from '@angular/core';

export interface Review {
  id: string;
  title: string;
  description: string;
  category: 'movies' | 'books' | 'shoes' | 'electronics' | 'restaurants' | 'games';
  rating: number;
  images: string[];
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  likedBy: string[];
  tags: string[];
  pros: string[];
  cons: string[];
}

export interface Comment {
  id: string;
  reviewId: string;
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  content: string;
  createdAt: Date;
  likes: number;
  likedBy: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviewsSignal = signal<Review[]>([]);
  private commentsSignal = signal<Comment[]>([]);

  constructor() {
    this.loadReviewsFromStorage();
    this.loadCommentsFromStorage();
    
    // Add sample data if no reviews exist
    if (this.reviewsSignal().length === 0) {
      this.initializeSampleData();
    }
  }

  get reviews() {
    return this.reviewsSignal.asReadonly();
  }

  get comments() {
    return this.commentsSignal.asReadonly();
  }

  addReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'likedBy'>): string {
    const newReview: Review = {
      ...review,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      likedBy: []
    };
    
    const currentReviews = this.reviewsSignal();
    this.reviewsSignal.set([newReview, ...currentReviews]);
    this.saveReviewsToStorage();
    
    return newReview.id;
  }

  getReviewById(id: string): Review | undefined {
    return this.reviewsSignal().find(review => review.id === id);
  }

  getReviewsByCategory(category: string): Review[] {
    return this.reviewsSignal().filter(review => review.category === category);
  }

  getReviewsByAuthor(authorId: string): Review[] {
    return this.reviewsSignal().filter(review => review.author.id === authorId);
  }

  updateReview(id: string, updates: Partial<Review>): boolean {
    const reviews = this.reviewsSignal();
    const index = reviews.findIndex(review => review.id === id);
    
    if (index !== -1) {
      const updatedReview = { ...reviews[index], ...updates, updatedAt: new Date() };
      const newReviews = [...reviews];
      newReviews[index] = updatedReview;
      this.reviewsSignal.set(newReviews);
      this.saveReviewsToStorage();
      return true;
    }
    
    return false;
  }

  deleteReview(id: string, userId: string): boolean {
    const reviews = this.reviewsSignal();
    const review = reviews.find(r => r.id === id);
    
    if (review && review.author.id === userId) {
      this.reviewsSignal.set(reviews.filter(r => r.id !== id));
      this.saveReviewsToStorage();
      return true;
    }
    
    return false;
  }

  toggleLike(reviewId: string, userId: string): boolean {
    const reviews = this.reviewsSignal();
    const review = reviews.find(r => r.id === reviewId);
    
    if (review) {
      const isLiked = review.likedBy.includes(userId);
      
      if (isLiked) {
        review.likedBy = review.likedBy.filter(id => id !== userId);
        review.likes--;
      } else {
        review.likedBy.push(userId);
        review.likes++;
      }
      
      this.reviewsSignal.set([...reviews]);
      this.saveReviewsToStorage();
      return !isLiked;
    }
    
    return false;
  }

  searchReviews(query: string): Review[] {
    if (!query.trim()) return this.reviewsSignal();
    
    const searchTerm = query.toLowerCase();
    return this.reviewsSignal().filter(review =>
      review.title.toLowerCase().includes(searchTerm) ||
      review.description.toLowerCase().includes(searchTerm) ||
      review.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      review.category.toLowerCase().includes(searchTerm)
    );
  }

  addComment(comment: Omit<Comment, 'id' | 'createdAt' | 'likes' | 'likedBy'>): string {
    const newComment: Comment = {
      ...comment,
      id: this.generateId(),
      createdAt: new Date(),
      likes: 0,
      likedBy: []
    };
    
    const currentComments = this.commentsSignal();
    this.commentsSignal.set([...currentComments, newComment]);
    this.saveCommentsToStorage();
    
    return newComment.id;
  }

  getCommentsByReview(reviewId: string): Comment[] {
    return this.commentsSignal().filter(comment => comment.reviewId === reviewId);
  }

  toggleCommentLike(commentId: string, userId: string): boolean {
    const comments = this.commentsSignal();
    const comment = comments.find(c => c.id === commentId);
    
    if (comment) {
      const isLiked = comment.likedBy.includes(userId);
      
      if (isLiked) {
        comment.likedBy = comment.likedBy.filter(id => id !== userId);
        comment.likes--;
      } else {
        comment.likedBy.push(userId);
        comment.likes++;
      }
      
      this.commentsSignal.set([...comments]);
      this.saveCommentsToStorage();
      return !isLiked;
    }
    
    return false;
  }

  getTopRatedReviews(limit: number = 5): Review[] {
    return [...this.reviewsSignal()]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  getMostLikedReviews(limit: number = 5): Review[] {
    return [...this.reviewsSignal()]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, limit);
  }

  getRecentReviews(limit: number = 5): Review[] {
    return [...this.reviewsSignal()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  getCategoryStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    this.reviewsSignal().forEach(review => {
      stats[review.category] = (stats[review.category] || 0) + 1;
    });
    return stats;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveReviewsToStorage(): void {
    localStorage.setItem('tej_reviews_data', JSON.stringify(this.reviewsSignal()));
  }

  private loadReviewsFromStorage(): void {
    const data = localStorage.getItem('tej_reviews_data');
    if (data) {
      const reviews = JSON.parse(data);
      this.reviewsSignal.set(reviews);
    }
  }

  private saveCommentsToStorage(): void {
    localStorage.setItem('tej_reviews_comments', JSON.stringify(this.commentsSignal()));
  }

  private loadCommentsFromStorage(): void {
    const data = localStorage.getItem('tej_reviews_comments');
    if (data) {
      const comments = JSON.parse(data);
      this.commentsSignal.set(comments);
    }
  }

  private initializeSampleData(): void {
    const sampleReviews: Review[] = [
      {
        id: '1',
        title: 'Amazing Spider-Man: No Way Home',
        description: 'An incredible movie that brings together all Spider-Man universes. The action sequences are phenomenal and the story is emotionally engaging.',
        category: 'movies',
        rating: 5,
        images: ['https://images.unsplash.com/photo-1489599833894-42cc2c935b32?w=300'],
        author: {
          id: 'sample1',
          username: 'MovieBuff',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MovieBuff'
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        likes: 15,
        likedBy: [],
        tags: ['superhero', 'action', 'marvel'],
        pros: ['Great acting', 'Amazing visual effects', 'Nostalgic'],
        cons: ['A bit long', 'Complex plot']
      },
      {
        id: '2',
        title: 'The Midnight Library',
        description: 'A thought-provoking book about life, choices, and infinite possibilities. Matt Haig creates a beautiful metaphor for exploring regret and hope.',
        category: 'books',
        rating: 4,
        images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300'],
        author: {
          id: 'sample2',
          username: 'BookLover',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BookLover'
        },
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        likes: 8,
        likedBy: [],
        tags: ['philosophy', 'fiction', 'inspiring'],
        pros: ['Meaningful message', 'Well written', 'Unique concept'],
        cons: ['Predictable ending', 'Some slow parts']
      }
    ];
    
    this.reviewsSignal.set(sampleReviews);
    this.saveReviewsToStorage();
  }
}