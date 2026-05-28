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
          <p>Are you sure you want to leave Netflix?</p>
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
                <strong>Director:</strong> {{selectedMovie?.director}}
              </p>
              
              <p class="details-desc">
                {{ selectedMovie?.plot || 'No plot description available for this title.' }}
              </p>
              
              <div class="details-actions">
                <button class="play-btn" style="padding: 10px 25px; font-size: 1rem;" (click)="playMovie(selectedMovie?.title); closeDetails()">▶ Play</button>
                <button class="circle-btn" style="width: 40px; height: 40px; font-size: 1.2rem;" (click)="addToList(selectedMovie?.title)">+</button>
                
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
                  <span *ngIf="selectedMovie?.userRating" style="font-size: 0.65rem; color: #888; margin-top: 2px;"></span>
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
          <h1 class="logo" style="cursor: pointer;" (click)="viewMode = 'home'">NETFLIX</h1>
          <span class="nav-link" [class.active]="viewMode === 'home'" (click)="viewMode = 'home'">Home</span>
          <span class="nav-link" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">My List</span>
        </div>
        <div class="nav-right" style="display: flex; gap: 20px; align-items: center;">
          <input [(ngModel)]="searchTerm" (input)="filterMovies()" placeholder="🔍 Titles..." class="search-input">
          <button (click)="showLogoutModal = true" class="sign-out-btn">Sign Out</button>
        </div>
      </nav>

      <div *ngIf="viewMode === 'home'">
        <div class="hero-section">
          <div class="hero-overlay">
            <div class="hero-content">
              <h1 class="hero-title">GUARDIANS OF THE GALAXY</h1>
              <p class="hero-desc">The Guardians struggle to keep together as a team while dealing with their personal family issues, notably Star-Lord's encounter with his father.</p>
              <div class="hero-btns">
                <button class="play-btn" (click)="playMovie('Guardians of the Galaxy: Vol. 2')">▶ Play</button>
                <button class="more-info-btn" (click)="openDetails({title: 'Guardians of the Galaxy: Vol. 2', movieYear: '2017', genre: 'Action, Adventure, Comedy', director: 'James Gunn', plot: 'The Guardians struggle to keep together as a team while dealing with their personal family issues...', poster: 'https://m.media-amazon.com/images/M/MV5BNWE5MGI3MDctMmU5Ni00YzI2LWEzMTQtZGIyZDA5MzQzNDBhXkEyXkFqcGc@._V1_QL75_UX380_CR0,1,380,562_.jpg', userRating: 7.6})">ℹ More Info</button>
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
        </div>
      </div>

      <div class="list-page" *ngIf="viewMode === 'list'">
        <h2 class="row-header">My Watchlist</h2>
        
        <div class="empty-state" *ngIf="myList.length === 0">
          <p style="color:#888; font-size: 1.2rem;">Your list is empty. Add movies using the + button.</p>
          <button class="modal-btn secondary" (click)="viewMode = 'home'" style="margin-top: 15px;">Browse Movies</button>
        </div>

        <div class="movie-grid wrap-grid" *ngIf="myList.length > 0">
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
    .app-container { background: #0a0a0a; color: white; min-height: 100vh; font-family: Helvetica, sans-serif; overflow-x: hidden; }
    
    .toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(100px); background: rgba(229, 9, 20, 0.9); color: white; padding: 12px 25px; border-radius: 4px; font-weight: bold; z-index: 9999; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); opacity: 0; box-shadow: 0 5px 15px rgba(0,0,0,0.8); backdrop-filter: blur(5px); pointer-events: none; }
    .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

    .custom-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 10000; backdrop-filter: blur(5px); }
    .custom-modal { background: #141414; border: 1px solid #333; padding: 30px; border-radius: 8px; width: 350px; text-align: center; box-shadow: 0 15px 30px rgba(0,0,0,0.8); animation: popIn 0.3s ease; position: relative; }
    .custom-modal h3 { margin-top: 0; font-size: 1.5rem; color: #fff; }
    .custom-modal p { color: #aaa; margin-bottom: 25px; line-height: 1.5; }
    .modal-actions { display: flex; gap: 15px; justify-content: center; }
    .modal-btn { padding: 10px 20px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 1rem; flex: 1; transition: 0.2s; }
    .modal-btn.secondary { background: #333; color: white; border: 1px solid #555; }
    .modal-btn.secondary:hover { background: #444; }
    .modal-btn.primary { background: #E50914; color: white; }
    .modal-btn.primary:hover { background: #f40612; }
    @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .details-modal { width: 750px; padding: 0; overflow: hidden; text-align: left; background: #181818; }
    .close-details-btn { position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.6); color: white; border: 2px solid white; border-radius: 50%; width: 35px; height: 35px; font-size: 1rem; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .close-details-btn:hover { background: white; color: black; }
    .details-layout { display: flex; min-height: 400px; }
    .details-poster-container { flex: 0 0 300px; background: #111; }
    .details-poster { width: 100%; height: 100%; object-fit: cover; display: block; }
    .details-content { flex: 1; padding: 40px 30px; display: flex; flex-direction: column; justify-content: center; }
    .details-title { font-size: 2.2rem; margin: 0 0 10px 0; font-weight: 800; line-height: 1.1; }
    .details-meta { display: flex; gap: 12px; align-items: center; margin-bottom: 15px; font-weight: bold; font-size: 0.9rem; flex-wrap: wrap; }
    .hd-badge { border: 1px solid #aaa; padding: 2px 6px; border-radius: 3px; font-size: 0.75rem; color: #aaa; }
    .details-director { font-size: 0.9rem; color: #bbb; margin: 0 0 15px 0; }
    .details-desc { color: #ddd; line-height: 1.6; font-size: 1rem; margin-bottom: 30px; }
    .details-actions { display: flex; gap: 15px; align-items: center; margin-top: auto; }

    .rating-picker { display: flex; flex-direction: column; align-items: center; margin-left: 10px; }
    .star-container { display: flex; gap: 3px; cursor: pointer; }
    .star { font-size: 1.4rem; color: #333; transition: transform 0.1s; }
    .star:hover { transform: scale(1.2); }
    .star.filled { color: #ffb400; }
    .rating-value { font-size: 0.75rem; color: #ffb400; font-weight: bold; margin-top: 4px; }

    .navbar { position: fixed; top: 0; width: 100%; padding: 20px 4%; display: flex; justify-content: space-between; align-items: center; z-index: 1000; transition: background 0.4s ease; background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); box-sizing: border-box; }
    .navbar.scrolled { background: #141414; box-shadow: 0 2px 10px rgba(0,0,0,0.5); }
    .logo { color: #E50914; font-size: 1.8rem; margin: 0; font-weight: bold; }
    .nav-left { display: flex; align-items: center; gap: 30px; }
    .nav-link { font-size: 0.9rem; cursor: pointer; color: #e5e5e5; transition: color 0.3s; }
    .nav-link:hover { color: #b3b3b3; }
    .nav-link.active { font-weight: bold; color: #fff; }
    .search-input { padding: 8px 15px; background: rgba(0,0,0,0.6); border: 1px solid #fff; color: white; border-radius: 4px; width: 150px; transition: 0.3s; }
    .search-input:focus { width: 220px; outline: none; background: rgba(0,0,0,0.8); }
    .sign-out-btn { background: transparent; border: 1px solid #fff; color: white; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.3s; }
    .sign-out-btn:hover { background: white; color: black; }
    
    .hero-section { height: 85vh; background: url('https://images.unsplash.com/photo-1534809027769-b00d750a6bac?q=80&w=2000') center/cover; position: relative; }
    .hero-overlay { height: 100%; background: linear-gradient(to right, #0a0a0a 10%, transparent 70%), linear-gradient(to top, #0a0a0a, transparent 30%); display: flex; align-items: center; padding-left: 4%; }
    .hero-content { margin-top: 50px; }
    .hero-title { font-size: 4rem; font-weight: 900; margin-bottom: 20px; text-shadow: 2px 2px 10px rgba(0,0,0,0.8); }
    .hero-desc { max-width: 500px; font-size: 1.2rem; line-height: 1.4; margin-bottom: 25px; color: #fff; text-shadow: 1px 1px 4px rgba(0,0,0,0.8); font-weight: 500; }
    .play-btn { padding: 10px 30px; background: white; color: black; border: none; border-radius: 4px; font-weight: bold; font-size: 1.1rem; cursor: pointer; transition: 0.2s; }
    .play-btn:hover { background: rgba(255,255,255,0.7); }
    .more-info-btn { padding: 10px 30px; background: rgba(109, 109, 110, 0.7); color: white; border: none; border-radius: 4px; font-weight: bold; font-size: 1.1rem; cursor: pointer; margin-left: 10px; transition: 0.2s; }
    .more-info-btn:hover { background: rgba(109, 109, 110, 0.4); }
    
    .row { padding: 0 4%; margin-top: -80px; position: relative; z-index: 10; padding-bottom: 50px; }
    .row-header { font-size: 1.4rem; margin-bottom: 15px; }
    .movie-grid { display: flex; gap: 15px; overflow-x: auto; padding: 20px 0; scrollbar-width: none; }
    .movie-grid::-webkit-scrollbar { display: none; }
    .movie-card { flex: 0 0 220px; height: 330px; position: relative; border-radius: 4px; transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); cursor: pointer; background: #181818; }
    .movie-card:hover { transform: scale(1.15); z-index: 50; box-shadow: 0 10px 20px rgba(0,0,0,0.8); }
    .poster { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }
    .card-details { position: absolute; bottom: 0; width: 100%; background: linear-gradient(to top, rgba(0,0,0,0.9) 50%, transparent); padding: 20px 15px 15px; opacity: 0; transition: opacity 0.3s; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; box-sizing: border-box; }
    .movie-card:hover .card-details { opacity: 1; }
    .action-row { display: flex; gap: 10px; margin-bottom: 10px; }
    .circle-btn { width: 30px; height: 30px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.7); background: rgba(0,0,0,0.5); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; transition: 0.2s; }
    .circle-btn:hover { border-color: white; background: white; color: black; }
    .info-btn { margin-left: auto; border-color: rgba(255,255,255,0.4); } 
    .card-title { margin: 0 0 5px 0; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold; }
    .match-text { color: #46d369; font-weight: bold; font-size: 0.8rem; }

    .list-page { padding: 100px 4% 50px 4%; min-height: 100vh; animation: popIn 0.3s ease; }
    .empty-state { text-align: center; margin-top: 50px; }
    .wrap-grid { flex-wrap: wrap; justify-content: flex-start; overflow-x: visible; }
    .wrap-grid .movie-card { margin-bottom: 15px; }

    .video-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #000; display: flex; justify-content: center; align-items: center; z-index: 20000; animation: popIn 0.3s ease; }
    .video-wrapper { width: 90vw; max-width: 1200px; background: #000; box-shadow: 0 0 50px rgba(0,0,0,0.9); }
    .close-video-btn { position: absolute; top: 30px; right: 40px; background: rgba(255,255,255,0.2); color: white; border: none; padding: 10px 20px; border-radius: 4px; font-size: 1.2rem; font-weight: bold; cursor: pointer; z-index: 20001; transition: 0.3s; }
    .close-video-btn:hover { background: #E50914; color: white; transform: scale(1.1); }
  `]
})
export class UserDashboardComponent implements OnInit {
  movies: any[] = [];
  filteredMovies: any[] = [];
  searchTerm: string = '';
  isScrolled: boolean = false;
  userRatingInput: number | null = null;
  hoverRating: number | null = null;
  
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

  loadMovies() {
    this.movieService.getMovies().subscribe({
      next: (data) => { 
        this.movies = data; 
        this.filteredMovies = data; 
        this.cdr.detectChanges(); 
      },
      error: (err) => this.showToast("Connection to backend failed.")
    });
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
    // 1. BLOCK: Check if movie already has a rating
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