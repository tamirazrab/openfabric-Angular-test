import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'openfabric-angular-test-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  login() {
    this.authService.login({ email: this.email, password: this.password }).subscribe(
      () => {
        this.snackBar.open('Signed in successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/']); // Redirect to root page on success
      },
      (error) => {
        this.errorMessage = error.message;
      }
    );
  }

}
