import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, User } from '../auth/auth.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { TokenStorageService } from '../auth/token.service';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'openfabric-angular-test-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  user$: Observable<User | null>;
  loggedIn$: Observable<boolean>;

  constructor(private authService: AuthService, private router: Router, private tokenStorageService: TokenStorageService, private snackBar: MatSnackBar) { }
  ngOnInit(): void {
    const accessToken = this.tokenStorageService.getAccessToken();
    if (accessToken) {
      this.authService.setLoggedIn(true)
    }
    this.loggedIn$ = this.authService.getLoggedIn();
    this.user$ = this.authService.getUser();
  }

  logout() {
    const refreshToken = this.tokenStorageService.getRefreshToken();
    if (refreshToken) {
      this.authService.logout().subscribe(
        () => {
          this.router.navigate(['/home']);
          this.snackBar.open('You have been logged out', 'Dismiss', {
            duration: 3000,
            verticalPosition: 'top',
          });

          // FIXME - Hacky solution - params route messing up
          window.location.href = '/';
        },
        (error) => {
          console.log('Logout error:', error);
        }
      );
    } else {
      this.tokenStorageService.clearTokens();
      this.router.navigate(['/home']);
      this.snackBar.open('You have been logged out', 'Dismiss', {
        duration: 3000,
        verticalPosition: 'top',
      });
    }
  }

  navigateToHome(): void {
    // FIXME - on param route /:productId it doesn't route properly back - have to click two times
    // this.router.navigateByUrl('/');
    window.location.href = '/';
  }


  navigateToAuth(): void {
    this.router.navigate(['/auth']);
  }
}
