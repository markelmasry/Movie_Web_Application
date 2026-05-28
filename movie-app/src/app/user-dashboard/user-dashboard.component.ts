import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MovieService } from '../movie.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-container">
      <div class="toast" [class.show]="toastMsg">{{toastMsg}}</div>

      <div class="custom-modal-overlay" *ngIf="showLogoutModal">
        <div class="custom-modal">
          <h3>Sign Out</h3>
          <p>Are you sure you want to leave your session?</p>
          <div class="modal-actions">
            <button class="modal-btn secondary" (click)="showLogoutModal = false">Cancel</button>
            <button class="modal-btn primary" (click)="confirmLogout()">Sign Out</button>
          </div>
        </div>
      </div>

      <div class="custom-modal-overlay" *ngIf="showDetailsModal">
        <div class="custom-modal details-modal">
          <button class="close-details-btn" (click)="closeDetails()">✖</button>
          
          <div class="details-layout">
            <div class="details-poster-container">
              <img [src]="selectedMovie?.poster" class="details-poster" onerror="this.src='https://placehold.co/300x450/222/fff?text=No+Poster'">
            </div>
            
            <div class="details-content">
              <h2 class="details-title">{{selectedMovie?.title}}</h2>
              <div class="details-meta">
                <span class="match-text">★ {{selectedMovie?.imdbRating || 'N/A'}} / 10</span>
                <span class="year-text">{{selectedMovie?.movieYear}}</span>
                <span class="hd-badge">{{selectedMovie?.genre || 'Action'}}</span>
              </div>
              
              <p class="details-director" *ngIf="selectedMovie?.director">
                <strong>Director:</strong> <span>{{selectedMovie?.director}}</span>
              </p>
              
              <p class="details-desc">
                {{ selectedMovie?.plot || 'No plot description available for this title.' }}
              </p>
              
              <div class="details-actions">
                <button class="action-btn play-btn" (click)="playMovie(selectedMovie?.title); closeDetails()">▶ Play</button>
                <button class="circle-btn" (click)="addToList(selectedMovie?.title)">+</button>
                
                <div class="rating-picker">
                  <div class="star-container" [style.pointer-events]="selectedMovie?.userRating ? 'none' : 'auto'">
                    <span *ngFor="let s of [1,2,3,4,5,6,7,8,9,10]" 
                          class="star" 
                          [class.filled]="(hoverRating || selectedMovie?.userRating || userRatingInput || 0) >= s"
                          (mouseenter)="!selectedMovie?.userRating ? hoverRating = s : null"
                          (mouseleave)="hoverRating = null"
                          (click)="setRatingAndSubmit(selectedMovie.id, s)">
                      ★
                    </span>
                  </div>
                  <span class="rating-value" *ngIf="hoverRating || selectedMovie?.userRating || userRatingInput">
                    {{ hoverRating || selectedMovie?.userRating || userRatingInput }} / 10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="video-overlay" *ngIf="showVideoPlayer">
        <button class="close-video-btn" (click)="closeVideo()">✖ Close</button>
        <div class="video-wrapper">
          <video width="100%" controls autoplay>
            <source [src]="currentVideoUrl" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      <nav class="navbar" [class.scrolled]="isScrolled || viewMode === 'list'">
        <div class="nav-left">
          <h1 class="logo" (click)="viewMode = 'home'">NETFLIX</h1>
          <div class="nav-links">
            <span class="nav-link" [class.active]="viewMode === 'home'" (click)="viewMode = 'home'">Home</span>
            <span class="nav-link" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">My List</span>
          </div>
        </div>
        <div class="nav-right">
          <div class="search-container">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="searchTerm" (input)="filterMovies()" placeholder="Search titles..." class="search-input">
          </div>
          <button (click)="showLogoutModal = true" class="sign-out-btn">Sign Out</button>
        </div>
      </nav>

      <div *ngIf="viewMode === 'home'">
        <div class="hero-section">
          <div class="hero-overlay">
            <div class="hero-content">
              <span class="hero-tag">TRENDING NOW</span>
              <h1 class="hero-title">GUARDIANS OF<br>THE GALAXY</h1>
              <p class="hero-desc">The Guardians struggle to keep together as a team while dealing with their personal family issues, notably Star-Lord's encounter with his father.</p>
              <div class="hero-btns">
                <button class="action-btn play-btn" (click)="playMovie('Guardians of the Galaxy: Vol. 2')">▶ Play</button>
                <button class="action-btn info-btn-hero" (click)="openDetails({title: 'Guardians of the Galaxy: Vol. 2', movieYear: '2017', genre: 'Action, Adventure, Comedy', director: 'James Gunn', plot: 'The Guardians struggle to keep together as a team while dealing with their personal family issues...', poster: 'https://m.media-amazon.com/images/M/MV5BNWE5MGI3MDctMmU5Ni00YzI2LWEzMTQtZGIyZDA5MzQzNDBhXkEyXkFqcGc@._V1_QL75_UX380_CR0,1,380,562_.jpg', userRating: 7.6})">ℹ More Info</button>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <h2 class="row-header">Trending in Your Collection</h2>
          <div class="movie-grid">
            <div *ngFor="let movie of filteredMovies" class="movie-card">
              <img [src]="movie.poster" class="poster" onerror="this.src='https://placehold.co/200x300/222/fff?text=No+Poster'">
              <div class="card-details">
                <div class="action-row">
                  <button class="circle-btn" title="Play" (click)="playMovie(movie.title)">▶</button>
                  <button class="circle-btn" title="Add to List" (click)="addToList(movie.title)">+</button>
                  <button class="circle-btn info-btn" title="More Info" (click)="openDetails(movie)">ℹ</button>
                </div>
                <h4 class="card-title">{{movie.title}}</h4>
                <span class="match-text">{{movie.movieYear}}</span>
              </div>
            </div>
          </div>
          
          <div class="pagination-controls">
            <button class="page-btn" [disabled]="currentPage === 0" (click)="prevPage()">◀ Prev</button>
            <span class="page-indicator">Page {{ currentPage + 1 }} of {{ totalPages || 1 }}</span>
            <button class="page-btn" [disabled]="currentPage >= totalPages - 1" (click)="nextPage()">Next ▶</button>
          </div>
        </div>
      </div>

      <div class="list-page" *ngIf="viewMode === 'list'">
        <h2 class="row-header">My Watchlist</h2>
        
        <div class="empty-state" *ngIf="myList.length === 0">
          <div class="empty-icon">🎬</div>
          <p>Your list is feeling a bit empty.</p>
          <button class="action-btn play-btn" (click)="viewMode = 'home'">Browse Movies</button>
        </div>

        <div class="movie-grid" *ngIf="myList.length > 0">
          <div *ngFor="let movie of getWatchlistMovies()" class="movie-card">
            <img [src]="movie.poster" class="poster" onerror="this.src='https://placehold.co/200x300/222/fff?text=No+Poster'">
            <div class="card-details">
              <div class="action-row">
                <button class="circle-btn" title="Play" (click)="playMovie(movie.title)">▶</button>
                <button class="circle-btn" title="Remove" (click)="removeFromList(movie.title)">✖</button>
                <button class="circle-btn info-btn" title="More Info" (click)="openDetails(movie)">ℹ</button>
              </div>
              <h4 class="card-title">{{movie.title}}</h4>
              <span class="match-text">{{movie.movieYear}}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* GLOBAL & UTILS */
    .app-container { background: #080808; color: #f5f5f5; min-height: 100vh; font-family: 'Inter', -apple-system, sans-serif; overflow-x: hidden; }
    
    /* TOAST */
    .toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(100px); background: rgba(229, 9, 20, 0.95); color: white; padding: 12px 28px; border-radius: 30px; font-weight: 600; font-size: 0.95rem; z-index: 9999; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); opacity: 0; box-shadow: 0 10px 25px rgba(229, 9, 20, 0.3); backdrop-filter: blur(10px); pointer-events: none; border: 1px solid rgba(255,255,255,0.1); }
    .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

    /* MODERN MODALS (Glassmorphism) */
    .custom-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 10000; backdrop-filter: blur(8px); }
    .custom-modal { background: rgba(20, 20, 20, 0.85); border: 1px solid rgba(255,255,255,0.1); padding: 40px; border-radius: 16px; width: 380px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.5); animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); box-sizing: border-box; }
    .custom-modal h3 { margin-top: 0; font-size: 1.5rem; color: #fff; font-weight: 700; }
    .custom-modal p { color: #a0a0a0; margin-bottom: 30px; line-height: 1.6; font-size: 0.95rem; }
    .modal-actions { display: flex; gap: 15px; justify-content: center; }
    .modal-btn { padding: 12px 20px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.95rem; flex: 1; transition: all 0.2s ease; }
    .modal-btn.secondary { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.05); }
    .modal-btn.secondary:hover { background: rgba(255,255,255,0.15); }
    .modal-btn.primary { background: #E50914; color: white; box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3); }
    .modal-btn.primary:hover { background: #f40612; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(229, 9, 20, 0.4); }

    /* DETAILS MODAL */
    .details-modal { width: 850px; padding: 0; overflow: hidden; text-align: left; display: flex; flex-direction: column; }
    .close-details-btn { position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.5); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; width: 36px; height: 36px; font-size: 1rem; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; backdrop-filter: blur(4px); }
    .close-details-btn:hover { background: white; color: black; transform: scale(1.1); }
    .details-layout { display: flex; min-height: 450px; }
    .details-poster-container { flex: 0 0 320px; }
    .details-poster { width: 100%; height: 100%; object-fit: cover; display: block; }
    .details-content { flex: 1; padding: 40px; display: flex; flex-direction: column; justify-content: center; background: linear-gradient(135deg, rgba(20,20,20,0.9) 0%, rgba(30,30,30,0.9) 100%); }
    .details-title { font-size: 2.5rem; margin: 0 0 12px 0; font-weight: 800; line-height: 1.1; letter-spacing: -0.5px; }
    .details-meta { display: flex; gap: 15px; align-items: center; margin-bottom: 20px; font-weight: 600; font-size: 0.9rem; }
    .hd-badge { border: 1px solid rgba(255,255,255,0.3); padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; color: #ddd; letter-spacing: 0.5px; }
    .details-director { font-size: 0.95rem; color: #aaa; margin: 0 0 20px 0; }
    .details-director span { color: #fff; font-weight: 500; }
    .details-desc { color: #bbb; line-height: 1.7; font-size: 1.05rem; margin-bottom: 35px; font-weight: 400; }
    .details-actions { display: flex; gap: 20px; align-items: center; margin-top: auto; }

    /* RATING SYSTEM */
    .rating-picker { display: flex; flex-direction: column; align-items: center; margin-left: auto; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
    .star-container { display: flex; gap: 4px; cursor: pointer; }
    .star { font-size: 1.3rem; color: #444; transition: all 0.2s ease; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
    .star:hover { transform: scale(1.2); }
    .star.filled { color: #FFC107; text-shadow: 0 0 10px rgba(255, 193, 7, 0.4); }
    .rating-value { font-size: 0.8rem; color: #FFC107; font-weight: 700; margin-top: 6px; letter-spacing: 1px; }

    /* MODERN NAVBAR */
    .navbar { position: fixed; top: 0; width: 100%; padding: 20px 5%; display: flex; justify-content: space-between; align-items: center; z-index: 1000; transition: all 0.4s ease; background: linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%); box-sizing: border-box; }
    .navbar.scrolled { background: rgba(10, 10, 10, 0.85); backdrop-filter: blur(15px); box-shadow: 0 4px 30px rgba(0,0,0,0.5); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 15px 5%; }
    .logo { color: #E50914; font-size: 2rem; margin: 0; font-weight: 900; letter-spacing: -1px; cursor: pointer; text-shadow: 0 2px 10px rgba(229,9,20,0.3); }
    .nav-left { display: flex; align-items: center; gap: 40px; }
    .nav-links { display: flex; gap: 25px; }
    .nav-link { font-size: 0.95rem; cursor: pointer; color: #aaa; transition: all 0.3s ease; font-weight: 500; position: relative; }
    .nav-link:hover { color: #fff; }
    .nav-link.active { font-weight: 700; color: #fff; }
    .nav-link.active::after { content: ''; position: absolute; bottom: -6px; left: 0; width: 100%; height: 2px; background: #E50914; border-radius: 2px; }
    
    .nav-right { display: flex; gap: 25px; align-items: center; }
    .search-container { position: relative; display: flex; align-items: center; }
    .search-icon { position: absolute; left: 12px; font-size: 0.9rem; opacity: 0.7; }
    .search-input { padding: 10px 15px 10px 35px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 20px; width: 200px; transition: all 0.3s ease; font-size: 0.9rem; backdrop-filter: blur(4px); }
    .search-input:focus { width: 260px; outline: none; background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); box-shadow: 0 0 15px rgba(255,255,255,0.05); }
    .sign-out-btn { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; font-size: 0.9rem; }
    .sign-out-btn:hover { background: white; color: black; transform: translateY(-2px); }
    
    /* HERO SECTION */
    .hero-section { height: 85vh; background: url('https://images.unsplash.com/photo-1534809027769-b00d750a6bac?q=80&w=2000') center/cover; position: relative; }
    .hero-overlay { height: 100%; background: linear-gradient(90deg, rgba(8,8,8,1) 0%, rgba(8,8,8,0.6) 50%, transparent 100%), linear-gradient(0deg, rgba(8,8,8,1) 0%, transparent 40%); display: flex; align-items: center; padding-left: 5%; }
    .hero-content { margin-top: 60px; max-width: 600px; }
    .hero-tag { display: inline-block; padding: 4px 10px; background: rgba(229, 9, 20, 0.2); border: 1px solid rgba(229, 9, 20, 0.5); color: #ff4b55; border-radius: 4px; font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; margin-bottom: 15px; }
    .hero-title { font-size: 4.5rem; font-weight: 900; margin: 0 0 20px 0; line-height: 1.05; letter-spacing: -1px; text-shadow: 0 4px 20px rgba(0,0,0,0.8); }
    .hero-desc { font-size: 1.2rem; line-height: 1.6; margin-bottom: 35px; color: #d0d0d0; font-weight: 400; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
    
    /* MODERN BUTTONS */
    .hero-btns { display: flex; gap: 15px; }
    .action-btn { padding: 12px 32px; border: none; border-radius: 8px; font-weight: 700; font-size: 1.1rem; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; }
    .play-btn { background: #fff; color: #000; }
    .play-btn:hover { background: #e6e6e6; transform: scale(1.05); }
    .info-btn-hero { background: rgba(109, 109, 110, 0.7); color: white; backdrop-filter: blur(5px); }
    .info-btn-hero:hover { background: rgba(109, 109, 110, 0.9); transform: scale(1.05); }
    
    /* GRID & CARDS */
    .row { padding: 0 5%; margin-top: -20px; position: relative; z-index: 10; padding-bottom: 60px; }    .row-header { font-size: 1.5rem; margin-bottom: 25px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
    .row-header::before { content: ''; display: block; width: 4px; height: 24px; background: #E50914; border-radius: 2px; }
    
    .movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 25px; padding: 10px 0 30px; }
    .movie-card { height: 340px; position: relative; border-radius: 12px; overflow: hidden; transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); cursor: pointer; background: #1a1a1a; box-shadow: 0 10px 20px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); }
    .movie-card:hover { transform: translateY(-10px) scale(1.05); z-index: 50; box-shadow: 0 20px 40px rgba(0,0,0,0.6); border-color: rgba(255,255,255,0.2); }
    .poster { width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s; }
    
    .card-details { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, transparent 100%); padding: 25px 20px 20px; opacity: 0; transition: all 0.3s ease; display: flex; flex-direction: column; justify-content: flex-end; backdrop-filter: blur(2px); }
    .movie-card:hover .card-details { opacity: 1; }
    .action-row { display: flex; gap: 12px; margin-bottom: 15px; }
    
    .circle-btn { width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.5); background: rgba(0,0,0,0.5); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; transition: all 0.2s ease; backdrop-filter: blur(4px); }
    .circle-btn:hover { border-color: white; background: white; color: black; transform: scale(1.1); }
    .info-btn { margin-left: auto; border-color: rgba(255,255,255,0.3); } 
    
    .card-title { margin: 0 0 8px 0; font-size: 1.05rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 700; }
    .match-text { color: #46d369; font-weight: 700; font-size: 0.85rem; }

    /* PAGINATION */
    .pagination-controls { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 40px; }
    .page-btn { padding: 10px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 30px; font-weight: 600; cursor: pointer; transition: all 0.2s; backdrop-filter: blur(4px); }
    .page-btn:not([disabled]):hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }
    .page-btn[disabled] { opacity: 0.4; cursor: not-allowed; }
    .page-indicator { font-weight: 600; color: #aaa; font-size: 0.95rem; }

    /* LIST PAGE */
    .list-page { padding: 120px 5% 60px; min-height: 100vh; animation: popIn 0.4s ease; }
    .empty-state { text-align: center; margin-top: 80px; padding: 60px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 16px; }
    .empty-icon { font-size: 3rem; margin-bottom: 20px; opacity: 0.5; }
    .empty-state p { color: #888; font-size: 1.2rem; margin-bottom: 25px; }

    /* VIDEO PLAYER */
    .video-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.95); display: flex; justify-content: center; align-items: center; z-index: 20000; backdrop-filter: blur(10px); animation: popIn 0.3s ease; }
    .video-wrapper { width: 90vw; max-width: 1200px; background: #000; border-radius: 12px; overflow: hidden; box-shadow: 0 0 50px rgba(0,0,0,0.8); }
    .close-video-btn { position: absolute; top: 30px; right: 40px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 10px 24px; border-radius: 30px; font-size: 1rem; font-weight: 600; cursor: pointer; z-index: 20001; transition: all 0.3s ease; backdrop-filter: blur(4px); }
    .close-video-btn:hover { background: #E50914; border-color: #E50914; transform: scale(1.05); }

    @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class UserDashboardComponent implements OnInit {
  movies: any[] = [];
  filteredMovies: any[] = [];
  searchTerm: string = '';
  isScrolled: boolean = false;
  userRatingInput: number | null = null;
  hoverRating: number | null = null;
  currentPage: number = 0;
  totalPages: number = 0;
  myList: string[] = []; 
  viewMode: 'home' | 'list' = 'home'; 
  toastMsg = '';
  showLogoutModal = false;
  showDetailsModal = false;
  selectedMovie: any = null;
  showVideoPlayer = false;
  currentVideoUrl = '';
  isSubmitting = false;

  constructor(private movieService: MovieService, private router: Router, private cdr: ChangeDetectorRef) {}

  @HostListener('window:scroll', [])
  onWindowScroll() { this.isScrolled = window.scrollY > 50; }

  ngOnInit() { this.loadMovies(); }

  loadMovies(page: number = 0) {
    this.movieService.getMovies(page).subscribe({
      next: (data: any) => { 
        this.movies = data.content; 
        this.filteredMovies = data.content; 
        this.currentPage = data.number;
        this.totalPages = data.totalPages;
        this.cdr.detectChanges(); 
      },
      error: (err) => this.showToast("Connection to backend failed.")
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.loadMovies(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.loadMovies(this.currentPage - 1);
    }
  }

  getWatchlistMovies() {
    return this.movies.filter(m => this.myList.includes(m.title));
  }

  filterMovies() {
    this.filteredMovies = this.movies.filter(m => m.title.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }

  showToast(msg: string) {
    this.toastMsg = msg;
    setTimeout(() => { this.toastMsg = ''; }, 3000);
  }

  playMovie(title: string) {
    this.showToast(`🎬 Now playing: ${title}`);
    this.currentVideoUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    this.showVideoPlayer = true;
  }

  closeVideo() {
    this.showVideoPlayer = false;
    this.currentVideoUrl = ''; 
  }
  
  setRatingAndSubmit(movieId: number, rating: number) {
    if (this.selectedMovie?.userRating > 0) {
      this.showToast("You have already rated this movie.");
      return;
    }

    if (this.isSubmitting) return; 
    
    this.isSubmitting = true;
    this.userRatingInput = rating;

    const updatedData = { userRating: rating };

    this.movieService.updateMovieRating(movieId, updatedData).subscribe({
      next: (res: any) => {
        if (this.selectedMovie) {
          this.selectedMovie.userRating = rating;
        }
        
        const movieInList = this.movies.find(m => m.id === movieId);
        if (movieInList) {
          movieInList.userRating = rating;
        }

        this.showToast(`⭐ Rating saved! (${rating}/10)`);
        this.isSubmitting = false;
        this.userRatingInput = null;
      },
      error: (err: any) => {
        this.showToast("Failed to save rating.");
        this.isSubmitting = false;
      }
    });
  }

  addToList(title: string) {
    if (!this.myList.includes(title)) {
      this.myList.push(title);
      this.showToast(`✅ Added '${title}' to your list`);
    } else {
      this.showToast(`ℹ️ '${title}' is already saved`);
    }
  }

  removeFromList(title: string) {
    this.myList = this.myList.filter(item => item !== title);
    this.showToast(`🗑️ Removed '${title}'`);
  }

  openDetails(movie: any) {
    this.selectedMovie = movie;
    this.showDetailsModal = true;
  }

  closeDetails() {
    this.showDetailsModal = false;
    this.userRatingInput = null;
    this.hoverRating = null;
    setTimeout(() => { this.selectedMovie = null; }, 300);
  }

  confirmLogout() {
    this.router.navigate(['/login']);
  }
}