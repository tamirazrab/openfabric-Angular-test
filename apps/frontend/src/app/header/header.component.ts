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
    this.authService.logout().subscribe(
      () => {
        this.router.navigate(['/home']);
        this.snackBar.open('You have been logged out', 'Dismiss', {
          duration: 3000, // Snackbar duration in milliseconds
          verticalPosition: 'top', // Snackbar position
        });
      },
      (error) => {
        console.log('Logout error:', error);
      }
    );
  }

  navigateToHome(): void {
    // FIXME - on param route /:productId it doesn't route properly back - have to click two times
    this.router.navigateByUrl('/');
  }


  navigateToAuth(): void {
    this.router.navigate(['/auth']);
  }
}
