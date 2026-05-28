import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="toast-notification" [class.show]="toastMsg">
        {{ toastMsg }}
      </div>

      <div class="login-card">
        <h1 class="logo-text">NETFLIX</h1>
        
        <h2>{{ isSignUp ? 'Create Account' : 'Sign In' }}</h2>

        <form (submit)="onSubmit($event)">
          <div class="input-group">
            <input type="text" [(ngModel)]="email" name="email" placeholder="Email or type 'admin'" required>
          </div>
          <div class="input-group">
            <input type="password" [(ngModel)]="password" name="password" placeholder="Password" required>
          </div>
          
          <button type="submit" class="login-btn">
            {{ isSignUp ? 'Register' : 'Sign In' }}
          </button>
        </form>

        <div class="login-footer">
          <p>
            {{ isSignUp ? 'Already have an account?' : 'New to Netflix-ish?' }}
            <span (click)="toggleMode()">{{ isSignUp ? 'Sign in now.' : 'Sign up now.' }}</span>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* GLOBAL BACKGROUND */
    .login-page { height: 100vh; background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1574267433382-4407bfe8d23d?q=80&w=2000') center/cover; display: flex; align-items: center; justify-content: center; font-family: 'Inter', -apple-system, sans-serif; position: relative; overflow: hidden; }
    
    /* MODERN TOAST NOTIFICATION */
    .toast-notification { position: absolute; top: 30px; left: 50%; transform: translateX(-50%) translateY(-100px); background: rgba(30, 30, 30, 0.95); color: #fff; padding: 12px 28px; border-radius: 30px; font-weight: 600; font-size: 0.95rem; z-index: 9999; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); opacity: 0; box-shadow: 0 10px 25px rgba(0,0,0,0.5); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); pointer-events: none; }
    .toast-notification.show { transform: translateX(-50%) translateY(0); opacity: 1; }

    /* GLASSMORPHIC CARD */
    .login-card { background: rgba(20, 20, 20, 0.75); padding: 50px 60px; width: 100%; max-width: 420px; border-radius: 16px; backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px rgba(0,0,0,0.5); box-sizing: border-box; animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
    
    @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    /* TYPOGRAPHY */
    .logo-text { color: #E50914; font-size: 2.5rem; margin: 0 0 30px 0; font-weight: 900; letter-spacing: -1px; text-shadow: 0 2px 10px rgba(229,9,20,0.3); }
    h2 { color: #fff; margin: 0 0 30px 0; font-size: 2rem; font-weight: 700; letter-spacing: -0.5px; }

    /* MODERN INPUTS */
    .input-group { margin-bottom: 20px; }
    input { width: 100%; padding: 16px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 1rem; box-sizing: border-box; transition: all 0.3s ease; backdrop-filter: blur(4px); }
    input::placeholder { color: #aaa; }
    input:focus { outline: none; background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); box-shadow: 0 0 15px rgba(255,255,255,0.05); }

    /* ACTION BUTTON */
    .login-btn { width: 100%; padding: 16px; background: #E50914; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 1.1rem; cursor: pointer; transition: all 0.2s ease; margin-top: 10px; box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3); }
    .login-btn:hover { background: #f40612; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(229, 9, 20, 0.4); }

    /* FOOTER */
    .login-footer { color: #aaa; margin-top: 35px; font-size: 0.95rem; text-align: left; }
    .login-footer p { margin: 0; }
    .login-footer span { color: #fff; cursor: pointer; font-weight: 600; transition: all 0.2s ease; margin-left: 5px; }
    .login-footer span:hover { text-decoration: underline; color: #E50914; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  isSignUp = false;
  toastMsg = '';
  private toastTimeout: any;
  
  constructor(private router: Router, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  showToast(msg: string) {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastMsg = msg;
    this.cdr.detectChanges(); 

    this.toastTimeout = setTimeout(() => { 
      this.toastMsg = ''; 
      this.cdr.detectChanges(); 
    }, 3000);
  }

  toggleMode() {
    this.isSignUp = !this.isSignUp;
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if (this.isSignUp) {
      const userData = { username: this.email, password: this.password }; 
      
      this.authService.register(userData).subscribe({
        next: (response: any) => { 
          this.showToast("Account saved! Please sign in.");
          this.isSignUp = false; 
        },
        error: (err: any) => { 
          this.showToast("Registration failed: Username might already exist.");
        }
      });
      return;
    }

    // LOGIN LOGIC 
    this.authService.login({ username: this.email, password: this.password }).subscribe({
      next: (user: any) => { 
        this.showToast(`Welcome back, ${user.username}`);
        
        const authString = 'Basic ' + btoa(this.email + ':' + this.password);
        
        localStorage.setItem('authCredentials', authString);
        localStorage.setItem('userRole', user.role); 

        const isAdmin = user.role === 'ROLE_ADMIN' || 
                        user.role === 'ADMIN' || 
                        user.username?.toLowerCase() === 'admin';

        if (isAdmin) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/user']);
        }
      },
      error: (err: any) => { 
        this.showToast('Invalid username or password.');
      }
    });
  }
}