import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../movie.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-wrapper">
      
      <div class="admin-toast" [class.show]="toastMsg">{{toastMsg}}</div>

      <div class="admin-modal-overlay" *ngIf="movieToDelete !== null">
        <div class="admin-modal">
          <h3 style="color: #ff4d4d;">Confirm Decommission</h3>
          <p>Are you sure you want to permanently delete this movie from the database?</p>
          <div class="modal-actions">
            <button class="admin-btn-secondary" (click)="movieToDelete = null">Cancel</button>
            <button class="admin-btn-danger" (click)="executeDelete()">DELETE</button>
          </div>
        </div>
      </div>

      <div class="admin-modal-overlay" *ngIf="showLogoutModal">
        <div class="admin-modal">
          <h3>Exit Admin Mode</h3>
          <p>End the current administrative session?</p>
          <div class="modal-actions">
            <button class="admin-btn-secondary" (click)="showLogoutModal = false">Cancel</button>
            <button class="admin-btn-danger" (click)="confirmLogout()">Exit System</button>
          </div>
        </div>
      </div>

      <aside class="sidebar">
        <h2 class="logo">CONTROL<span style="color: #E50914;">.</span></h2>
        <div class="menu-item" [class.active]="activeTab === 'catalog'" (click)="setTab('catalog')">🎬 Catalog</div>
        <div class="menu-item" [class.active]="activeTab === 'users'" (click)="setTab('users')">👤 Users</div>
        <div class="menu-item logout" (click)="showLogoutModal = true">🚪 Sign Out</div>
      </aside>

      <main class="main-content">
        <header class="admin-header">
          <h2>{{ getHeaderTitle() }}</h2>
          <div class="user-profile">Admin Mode</div>
        </header>

        <div *ngIf="activeTab === 'catalog'">
          <div class="glass-panel search-section">
            <h3>Add New Intelligence</h3>
            <div class="admin-input-row">
              <input [(ngModel)]="omdbSearchQuery" placeholder="Enter Movie Title (e.g. Inception)..." (keyup.enter)="searchOMDB()">
              <button (click)="searchOMDB()" class="pulse-btn">SCAN DATABASE</button>
            </div>
            
            <div *ngIf="searchResults.length > 0" class="search-list-container">
              <div *ngFor="let m of searchResults" class="search-item" (click)="selectMovie(m.imdbID)">
                <img [src]="m.Poster" onerror="this.src='https://placehold.co/40x60/222/fff?text=?'">
                <div class="search-item-info">
                  <div class="search-item-title">{{ m.Title }}</div>
                  <div class="search-item-year">{{ m.Year }}</div>
                </div>
              </div>
            </div>

            <div *ngIf="omdbResult" class="omdb-preview">
                <img [src]="omdbResult.poster" onerror="this.src='https://placehold.co/100x150/222/fff?text=No+Image'">
                <div class="preview-text">
                  <h4>{{omdbResult.title}} <span class="year-badge">{{omdbResult.movieYear}}</span></h4>
                  <p class="preview-plot">{{omdbResult.plot}}</p>
                  <div class="preview-meta">
                    <span class="genre-badge">{{omdbResult.genre}}</span>
                    <span class="rating-star"> ★ {{omdbResult.imdbRating}}</span>
                  </div>
                  <button (click)="addToDatabase()" class="save-btn">CONFIRM DEPLOYMENT</button>
                </div>
            </div>
          </div>

          <div class="catalog-section" style="overflow-x: auto; margin-top: 30px;">
            <h3>Active Inventory</h3>
            <table class="pro-table">
              <thead>
                <tr>
                  <th>Poster</th>
                  <th>Movie Info</th>
                  <th>Director</th>
                  <th>Genre</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let movie of dbMovies">
                  <td>
                    <img [src]="movie.poster" class="mini-poster" onerror="this.src='https://placehold.co/45x65/222/fff?text=N/A'">
                  </td>
                  <td class="info-cell">
                    <div class="table-title">{{movie.title}} <span class="year-badge" style="margin-left: 8px;">{{movie.movieYear}}</span></div>
                    <div class="table-plot">{{ (movie.plot && movie.plot.length > 80) ? (movie.plot | slice:0:80) + '...' : movie.plot }}</div>
                  </td>
                  <td style="color: #bbb;">{{movie.director || 'N/A'}}</td>
                  <td><span class="genre-badge">{{movie.genre || 'N/A'}}</span></td>
                  <td style="color: #f5c518; font-weight: bold;">★ {{movie.imdbRating || '0.0'}}</td>
                  <td>
                    <button (click)="movieToDelete = movie.id" class="del-btn">DECOMMISSION</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div *ngIf="activeTab === 'users'" class="mock-view">
          <div class="glass-panel">
            <h3>Registered User Database</h3>
            <table class="pro-table">
              <thead><tr><th>Username</th><th>Status</th><th>ID</th></tr></thead>
              <tbody>
                <tr *ngFor="let user of users">
                  <td>{{ user.username }}</td>
                  <td><span [style.color]="user.role === 'ADMIN' ? '#46d369' : '#aaa'">{{ user.role }}</span></td>
                  <td>{{ user.id }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-toast { position: fixed; top: 30px; right: -300px; background: #222; border-left: 4px solid #E50914; color: white; padding: 15px 25px; border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); z-index: 9999; font-weight: bold; transition: 0.4s; }
    .admin-toast.show { right: 30px; }
    .admin-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; z-index: 10000; backdrop-filter: blur(8px); }
    .admin-modal { background: #0f0f0f; border: 1px solid #333; padding: 30px; border-radius: 8px; width: 380px; text-align: center; }
    .modal-actions { display: flex; gap: 15px; margin-top: 20px; justify-content: center;}
    .admin-wrapper { display: flex; background: #050505; min-height: 100vh; color: #fff; font-family: 'Inter', sans-serif; }
    .sidebar { width: 260px; background: #0a0a0a; border-right: 1px solid #1f1f1f; padding: 30px; }
    .menu-item { padding: 15px; margin-bottom: 10px; color: #888; border-radius: 8px; cursor: pointer; transition: 0.3s; }
    .menu-item.active { background: #1a1a1a; color: #fff; border-left: 3px solid #E50914; }
    .logout:hover { color: #ff4d4d; }
    .main-content { flex: 1; padding: 40px; }
    .glass-panel { background: #0f0f0f; border: 1px solid #1f1f1f; padding: 30px; border-radius: 12px; }
    .admin-input-row { display: flex; gap: 15px; }
    input { flex: 1; background: #1a1a1a; border: 1px solid #333; padding: 15px; color: #fff; border-radius: 8px; outline: none; }
    input:focus { border-color: #E50914; }
    .pulse-btn { background: #E50914; color: white; border: none; padding: 0 30px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    
    .search-list-container { background: #111; border: 1px solid #333; margin-top: 5px; border-radius: 8px; max-height: 250px; overflow-y: auto; position: absolute; width: 40%; z-index: 100; box-shadow: 0 10px 20px rgba(0,0,0,0.5); }
    .search-item { display: flex; align-items: center; padding: 10px; cursor: pointer; border-bottom: 1px solid #222; }
    .search-item:hover { background: #222; }
    .search-item img { width: 40px; height: 60px; object-fit: cover; margin-right: 15px; border-radius: 4px; }
    .search-item-title { font-weight: bold; color: #fff; font-size: 0.9rem; }
    .search-item-year { font-size: 0.8rem; color: #888; }

    .omdb-preview { display: flex; gap: 25px; margin-top: 30px; padding: 25px; background: #111; border-radius: 12px; border: 1px solid #E50914; }
    .omdb-preview img { width: 140px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
    .preview-plot { color: #aaa; font-size: 0.9rem; margin: 10px 0; line-height: 1.5; }
    .preview-meta { margin-bottom: 15px; }
    .rating-star { color: #f5c518; font-weight: bold; margin-left: 10px; }
    
    .pro-table { width: 100%; border-collapse: collapse; }
    .pro-table th { text-align: left; padding: 15px; color: #666; border-bottom: 1px solid #333; font-size: 0.8rem; text-transform: uppercase; }
    .pro-table td { padding: 15px; border-bottom: 1px solid #111; vertical-align: middle; }
    .mini-poster { width: 45px; height: 65px; object-fit: cover; border-radius: 4px; }
    .table-title { font-weight: bold; color: #fff; margin-bottom: 5px; }
    .table-plot { font-size: 0.85rem; color: #777; }
    .year-badge { background: #222; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; color: #aaa; border: 1px solid #333; }
    .genre-badge { background: #1a1a1a; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; border: 1px solid #333; color: #eee; }
    .del-btn { color: #ff4d4d; background: transparent; border: 1px solid #ff4d4d; padding: 6px 12px; border-radius: 4px; cursor: pointer; transition: 0.3s; }
    .del-btn:hover { background: #ff4d4d; color: #fff; }
    .save-btn { background: #46d369; color: #000; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s; }
    .save-btn:hover { background: #3cb356; transform: translateY(-2px); }
    .admin-btn-secondary { background: #333; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    .admin-btn-danger { background: #E50914; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  activeTab: string = 'catalog'; 
  omdbSearchQuery = '';
  omdbResult: any = null;
  dbMovies: any[] = [];
  users: any[] = [];
  searchResults: any[] = [];
  toastMsg = '';
  movieToDelete: number | null = null;
  showLogoutModal = false;

  constructor(
    private movieService: MovieService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() { 
    this.refreshDbList();
  }

  setTab(tab: string) { 
    this.activeTab = tab;
    if (tab === 'users') this.loadUsers();
    if (tab === 'catalog') this.refreshDbList();
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe({
      next: (data: any[]) => { 
        this.users = data; 
        this.cdr.detectChanges(); 
      },
      error: (err: any) => { 
        if (err.status === 401) this.router.navigate(['/login']);
        this.showToast('Failed to load user database.'); 
      }
    });
  }

  getHeaderTitle(): string {
    return this.activeTab === 'catalog' ? 'Database Management' : 'User Management';
  }

  showToast(msg: string) {
    this.toastMsg = msg;
    setTimeout(() => { this.toastMsg = ''; }, 3000);
  }

  confirmLogout() {
    this.showLogoutModal = false;
    localStorage.removeItem('authCredentials');
    this.router.navigate(['/login']);
  }

  searchOMDB() {
    if (!this.omdbSearchQuery) return;
    this.movieService.searchOmdb(this.omdbSearchQuery).subscribe({
      next: (res: any) => {

        const results = res.search || res.Search;
        if (results && results.length > 0) {
          this.searchResults = results;
          this.omdbResult = null; 
        } else {
          this.showToast("No matches found.");
          this.searchResults = [];
        }
        this.cdr.detectChanges();
      },
      error: () => this.showToast("Scanner offline. Check backend connectivity.")
    });
  }

  selectMovie(imdbID: string) {
    this.movieService.getOmdbDetails(imdbID).subscribe({
      next: (res: any) => {
        
        this.omdbResult = {
          title: res.title || res.Title,
          movieYear: res.movieYear || res.Year || res.year,
          imdbId: res.imdbId || res.imdbID, // Ensure this matches backend 'imdbId'
          genre: res.genre || res.Genre,
          director: res.director || res.Director,
          plot: res.plot || res.Plot,
          poster: res.poster || res.Poster, // Resolves the missing image issue
          imdbRating: res.imdbRating || res.Rating || 'N/A'
        };
        
        this.searchResults = []; 
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.showToast("Failed to retrieve intelligence details.");
      }
    });
  }

  addToDatabase() {
    if (!this.omdbResult) return;

    // Constructed payload to match Spring Boot's MovieDto/Entity
    const newMovie = {
      title: this.omdbResult.title, 
      movieYear: this.omdbResult.movieYear,
      imdbId: this.omdbResult.imdbId, // Fixed lowercase 'd'
      poster: this.omdbResult.poster,
      genre: this.omdbResult.genre,
      director: this.omdbResult.director,
      plot: this.omdbResult.plot,
      imdbRating: (this.omdbResult.imdbRating && this.omdbResult.imdbRating !== 'N/A') 
                   ? parseFloat(this.omdbResult.imdbRating) 
                   : 0.0
    };

    this.movieService.addMovie(newMovie).subscribe({
      next: () => { 
        this.omdbResult = null; 
        this.omdbSearchQuery = ''; 
        this.showToast("Deployment Successful.");
        this.refreshDbList(); 
      },
      error: (err) => {
        console.error("Payload sent:", newMovie);
        if (err.status === 409) {
          this.showToast("Conflict: Asset already exists.");
        } else {
          this.showToast("Error: Database rejected null property.");
        }
      }
    });
  }

  executeDelete() {
    if(this.movieToDelete !== null) {
      this.movieService.deleteMovie(this.movieToDelete).subscribe({
        next: () => {
          this.movieToDelete = null;
          this.showToast("Asset decommissioned.");
          this.refreshDbList();
        },
        error: () => this.showToast("Failed to delete asset.")
      });
    }
  }

  refreshDbList() {
    this.movieService.getMovies().subscribe({
      next: (data: any[]) => { 
        // Order by latest added
        this.dbMovies = data.slice().reverse(); 
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        if (err.status === 401) this.router.navigate(['/login']);
        console.error("Refresh failed:", err);
      }
    });
  }
}