import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MovieService } from '../movie.service';
import { AuthService } from '../auth.service';

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
          <p>Are you sure you want to permanently delete this movie from the system database?</p>
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
              <input [(ngModel)]="omdbSearchQuery" placeholder="Enter Movie Title..." (keyup.enter)="searchOMDB()">
              <button (click)="searchOMDB()" class="pulse-btn">SCAN DATABASE</button>
            </div>
            
            <div *ngIf="omdbResult" class="omdb-preview">
               <img [src]="omdbResult.Poster" onerror="this.src='https://placehold.co/100x150/222/fff?text=No+Image'">
               <div class="preview-text">
                 <h4>{{omdbResult.Title}} <span class="year-badge">{{omdbResult.Year}}</span></h4>
                 <p>{{omdbResult.Plot}}</p>
                 <button (click)="addToDatabase()" class="save-btn">CONFIRM DEPLOYMENT</button>
               </div>
            </div>
          </div>

          <div class="catalog-section">
            <h3>Active Inventory</h3>
            <table class="pro-table">
              <thead><tr><th>Poster</th><th>Movie Title</th><th>Release</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let movie of dbMovies">
                  <td><img [src]="movie.poster" class="mini-poster" onerror="this.src='https://placehold.co/45x65/222/fff?text=N/A'"></td>
                  <td class="table-title">{{movie.title}}</td>
                  <td><span class="year-badge">{{movie.year}}</span></td>
                  <td><button (click)="movieToDelete = movie.id" class="del-btn">DECOMMISSION</button></td>
                </tr>
                <tr *ngIf="dbMovies.length === 0">
                  <td colspan="4" style="text-align: center; color: #666; padding: 30px;">System database is currently empty.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div *ngIf="activeTab === 'analytics'" class="mock-view">
          <div class="glass-panel">
             <h3>Platform Traffic Overview</h3>
             <div style="display: flex; gap: 20px; margin-top: 20px;">
                <div class="stat-box"><h4>Daily Logins</h4><p>1,204</p></div>
                <div class="stat-box"><h4>Movies Played</h4><p>845</p></div>
                <div class="stat-box"><h4>Active Sessions</h4><p>12</p></div>
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
                  <td>
                    <span [style.color]="user.role === 'ADMIN' ? '#46d369' : '#aaa'">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>{{ user.id }}</td>
                </tr>
                <tr *ngIf="users.length === 0">
                  <td colspan="3" style="text-align: center; color: #666; padding: 30px;">
                    No registered users were found in the system.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* ADMIN TOAST & MODAL */
    .admin-toast { position: fixed; top: 30px; right: -300px; background: #222; border-left: 4px solid #E50914; color: white; padding: 15px 25px; border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); z-index: 9999; font-weight: bold; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .admin-toast.show { right: 30px; }
    
    .admin-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; z-index: 10000; backdrop-filter: blur(8px); }
    .admin-modal { background: #0f0f0f; border: 1px solid #333; padding: 30px; border-radius: 8px; width: 380px; text-align: center; box-shadow: 0 0 30px rgba(0,0,0,0.8); animation: popIn 0.3s ease; }
    .admin-modal h3 { margin-top: 0; font-size: 1.4rem; color: #fff; letter-spacing: 1px; text-transform: uppercase; }
    .admin-modal p { color: #888; margin-bottom: 25px; line-height: 1.5; }
    .modal-actions { display: flex; gap: 15px; }
    .admin-btn-secondary { padding: 12px; background: #1a1a1a; color: #aaa; border: 1px solid #333; border-radius: 4px; flex: 1; cursor: pointer; font-weight: bold; transition: 0.2s; }
    .admin-btn-secondary:hover { background: #222; color: #fff; }
    .admin-btn-danger { padding: 12px; background: transparent; color: #ff4d4d; border: 1px solid #ff4d4d; border-radius: 4px; flex: 1; cursor: pointer; font-weight: bold; transition: 0.2s; }
    .admin-btn-danger:hover { background: #ff4d4d; color: white; }

    /* DASHBOARD STYLES */
    .admin-wrapper { display: flex; background: #050505; min-height: 100vh; color: #fff; font-family: Helvetica, sans-serif; }
    .sidebar { width: 260px; background: #0a0a0a; border-right: 1px solid #1f1f1f; padding: 30px; box-sizing: border-box; display: flex; flex-direction: column; }
    .logo { margin-top: 0; margin-bottom: 40px; font-weight: 900; letter-spacing: 2px; }
    .menu-item { padding: 15px; margin-bottom: 10px; color: #888; border-radius: 8px; cursor: pointer; transition: 0.3s; font-weight: bold; }
    .menu-item:hover { background: #1a1a1a; color: #fff; }
    .menu-item.active { background: #1a1a1a; color: #fff; border-left: 3px solid #E50914; border-radius: 0 8px 8px 0; }
    .menu-item.logout { margin-top: auto; color: #ff4d4d; border-top: 1px solid #222; padding-top: 20px; border-radius: 0; }
    .menu-item.logout:hover { color: #fff; background: #E50914; border-color: transparent; }
    .main-content { flex: 1; padding: 40px; }
    .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 1px solid #1f1f1f; padding-bottom: 20px; }
    .admin-header h2 { margin: 0; font-weight: 300; }
    .user-profile { background: #1a1a1a; padding: 8px 16px; border-radius: 20px; font-size: 0.9rem; border: 1px solid #333; }
    .glass-panel { background: #0f0f0f; border: 1px solid #1f1f1f; padding: 30px; border-radius: 12px; margin-bottom: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h3 { margin-top: 0; color: #e5e5e5; font-size: 1.2rem; }
    .admin-input-row { display: flex; gap: 15px; margin-top: 20px; }
    input { flex: 1; background: #1a1a1a; border: 1px solid #333; padding: 15px; color: #fff; border-radius: 8px; font-size: 1rem; transition: 0.3s; }
    input:focus { border-color: #E50914; outline: none; background: #222; }
    .pulse-btn { background: #E50914; color: white; border: none; padding: 0 30px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; letter-spacing: 1px; }
    .pulse-btn:hover { background: #f40612; }
    .omdb-preview { display: flex; gap: 25px; margin-top: 30px; padding-top: 30px; border-top: 1px solid #1f1f1f; }
    .omdb-preview img { width: 120px; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
    .preview-text h4 { margin: 0 0 10px 0; font-size: 1.5rem; display: flex; align-items: center; gap: 15px; }
    .preview-text p { color: #aaa; line-height: 1.6; margin-bottom: 25px; max-width: 800px; }
    .save-btn { background: transparent; color: #46d369; border: 1px solid #46d369; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s; }
    .save-btn:hover { background: #46d369; color: black; }
    .pro-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; }
    .pro-table th { text-align: left; padding: 15px; border-bottom: 1px solid #333; color: #666; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
    .pro-table td { padding: 15px; border-bottom: 1px solid #111; vertical-align: middle; }
    .table-title { font-weight: bold; color: #ddd; }
    .mini-poster { width: 45px; height: 65px; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.5); }
    .year-badge { background: #1a1a1a; padding: 4px 8px; border-radius: 4px; color: #888; font-size: 0.8rem; border: 1px solid #333; }
    .del-btn { color: #ff4d4d; background: transparent; border: 1px solid #ff4d4d; padding: 6px 12px; border-radius: 4px; cursor: pointer; transition: 0.3s; font-size: 0.8rem; font-weight: bold; }
    .del-btn:hover { background: #ff4d4d; color: white; }
    .stat-box { background: #1a1a1a; padding: 20px; border-radius: 8px; flex: 1; border: 1px solid #333; text-align: center; }
    .stat-box h4 { margin: 0; color: #888; font-weight: normal; font-size: 0.9rem; }
    .stat-box p { margin: 10px 0 0 0; font-size: 2rem; font-weight: bold; color: #E50914; }
    @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class AdminDashboardComponent implements OnInit {
  activeTab: string = 'catalog'; 
  omdbSearchQuery = '';
  omdbResult: any = null;
  dbMovies: any[] = [];
  users: any[] = [];
  apiKey = '7f6fb6c7'; 

  // Custom UI States
  toastMsg = '';
  movieToDelete: number | null = null;
  showLogoutModal = false;

  constructor(
    private http: HttpClient, 
    private movieService: MovieService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() { 
    this.refreshDbList();
    this.loadUsers();
  }

  setTab(tab: string) { 
    this.activeTab = tab;
    if (tab === 'users') {
      this.loadUsers();
    }
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe({
      next: (data) => { this.users = data; this.cdr.detectChanges(); },
      error: () => { this.users = []; this.showToast('Unable to load users.'); }
    });
  }

  getHeaderTitle(): string {
    if (this.activeTab === 'catalog') return 'Database Management';
    if (this.activeTab === 'analytics') return 'Platform Analytics';
    if (this.activeTab === 'users') return 'User Management';
    return 'Admin Control';
  }

  showToast(msg: string) {
    this.toastMsg = msg;
    setTimeout(() => { this.toastMsg = ''; }, 3000);
  }

  confirmLogout() {
    this.showLogoutModal = false;
    this.router.navigate(['/login']);
  }

  searchOMDB() {
    if (!this.omdbSearchQuery) return;
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(this.omdbSearchQuery)}&apikey=${this.apiKey}`;
    this.http.get(url).subscribe({
      next: (res: any) => {
        if (res.Response === "False") { 
          this.showToast("Alert: Movie not found in global database."); 
          this.omdbResult = null; 
        } else { 
          this.omdbResult = res; 
        }
      },
      error: (err) => this.showToast("Network connection error.")
    });
  }

  addToDatabase() {
    if (!this.omdbResult) return;
    const newMovie = {
      title: this.omdbResult.Title, year: parseInt(this.omdbResult.Year),
      imdbId: this.omdbResult.imdbID, poster: this.omdbResult.Poster
    };
    this.movieService.addMovie(newMovie).subscribe({
      next: () => { 
        this.omdbResult = null; 
        this.omdbSearchQuery = ''; 
        this.showToast("Deployment Successful.");
        this.refreshDbList(); 
      },
      error: (err) => this.showToast("Error saving to internal database.")
    });
  }

  executeDelete() {
    if(this.movieToDelete !== null) {
      this.movieService.deleteMovie(this.movieToDelete).subscribe({
        next: () => {
          this.movieToDelete = null;
          this.showToast("Asset successfully decommissioned.");
          this.refreshDbList();
        },
        error: (err) => {
          this.movieToDelete = null;
          this.showToast("Failed to delete asset.");
        }
      });
    }
  }

  refreshDbList() {
    this.movieService.getMovies().subscribe({
      next: (data) => { this.dbMovies = data.reverse(); this.cdr.detectChanges(); },
      error: (err) => console.error("Fetch Error:", err)
    });
  }
}