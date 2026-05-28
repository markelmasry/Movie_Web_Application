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
      
      <div class="admin-toast" [class.show]="toastMsg">
        <div class="toast-icon">⚡</div>
        <div class="toast-text">{{toastMsg}}</div>
      </div>

      <div class="admin-modal-overlay" *ngIf="movieToDelete !== null">
        <div class="admin-modal glass-effect">
          <div class="modal-icon danger-icon">⚠️</div>
          <h3>Confirm Decommission</h3>
          <p>Are you sure you want to permanently delete this movie from the database?</p>
          <div class="modal-actions">
            <button class="btn-ghost" (click)="movieToDelete = null">Cancel</button>
            <button class="btn-danger" (click)="executeDelete()">Permanently Delete</button>
          </div>
        </div>
      </div>

      <div class="admin-modal-overlay" *ngIf="showBatchDeleteModal">
        <div class="admin-modal glass-effect">
          <div class="modal-icon danger-icon">⚠️</div>
          <h3>Confirm Batch Decommission</h3>
          <p>Are you sure you want to permanently delete <strong>{{ selectedForBatchDelete.size }}</strong> selected assets from the database?</p>
          <div class="modal-actions">
            <button class="btn-ghost" (click)="showBatchDeleteModal = false">Cancel</button>
            <button class="btn-danger" (click)="executeBatchDelete()">Delete All</button>
          </div>
        </div>
      </div>

      <div class="admin-modal-overlay" *ngIf="showLogoutModal">
        <div class="admin-modal glass-effect">
          <div class="modal-icon neutral-icon">🚪</div>
          <h3>Exit Admin Mode</h3>
          <p>End the current administrative session and return to login?</p>
          <div class="modal-actions">
            <button class="btn-ghost" (click)="showLogoutModal = false">Cancel</button>
            <button class="btn-danger" (click)="confirmLogout()">Exit System</button>
          </div>
        </div>
      </div>

      <aside class="sidebar">
        <div class="sidebar-header">
          <h2 class="logo">CONTROL<span class="text-accent">.</span></h2>
          <div class="version-badge">v2.0.4</div>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-label">Main Menu</div>
          <button class="menu-item" [class.active]="activeTab === 'catalog'" (click)="setTab('catalog')">
            <span class="icon">🎬</span> Intelligence Catalog
          </button>
          <button class="menu-item" [class.active]="activeTab === 'users'" (click)="setTab('users')">
            <span class="icon">👤</span> Personnel Records
          </button>
        </nav>

        <div class="sidebar-footer">
          <button class="menu-item logout" (click)="showLogoutModal = true">
            <span class="icon">⏻</span> Sign Out
          </button>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-header">
          <div>
            <h1 class="page-title">{{ getHeaderTitle() }}</h1>
            <p class="page-subtitle">Manage system assets and intelligence deployments.</p>
          </div>
          <div class="user-profile">
            <div class="avatar">AD</div>
            <div class="user-info">
              <span class="name">Administrator</span>
              <span class="role">System Root</span>
            </div>
          </div>
        </header>

        <div *ngIf="activeTab === 'catalog'" class="fade-in">
          
          <section class="search-section glass-panel">
            <div class="section-header">
              <h2>Add New Intelligence</h2>
              <p>Scan external databases to deploy new assets to the system.</p>
            </div>
            
            <div class="search-bar-wrapper">
              <div class="input-group">
                <span class="search-icon">🔍</span>
                <input [(ngModel)]="omdbSearchQuery" placeholder="Enter Movie Title (e.g., Inception)..." (keyup.enter)="searchOMDB()">
              </div>
              <button (click)="searchOMDB()" class="btn-primary pulse">Scan Database</button>
            </div>

            <div *ngIf="omdbResult" class="omdb-preview fade-in">
                <img [src]="omdbResult.Poster" onerror="this.src='https://placehold.co/200x300/111/444?text=No+Image'">
                <div class="preview-details">
                  <h3>{{omdbResult.Title}} <span class="year-badge">{{omdbResult.Year}}</span></h3>
                  <div class="meta-row">
                    <span class="genre-tag">{{omdbResult.Genre}}</span>
                    <span class="rating-tag">★ {{omdbResult.imdbRating}}</span>
                    <span class="director-tag">🎥 {{omdbResult.Director}}</span>
                  </div>
                  <p class="plot-text">{{omdbResult.Plot}}</p>
                  
                  <div class="preview-actions">
                    <button (click)="addToDatabase()" class="btn-success">Confirm Deployment</button>
                    <button (click)="omdbResult = null" class="btn-ghost">Cancel</button>
                  </div>
                </div>
            </div>

            <div *ngIf="searchResults.length > 0" class="results-container fade-in">
              <div class="results-header">
                <h3>Scanner Results <span class="badge">{{totalSearchResults}} matches</span></h3>
                <div class="batch-actions" *ngIf="selectedForBatchAdd.size > 0">
                  <span class="selection-count">{{ selectedForBatchAdd.size }} Assets Selected</span>
                  <button class="btn-success btn-sm" (click)="executeBatchAdd()">Batch Deploy</button>
                </div>
              </div>

              <div class="movie-grid">
                <div *ngFor="let m of searchResults" class="movie-card" [class.selected]="selectedForBatchAdd.has(m.imdbID)">
                  <div class="card-poster-wrapper">
                    <img [src]="m.Poster" onerror="this.src='https://placehold.co/300x450/111/444?text=?'">
                    <div class="checkbox-overlay">
                      <input type="checkbox" class="modern-checkbox" 
                             [checked]="selectedForBatchAdd.has(m.imdbID)" 
                             (change)="toggleBatchAdd(m.imdbID)">
                    </div>
                  </div>
                  <div class="card-info">
                    <h4 class="card-title">{{ m.Title }}</h4>
                    <span class="card-year">{{ m.Year }}</span>
                    <button class="btn-secondary btn-full" (click)="selectMovie(m.imdbID)">Inspect</button>
                  </div>
                </div>
              </div>

              <div class="search-footer" *ngIf="searchResults.length > 0">
                <div class="pagination-wrapper" style="width: 100%; border-top: none; margin-top: 0; padding-top: 0;">
                  <button class="btn-ghost" 
                          [disabled]="currentUiPage === 1 || isSearchingMore" 
                          (click)="prevScannerPage()">
                    ← Previous Page
                  </button>
                  
                  <div class="page-indicators">
                    <span class="page-text">Scanner Page {{ currentUiPage }} of {{ maxUiPages }}</span>
                  </div>
                  
                  <button class="btn-ghost" 
                          [disabled]="currentUiPage >= maxUiPages || isSearchingMore" 
                          (click)="nextScannerPage()">
                    Next Page →
                  </button>
                </div>
              </div>

            </div>
          </section>

          <section class="inventory-section">
            <div class="table-header">
              <div>
                <h2>Active Inventory</h2>
                <p>Currently managing {{totalElements}} assets in the local database.</p>
              </div>
              <button *ngIf="selectedForBatchDelete.size > 0" class="btn-danger fade-in" (click)="showBatchDeleteModal = true">
                Batch Decommission ({{selectedForBatchDelete.size}})
              </button>
            </div>
            
            <div class="table-container glass-panel">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th class="checkbox-cell">
                      <input type="checkbox" class="modern-checkbox" 
                             (change)="toggleAllDelete($event)"
                             [checked]="dbMovies.length > 0 && selectedForBatchDelete.size === dbMovies.length">
                    </th>
                    <th>Asset</th>
                    <th>Details</th>
                    <th>Director</th>
                    <th>Rating</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let movie of dbMovies" [class.row-selected]="selectedForBatchDelete.has(movie.id)">
                    <td class="checkbox-cell">
                      <input type="checkbox" class="modern-checkbox" 
                             [checked]="selectedForBatchDelete.has(movie.id)"
                             (change)="toggleBatchDelete(movie.id)">
                    </td>
                    <td class="poster-cell">
                      <img [src]="movie.poster" class="micro-poster" onerror="this.src='https://placehold.co/45x65/111/444?text=N/A'">
                    </td>
                    <td class="info-cell">
                      <div class="movie-title">{{movie.title}} <span class="year-badge sm">{{movie.movieYear}}</span></div>
                      <div class="movie-genre">{{movie.genre || 'Unclassified'}}</div>
                    </td>
                    <td class="text-muted">{{movie.director || 'Unknown'}}</td>
                    <td>
                      <div class="rating-pill">★ {{movie.imdbRating || '0.0'}}</div>
                    </td>
                    <td class="text-right">
                      <button (click)="movieToDelete = movie.id" class="btn-icon-danger" title="Decommission">🗑️</button>
                    </td>
                  </tr>
                  <tr *ngIf="dbMovies.length === 0">
                    <td colspan="6" class="empty-state">
                      <div class="empty-icon">📭</div>
                      <p>Database is currently empty. Scan for intelligence above.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="pagination-wrapper" *ngIf="totalPages > 0">
              <button class="btn-ghost" [disabled]="currentPage === 0" (click)="prevPage()">← Previous</button>
              <div class="page-indicators">
                <span class="page-text">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
              </div>
              <button class="btn-ghost" [disabled]="currentPage >= totalPages - 1" (click)="nextPage()">Next →</button>
            </div>
          </section>
        </div>

        <div *ngIf="activeTab === 'users'" class="fade-in">
          <section class="glass-panel">
            <div class="section-header">
              <h2>Personnel Records</h2>
              <p>Manage system access and user roles.</p>
            </div>
            <div class="table-container">
              <table class="modern-table">
                <thead><tr><th>Identifier (ID)</th><th>Username</th><th>Clearance Level</th></tr></thead>
                <tbody>
                  <tr *ngFor="let user of users">
                    <td class="text-muted">#{{ user.id }}</td>
                    <td class="font-medium">{{ user.username }}</td>
                    <td>
                      <span class="role-badge" [class.admin-role]="user.role === 'ADMIN'">{{ user.role }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* --- VARIABLES & RESET --- */
    :host {
      --bg-base: #050505;
      --bg-surface: #0a0a0b;
      --bg-panel: rgba(20, 20, 22, 0.6);
      --border-color: rgba(255, 255, 255, 0.08);
      --accent: #E50914;
      --accent-hover: #f40612;
      --success: #10b981;
      --success-hover: #059669;
      --text-main: #f4f4f5;
      --text-muted: #a1a1aa;
      --font-family: 'Inter', system-ui, sans-serif;
      --radius-sm: 6px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    /* --- TYPOGRAPHY & UTILS --- */
    .text-accent { color: var(--accent); }
    .text-muted { color: var(--text-muted); }
    .text-right { text-align: right; }
    .font-medium { font-weight: 500; }
    .fade-in { animation: fadeIn 0.4s ease forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* --- LAYOUT --- */
    .admin-wrapper { display: flex; min-height: 100vh; background: var(--bg-base); color: var(--text-main); font-family: var(--font-family); }
    
    /* --- SIDEBAR --- */
    .sidebar { width: 280px; background: var(--bg-surface); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; padding: 24px; }
    .sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
    .logo { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.5px; }
    .version-badge { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); font-size: 0.7rem; padding: 4px 8px; border-radius: var(--radius-sm); color: var(--text-muted); }
    .sidebar-nav { flex: 1; }
    .nav-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 12px; font-weight: 600; }
    .menu-item { display: flex; align-items: center; gap: 12px; width: 100%; background: transparent; border: none; color: var(--text-muted); padding: 12px 16px; border-radius: var(--radius-md); font-size: 0.95rem; font-weight: 500; cursor: pointer; transition: var(--transition); text-align: left; }
    .menu-item:hover { background: rgba(255,255,255,0.03); color: var(--text-main); }
    .menu-item.active { background: rgba(229, 9, 20, 0.1); color: var(--accent); }
    .menu-item.active .icon { color: var(--accent); }
    .logout:hover { background: rgba(229, 9, 20, 0.1); color: var(--accent); }

    /* --- MAIN CONTENT --- */
    .main-content { flex: 1; padding: 40px; max-width: 1400px; margin: 0 auto; width: 100%; overflow-y: auto; }
    .top-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .page-title { font-size: 1.8rem; font-weight: 700; margin-bottom: 4px; }
    .page-subtitle { color: var(--text-muted); font-size: 0.9rem; }
    .user-profile { display: flex; align-items: center; gap: 12px; background: var(--bg-surface); padding: 8px 16px 8px 8px; border-radius: 40px; border: 1px solid var(--border-color); }
    .avatar { background: var(--accent); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem; }
    .user-info { display: flex; flex-direction: column; }
    .user-info .name { font-size: 0.85rem; font-weight: 600; }
    .user-info .role { font-size: 0.7rem; color: var(--text-muted); }

    /* --- PANELS & GLASSMORPHISM --- */
    .glass-panel { background: var(--bg-panel); backdrop-filter: blur(12px); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 32px; margin-bottom: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
    .section-header { margin-bottom: 24px; }
    .section-header h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 4px; }
    .section-header p { color: var(--text-muted); font-size: 0.9rem; }

    /* --- INPUTS & BUTTONS --- */
    .search-bar-wrapper { display: flex; gap: 16px; align-items: center; }
    .input-group { position: relative; flex: 1; }
    .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 1.1rem; opacity: 0.5; }
    .input-group input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-main); padding: 16px 16px 16px 48px; border-radius: var(--radius-md); font-size: 1rem; outline: none; transition: var(--transition); font-family: var(--font-family); }
    .input-group input:focus { border-color: var(--accent); background: rgba(0,0,0,0.5); box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.1); }
    
    button { font-family: var(--font-family); outline: none; display: inline-flex; align-items: center; justify-content: center; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: var(--transition); border: 1px solid transparent; }
    .btn-primary { background: var(--accent); color: white; padding: 16px 32px; font-size: 1rem; }
    .btn-primary:hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(229, 9, 20, 0.3); }
    .btn-secondary { background: rgba(255,255,255,0.05); color: var(--text-main); padding: 10px 20px; border-color: var(--border-color); }
    .btn-secondary:hover { background: rgba(255,255,255,0.1); }
    .btn-success { background: var(--success); color: white; padding: 12px 24px; }
    .btn-success:hover { background: var(--success-hover); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2); transform: translateY(-2px); }
    .btn-danger { background: var(--accent); color: white; padding: 12px 24px; }
    .btn-danger:hover { background: var(--accent-hover); }
    .btn-ghost { background: transparent; color: var(--text-muted); padding: 12px 24px; }
    .btn-ghost:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }
    .btn-sm { padding: 8px 16px; font-size: 0.85rem; border-radius: var(--radius-sm); }
    .btn-full { width: 100%; }
    .btn-icon-danger { background: transparent; color: var(--text-muted); padding: 8px; border-radius: var(--radius-sm); border: 1px solid transparent; font-size: 1.1rem; }
    .btn-icon-danger:hover { background: rgba(229, 9, 20, 0.1); color: var(--accent); border-color: rgba(229, 9, 20, 0.2); }

    /* --- RESULTS GRID --- */
    .results-container { margin-top: 32px; padding-top: 32px; border-top: 1px solid var(--border-color); }
    .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .results-header h3 { font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 12px; }
    .badge { background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; }
    .batch-actions { display: flex; align-items: center; gap: 16px; background: rgba(16, 185, 129, 0.1); padding: 8px 16px; border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.2); }
    .selection-count { font-size: 0.85rem; color: var(--success); font-weight: 500; }
    
    .movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px; }
    .movie-card { background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; transition: var(--transition); display: flex; flex-direction: column; }
    .movie-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.2); box-shadow: 0 12px 24px rgba(0,0,0,0.5); }
    .movie-card.selected { border-color: var(--success); box-shadow: 0 0 0 1px var(--success); }
    
    .card-poster-wrapper { position: relative; aspect-ratio: 2/3; overflow: hidden; }
    .card-poster-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: var(--transition); }
    .movie-card:hover .card-poster-wrapper img { transform: scale(1.05); }
    .checkbox-overlay { position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.6); padding: 6px; border-radius: var(--radius-sm); backdrop-filter: blur(4px); opacity: 0; transition: var(--transition); }
    .movie-card:hover .checkbox-overlay, .movie-card.selected .checkbox-overlay { opacity: 1; }
    
    .card-info { padding: 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; justify-content: space-between; }
    .card-title { font-size: 0.95rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .card-year { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; display: block; }

    .search-footer { margin-top: 40px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .search-footer .stats { font-size: 0.9rem; color: var(--text-muted); }

    /* --- OMDB PREVIEW DETAILED --- */
    .omdb-preview { display: flex; gap: 32px; background: rgba(229, 9, 20, 0.03); border: 1px solid rgba(229, 9, 20, 0.2); border-radius: var(--radius-lg); padding: 32px; margin-top: 24px; }
    .omdb-preview img { width: 220px; border-radius: var(--radius-md); box-shadow: 0 16px 32px rgba(0,0,0,0.4); }
    .preview-details { display: flex; flex-direction: column; justify-content: center; }
    .preview-details h3 { font-size: 1.8rem; margin-bottom: 12px; display: flex; align-items: center; gap: 16px; }
    .meta-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .genre-tag, .rating-tag, .director-tag { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
    .rating-tag { color: #fbbf24; border-color: rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.05); }
    .plot-text { font-size: 0.95rem; line-height: 1.6; color: var(--text-muted); margin-bottom: 32px; max-width: 800px; }
    .preview-actions { display: flex; gap: 16px; }

    /* --- MODERN TABLE --- */
    .table-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
    .table-header h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 4px; }
    .table-header p { color: var(--text-muted); font-size: 0.9rem; }
    .table-container { overflow-x: auto; padding: 0; }
    
    .modern-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
    .modern-table th { padding: 16px 20px; color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; border-bottom: 1px solid var(--border-color); background: rgba(0,0,0,0.2); }
    .modern-table td { padding: 16px 20px; vertical-align: middle; border-bottom: 1px solid var(--border-color); transition: var(--transition); }
    .modern-table tbody tr:hover td { background: rgba(255,255,255,0.02); }
    .modern-table tbody tr.row-selected td { background: rgba(229, 9, 20, 0.05); }
    .modern-table tbody tr:last-child td { border-bottom: none; }
    
    .micro-poster { width: 40px; height: 60px; object-fit: cover; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); }
    .movie-title { font-weight: 600; font-size: 0.95rem; margin-bottom: 4px; display: flex; align-items: center; gap: 10px; }
    .movie-genre { font-size: 0.8rem; color: var(--text-muted); }
    .year-badge { background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 500; }
    .year-badge.sm { font-size: 0.7rem; padding: 2px 6px; }
    .rating-pill { display: inline-block; background: rgba(251, 191, 36, 0.1); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.2); padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
    
    .role-badge { background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.5px; }
    .role-badge.admin-role { background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
    
    .empty-state { text-align: center; padding: 60px 20px !important; color: var(--text-muted); }
    .empty-icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.5; }

    /* --- CHECKBOXES --- */
    .modern-checkbox { appearance: none; -webkit-appearance: none; width: 20px; height: 20px; background: rgba(0,0,0,0.3); border: 2px solid var(--text-muted); border-radius: 4px; cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center; }
    .modern-checkbox:checked { background: var(--accent); border-color: var(--accent); }
    .modern-checkbox:checked::after { content: '✓'; color: white; font-size: 14px; font-weight: bold; }

    /* --- PAGINATION --- */
    .pagination-wrapper { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-color); }
    .page-indicators { background: var(--bg-surface); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 20px; }
    .page-text { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }

    /* --- MODALS & TOASTS --- */
    .admin-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 9999; animation: fadeIn 0.2s ease; }
    .admin-modal { background: var(--bg-surface); padding: 40px; text-align: center; max-width: 440px; width: 90%; }
    .modal-icon { font-size: 3rem; margin-bottom: 20px; }
    .admin-modal h3 { font-size: 1.5rem; margin-bottom: 12px; }
    .admin-modal p { color: var(--text-muted); margin-bottom: 32px; line-height: 1.5; }
    .modal-actions { display: flex; gap: 16px; justify-content: center; }
    .modal-actions button { flex: 1; }

    .admin-toast { position: fixed; bottom: 40px; right: 40px; background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-main); padding: 16px 24px; border-radius: var(--radius-md); box-shadow: 0 16px 32px rgba(0,0,0,0.5); z-index: 10000; font-weight: 500; display: flex; align-items: center; gap: 16px; transform: translateY(100px); opacity: 0; transition: var(--transition); }
    .admin-toast.show { transform: translateY(0); opacity: 1; }
    .toast-icon { background: rgba(255,255,255,0.1); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: var(--bg-base); }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #555; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  activeTab: string = 'catalog'; 
  omdbSearchQuery = '';
  lastSearchTitle = '';
  omdbResult: any = null;
  dbMovies: any[] = [];
  users: any[] = [];
  searchResults: any[] = [];
  toastMsg = '';
  
  // Search Pagination State
  currentUiPage: number = 1;
  totalSearchResults: number = 0;
  isSearchingMore: boolean = false;
  uiPageSize: number = 16;

  // Single and Batch Delete States
  movieToDelete: number | null = null;
  showBatchDeleteModal = false;
  showLogoutModal = false;

  // Inventory Pagination State Tracking
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
      this.currentPage = 0; 
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
    return this.activeTab === 'catalog' ? 'Intelligence Catalog' : 'Personnel Management';
  }

  showToast(msg: string) {
    this.toastMsg = msg;
    setTimeout(() => { this.toastMsg = ''; }, 4000);
  }

  confirmLogout() {
    this.showLogoutModal = false;
    localStorage.removeItem('authCredentials');
    this.router.navigate(['/login']);
  }

  // --- DATABASE REFRESH & INVENTORY PAGINATION ---
  
  refreshDbList() {
    this.movieService.getMovies(this.currentPage).subscribe({
      next: (res: any) => {
        this.dbMovies = res.content || [];
        this.totalPages = res.totalPages || 0;
        this.totalElements = res.totalElements || 0;
        this.selectedForBatchDelete.clear(); 
        this.cdr.detectChanges();
      },
      error: () => this.showToast("Failed to load active inventory.")
    });
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.refreshDbList();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.refreshDbList();
    }
  }

  // --- OMDB SCANNER LOGIC & PAGINATION ---

  // Getter for max pages (OMDB returns 10 results per page)
get maxUiPages(): number {
    return Math.ceil(this.totalSearchResults / this.uiPageSize);
  }

  searchOMDB() {
    if (!this.omdbSearchQuery) return;
    this.currentUiPage = 1;
    this.lastSearchTitle = this.omdbSearchQuery;
    this.fetchBufferedResults();
  }

  fetchBufferedResults() {
    this.isSearchingMore = true;

    // Calculate which OMDb API pages we need to fetch to satisfy the UI page
    // UI Page 1 (1-12) needs API Page 1 (1-10) and API Page 2 (11-20)
    const startIndex = (this.currentUiPage - 1) * this.uiPageSize + 1;
    const endIndex = this.currentUiPage * this.uiPageSize;
    
    const startApiPage = Math.ceil(startIndex / 10);
    const endApiPage = Math.ceil(endIndex / 10);

    // Create an array of requests to fetch the required API pages
    const requests = [];
    for (let p = startApiPage; p <= endApiPage; p++) {
      requests.push(this.movieService.searchOmdb(this.lastSearchTitle, p));
    }

    forkJoin(requests).subscribe({
      next: (responses: any[]) => {
        let combinedResults: any[] = [];
        let totalCount = 0;

        responses.forEach(res => {
          if (res.Response === 'True') {
            combinedResults = [...combinedResults, ...res.Search];
            totalCount = parseInt(res.totalResults);
          }
        });

        if (combinedResults.length > 0) {
          this.totalSearchResults = totalCount;
          
          // Slice the combined array to get EXACTLY the 12 items for this UI page
          // We must calculate the offset relative to the fetched API pages
          const sliceStart = (startIndex - 1) % 10; 
          this.searchResults = combinedResults.slice(sliceStart, sliceStart + this.uiPageSize);
        } else {
          this.showToast("No results found.");
          this.searchResults = [];
        }

        this.isSearchingMore = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.showToast("External database scan failed.");
        this.isSearchingMore = false;
        this.cdr.detectChanges();
      }
    });
  }

  nextScannerPage() {
    if (this.currentUiPage < this.maxUiPages) {
      this.currentUiPage++;
      this.fetchBufferedResults();
    }
  }
  
  prevScannerPage() {
    if (this.currentUiPage > 1) {
      this.currentUiPage--;
      this.fetchBufferedResults();
    }
  }
  // --- SINGLE ACTIONS ---

  selectMovie(imdbID: string) {
    this.movieService.getOmdbDetails(imdbID).subscribe({
      next: (res) => { this.omdbResult = res; },
      error: () => { this.showToast('Failed to fetch full asset details.'); }
    });
  }

  addToDatabase() {
    if (!this.omdbResult) return;
    const dto = this.mapOmdbToDto(this.omdbResult);

    this.movieService.addMovie(dto).subscribe({
      next: () => {
        this.showToast('Asset deployed successfully.');
        this.omdbResult = null;
        this.refreshDbList();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Deployment failed. Asset may already exist.');
      }
    });
  }

  executeDelete() {
    if (this.movieToDelete === null) return;
    this.movieService.deleteMovie(this.movieToDelete).subscribe({
      next: () => {
        this.showToast('Asset permanently deleted.');
        this.movieToDelete = null;
        this.refreshDbList();
      },
      error: () => this.showToast('Failed to delete asset.')
    });
  }

  // --- BATCH ACTIONS ---

  toggleBatchAdd(imdbID: string) {
    if (this.selectedForBatchAdd.has(imdbID)) {
      this.selectedForBatchAdd.delete(imdbID);
    } else {
      this.selectedForBatchAdd.add(imdbID);
    }
  }

  executeBatchAdd() {
    if (this.selectedForBatchAdd.size === 0) return;
    
    this.showToast(`Fetching details for ${this.selectedForBatchAdd.size} assets...`);
    
    // We must fetch full details for each OMDB item before adding them to the DB
    const detailRequests = Array.from(this.selectedForBatchAdd).map(id => 
      this.movieService.getOmdbDetails(id)
    );

    forkJoin(detailRequests).subscribe({
      next: (omdbDetails: any[]) => {
        const dtos = omdbDetails.map(detail => this.mapOmdbToDto(detail));
        this.movieService.addMoviesBatch(dtos).subscribe({
          next: () => {
            this.showToast(`Successfully deployed ${dtos.length} assets.`);
            this.selectedForBatchAdd.clear();
            this.refreshDbList();
          },
          error: (err) => this.showToast(err.error?.message || 'Batch deployment failed.')
        });
      },
      error: () => this.showToast('Failed to fetch asset details for batch deployment.')
    });
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

  executeBatchDelete() {
    if (this.selectedForBatchDelete.size === 0) return;
    
    const ids = Array.from(this.selectedForBatchDelete);
    this.movieService.deleteMoviesBatch(ids).subscribe({
      next: () => {
        this.showToast(`Successfully decommissioned ${ids.length} assets.`);
        this.selectedForBatchDelete.clear();
        this.showBatchDeleteModal = false;
        this.refreshDbList();
      },
      error: () => {
        this.showToast('Batch deletion failed.');
        this.showBatchDeleteModal = false;
      }
    });
  }

  // --- UTILS ---

  mapOmdbToDto(omdb: any): any {
    return {
      title: omdb.Title,
      movieYear: omdb.Year,
      genre: omdb.Genre,
      director: omdb.Director,
      plot: omdb.Plot,
      poster: omdb.Poster !== 'N/A' ? omdb.Poster : null,
      imdbRating: omdb.imdbRating && omdb.imdbRating !== 'N/A' ? parseFloat(omdb.imdbRating) : 0,
      imdbId: omdb.imdbID,
      userRating: null
    };
  }
}