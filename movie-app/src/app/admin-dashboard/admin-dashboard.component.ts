import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../movie.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

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

      <div class="admin-modal-overlay" *ngIf="showBatchDeleteModal">
        <div class="admin-modal">
          <h3 style="color: #ff4d4d;">Confirm Batch Decommission</h3>
          <p>Are you sure you want to permanently delete <strong>{{ selectedForBatchDelete.size }}</strong> selected assets from the database?</p>
          <div class="modal-actions">
            <button class="admin-btn-secondary" (click)="showBatchDeleteModal = false">Cancel</button>
            <button class="admin-btn-danger" (click)="executeBatchDelete()">DELETE ALL</button>
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
              <div class="batch-actions" *ngIf="selectedForBatchAdd.size > 0">
                <span style="font-size: 0.9rem; color: #aaa;">{{ selectedForBatchAdd.size }} Selected</span>
                <button class="save-btn" style="padding: 6px 15px; font-size: 0.9rem;" (click)="executeBatchAdd()">BATCH DEPLOY</button>
              </div>

              <div *ngFor="let m of searchResults" class="search-item">
                <input type="checkbox" class="custom-checkbox" 
                       [checked]="selectedForBatchAdd.has(m.imdbID)" 
                       (change)="toggleBatchAdd(m.imdbID)">
                <img [src]="m.Poster" onerror="this.src='https://placehold.co/40x60/222/fff?text=?'">
                <div class="search-item-info">
                  <div class="search-item-title">{{ m.Title }}</div>
                  <div class="search-item-year">{{ m.Year }}</div>
                </div>
                <button class="preview-btn" (click)="selectMovie(m.imdbID)">Preview</button>
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
                  <button (click)="omdbResult = null" class="admin-btn-secondary" style="margin-left: 10px;">CANCEL</button>
                </div>
            </div>
          </div>

          <div class="catalog-section" style="overflow-x: auto; margin-top: 30px;">
            <div class="batch-header">
              <h3>Active Inventory <span style="font-size: 0.9rem; color: #666; font-weight: normal; margin-left: 10px;">(Total: {{totalElements}})</span></h3>
              <button *ngIf="selectedForBatchDelete.size > 0" 
                      class="admin-btn-danger" 
                      (click)="showBatchDeleteModal = true">
                BATCH DECOMMISSION ({{selectedForBatchDelete.size}})
              </button>
            </div>
            
            <table class="pro-table">
              <thead>
                <tr>
                  <th style="width: 40px;">
                    <input type="checkbox" class="custom-checkbox" 
                           (change)="toggleAllDelete($event)"
                           [checked]="dbMovies.length > 0 && selectedForBatchDelete.size === dbMovies.length">
                  </th>
                  <th>Poster</th>
                  <th>Movie Info</th>
                  <th>Director</th>
                  <th>Genre</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let movie of dbMovies" [class.selected-row]="selectedForBatchDelete.has(movie.id)">
                  <td>
                    <input type="checkbox" class="custom-checkbox" 
                           [checked]="selectedForBatchDelete.has(movie.id)"
                           (change)="toggleBatchDelete(movie.id)">
                  </td>
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

            <div class="admin-pagination">
              <button class="page-btn" [disabled]="currentPage === 0" (click)="prevPage()">◀ PREV</button>
              <span class="page-info">PAGE {{ currentPage + 1 }} / {{ totalPages === 0 ? 1 : totalPages }}</span>
              <button class="page-btn" [disabled]="currentPage >= totalPages - 1 || totalPages === 0" (click)="nextPage()">NEXT ▶</button>
            </div>

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
    .admin-toast { position: fixed; top: 30px; right: -350px; background: #222; border-left: 4px solid #E50914; color: white; padding: 15px 25px; border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); z-index: 10001; font-weight: bold; transition: 0.4s; }
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
    .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .glass-panel { background: #0f0f0f; border: 1px solid #1f1f1f; padding: 30px; border-radius: 12px; position: relative; }
    .admin-input-row { display: flex; gap: 15px; }
    input[type="text"], input:not([type]) { flex: 1; background: #1a1a1a; border: 1px solid #333; padding: 15px; color: #fff; border-radius: 8px; outline: none; }
    input:focus { border-color: #E50914; }
    .pulse-btn { background: #E50914; color: white; border: none; padding: 0 30px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    
    .search-list-container { background: #111; border: 1px solid #333; margin-top: 5px; border-radius: 8px; max-height: 350px; overflow-y: auto; position: absolute; width: 50%; z-index: 100; box-shadow: 0 10px 20px rgba(0,0,0,0.5); }
    .batch-actions { background: #1a1a1a; padding: 10px 15px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 101; }
    .search-item { display: flex; align-items: center; padding: 10px 15px; border-bottom: 1px solid #222; transition: 0.2s; }
    .search-item:hover { background: #222; }
    .search-item img { width: 40px; height: 60px; object-fit: cover; margin-right: 15px; border-radius: 4px; }
    .search-item-info { display: flex; flex-direction: column; }
    .search-item-title { font-weight: bold; color: #fff; font-size: 0.9rem; }
    .search-item-year { font-size: 0.8rem; color: #888; }
    .preview-btn { background: #333; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-left: auto; transition: 0.2s; font-size: 0.8rem; }
    .preview-btn:hover { background: #555; }
    .custom-checkbox { width: 18px; height: 18px; accent-color: #E50914; cursor: pointer; margin-right: 15px; }

    .omdb-preview { display: flex; gap: 25px; margin-top: 30px; padding: 25px; background: #111; border-radius: 12px; border: 1px solid #E50914; }
    .omdb-preview img { width: 140px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
    .preview-plot { color: #aaa; font-size: 0.9rem; margin: 10px 0; line-height: 1.5; }
    .preview-meta { margin-bottom: 15px; }
    .rating-star { color: #f5c518; font-weight: bold; margin-left: 10px; }
    
    .batch-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .pro-table { width: 100%; border-collapse: collapse; }
    .pro-table th { text-align: left; padding: 15px; color: #666; border-bottom: 1px solid #333; font-size: 0.8rem; text-transform: uppercase; }
    .pro-table td { padding: 15px; border-bottom: 1px solid #111; vertical-align: middle; transition: 0.2s; }
    .selected-row td { background: rgba(229, 9, 20, 0.05); }
    .mini-poster { width: 45px; height: 65px; object-fit: cover; border-radius: 4px; }
    .table-title { font-weight: bold; color: #fff; margin-bottom: 5px; }
    .table-plot { font-size: 0.85rem; color: #777; }
    .year-badge { background: #222; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; color: #aaa; border: 1px solid #333; }
    .genre-badge { background: #1a1a1a; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; border: 1px solid #333; color: #eee; }
    .del-btn { color: #ff4d4d; background: transparent; border: 1px solid #ff4d4d; padding: 6px 12px; border-radius: 4px; cursor: pointer; transition: 0.3s; font-size: 0.8rem; }
    .del-btn:hover { background: #ff4d4d; color: #fff; }
    .save-btn { background: #46d369; color: #000; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s; }
    .save-btn:hover { background: #3cb356; transform: translateY(-2px); }
    .admin-btn-secondary { background: #333; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; transition: 0.3s; }
    .admin-btn-secondary:hover { background: #444; }
    .admin-btn-danger { background: #E50914; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.3s; }
    .admin-btn-danger:hover { background: #f40612; }

    /* NEW: Styles for Admin Pagination */
    .admin-pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 25px; padding-top: 15px; border-top: 1px solid #222; }
    .page-btn { background: #1a1a1a; color: #ccc; border: 1px solid #333; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.8rem; transition: 0.3s; }
    .page-btn:hover:not(:disabled) { background: #E50914; border-color: #E50914; color: white; }
    .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .page-info { color: #888; font-size: 0.85rem; font-weight: bold; letter-spacing: 1px; }
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
  
  // Single and Batch Delete States
  movieToDelete: number | null = null;
  showBatchDeleteModal = false;
  showLogoutModal = false;

  // NEW: Pagination State Tracking
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;

  // Batch Tracking Sets
  selectedForBatchAdd: Set<string> = new Set<string>();
  selectedForBatchDelete: Set<number> = new Set<number>();

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
    if (tab === 'catalog') {
      this.currentPage = 0; // Reset to page 1 when returning to catalog
      this.refreshDbList();
    }
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
          this.selectedForBatchAdd.clear(); 
        } else {
          this.showToast("No matches found.");
          this.searchResults = [];
        }
        this.cdr.detectChanges();
      },
      error: () => this.showToast("Scanner offline. Check backend connectivity.")
    });
  }

  // --- BATCH SELECTION LOGIC ---

  toggleBatchAdd(imdbID: string) {
    if (this.selectedForBatchAdd.has(imdbID)) {
      this.selectedForBatchAdd.delete(imdbID);
    } else {
      this.selectedForBatchAdd.add(imdbID);
    }
  }

  toggleBatchDelete(id: number) {
    if (this.selectedForBatchDelete.has(id)) {
      this.selectedForBatchDelete.delete(id);
    } else {
      this.selectedForBatchDelete.add(id);
    }
  }

  toggleAllDelete(event: any) {
    if (event.target.checked) {
      this.dbMovies.forEach(m => this.selectedForBatchDelete.add(m.id));
    } else {
      this.selectedForBatchDelete.clear();
    }
  }

  // --- SINGLE ACTIONS ---

  selectMovie(imdbID: string) {
    this.movieService.getOmdbDetails(imdbID).subscribe({
      next: (res: any) => {
        this.omdbResult = {
          title: res.title || res.Title,
          movieYear: res.movieYear || res.Year || res.year,
          imdbId: res.imdbId || res.imdbID, 
          genre: res.genre || res.Genre,
          director: res.director || res.Director,
          plot: res.plot || res.Plot,
          poster: res.poster || res.Poster,
          imdbRating: res.imdbRating || res.Rating || 'N/A'
        };
        this.searchResults = []; 
        this.selectedForBatchAdd.clear();
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.showToast("Failed to retrieve intelligence details.");
      }
    });
  }

  addToDatabase() {
    if (!this.omdbResult) return;

    const newMovie = {
      title: this.omdbResult.title, 
      movieYear: this.omdbResult.movieYear,
      imdbId: this.omdbResult.imdbId, 
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
        if (err.status === 409) {
          this.showToast(`Conflict: ${newMovie.title} already exists.`);
        } else {
          this.showToast("Error: Database rejected property.");
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

 executeBatchAdd() {
  if (this.selectedForBatchAdd.size === 0) return;
  
  this.showToast(`Fetching details and deploying ${this.selectedForBatchAdd.size} assets...`);

  const omdbRequests = Array.from(this.selectedForBatchAdd).map(imdbID => 
    this.movieService.getOmdbDetails(imdbID)
  );

  forkJoin(omdbRequests).subscribe({
    next: (responses: any[]) => {
      
      const newMovies = responses.map(res => ({
        title: res.title || res.Title,
        movieYear: res.movieYear || res.Year || res.year,
        imdbId: res.imdbId || res.imdbID,
        poster: res.poster || res.Poster,
        genre: res.genre || res.Genre,
        director: res.director || res.Director,
        plot: res.plot || res.Plot,
        imdbRating: (res.imdbRating || res.Rating) !== 'N/A' ? parseFloat(res.imdbRating || res.Rating) : 0.0
      }));

      this.movieService.addMoviesBatch(newMovies).subscribe({
        next: () => {
          this.showToast(`Batch deployment successful.`); 
          this.selectedForBatchAdd.clear();
          this.searchResults = []; 
          this.omdbSearchQuery = '';
          this.refreshDbList();
        },
        error: (err) => {
          console.error("Batch Add Error:", err);
          this.showToast("Failed to deploy batch. Check for duplicates.");
        }
      });
    },
    error: () => {
      this.showToast("Failed to fetch intelligence details for batch.");
    }
  });
}

  executeBatchDelete() {
    if (this.selectedForBatchDelete.size === 0) return;

    const idsToDelete = Array.from(this.selectedForBatchDelete);
    
    this.showBatchDeleteModal = false;
    this.showToast(`Decommissioning ${idsToDelete.length} assets...`);

    this.movieService.deleteMoviesBatch(idsToDelete).subscribe({
      next: () => {
        this.showToast(`Batch decommission successful.`);
        this.selectedForBatchDelete.clear();
        
        // Safety check: if we deleted everything on the current page, go back a page
        if (this.dbMovies.length === idsToDelete.length && this.currentPage > 0) {
          this.currentPage--;
        }
        
        this.refreshDbList();
      },
      error: (err) => {
        console.error("Batch Delete Error:", err);
        this.showToast("Failed to decommission batch.");
      }
    });
  }

  checkBatchComplete(completed: number, errors: number, total: number, type: string) {
    if (completed + errors === total) {
      this.showToast(`Batch ${type} finished: ${completed} successful, ${errors} failed/duplicate.`);
      
      if (type === 'deployment') {
        this.selectedForBatchAdd.clear();
        this.searchResults = []; 
        this.omdbSearchQuery = '';
      } else {
        this.selectedForBatchDelete.clear();
      }
      
      this.refreshDbList();
    }
  }

  // NEW: Pagination Control Methods
  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.refreshDbList();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.refreshDbList();
    }
  }

  // UPDATED: Now sends currentPage and reads the paginated response
  refreshDbList() {
    this.movieService.getMovies(this.currentPage).subscribe({
      next: (data: any) => { 
        // We now read 'content', 'totalPages', and 'totalElements'
        this.dbMovies = data.content.slice().reverse(); 
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;

        // Clean up deleted items from selection if they somehow persisted
        this.selectedForBatchDelete.forEach(id => {
          if (!this.dbMovies.find(m => m.id === id)) {
            this.selectedForBatchDelete.delete(id);
          }
        });
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        if (err.status === 401) this.router.navigate(['/login']);
      }
    });
  }
}