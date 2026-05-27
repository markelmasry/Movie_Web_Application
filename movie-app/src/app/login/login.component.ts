import { Component } from '@angular/core';
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
        <h1 class="logo-text">NETFLIX<span style="font-weight:300"></span></h1>
        
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
    .login-page { height: 100vh; background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1574267433382-4407bfe8d23d?q=80&w=2000') center/cover; display: flex; align-items: center; justify-content: center; font-family: Helvetica, sans-serif; position: relative; overflow: hidden; }
    
    /* TOAST CSS */
    .toast-notification { position: absolute; top: 30px; left: 50%; transform: translateX(-50%) translateY(-100px); background: #46d369; color: black; padding: 15px 30px; border-radius: 4px; font-weight: bold; font-size: 1rem; z-index: 9999; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); opacity: 0; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
    .toast-notification.show { transform: translateX(-50%) translateY(0); opacity: 1; }

    .login-card { background: rgba(0, 0, 0, 0.8); padding: 60px; width: 400px; border-radius: 8px; backdrop-filter: blur(10px); }
    .logo-text { color: #E50914; font-size: 2.5rem; margin-bottom: 20px; font-weight: bold; margin-top: 0; }
    h2 { color: #fff; margin-bottom: 28px; font-size: 2rem; margin-top: 0; }
    .input-group { margin-bottom: 20px; }
    input { width: 100%; padding: 15px; background: #333; border: none; border-radius: 4px; color: white; font-size: 1rem; box-sizing: border-box; }
    input:focus { outline: none; background: #444; }
    .login-btn { width: 100%; padding: 15px; background: #E50914; color: white; border: none; border-radius: 4px; font-weight: bold; font-size: 1.1rem; cursor: pointer; transition: 0.2s; }
    .login-btn:hover { background: #f40612; }
    .login-footer { color: #737373; margin-top: 30px; font-size: 1rem; }
    .login-footer span { color: #fff; cursor: pointer; font-weight: bold; transition: 0.2s; }
    .login-footer span:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  isSignUp = false;
  toastMsg = '';

  constructor(private router: Router, private authService: AuthService) {}

  showToast(msg: string) {
    this.toastMsg = msg;
    setTimeout(() => { this.toastMsg = ''; }, 3000);
  }

  toggleMode() {
    this.isSignUp = !this.isSignUp;
  }

onSubmit(event: Event) {
  event.preventDefault();

  if (this.isSignUp) {
    // FIX: Actually call the database!
    const userData = { username: this.email, password: this.password }; // Using email field as username
    
    this.authService.register(userData).subscribe({
      next: (response) => {
        this.showToast("Account saved to database! Please sign in.");
        this.isSignUp = false; // Switch to login mode
      },
      error: (err) => {
        this.showToast("Registration failed: Username might already exist.");
      }
    });
    return; // Stop here so it doesn't try to log in immediately
  }

  // LOGIN LOGIC (Existing)
  this.authService.login({ username: this.email, password: this.password }).subscribe({
  next: (user) => {
    this.showToast(`Welcome back, ${user.username}`);
    
    // 1. Create the Basic Auth string dynamically based on who just logged in
    const authString = 'Basic ' + btoa(this.email + ':' + this.password);
    
    // 2. Save it to the browser's memory
    localStorage.setItem('authCredentials', authString);
    localStorage.setItem('userRole', user.role); // Assuming your backend returns the role

    // 3. Route them based on their role
    if (user.role === 'ROLE_ADMIN' || user?.username?.toLowerCase() === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/user']);
    }
  },
  error: () => {
    this.showToast('Invalid username or password.');
  }
});
}
}