import { Component } from '@angular/core';

@Component({
  selector: 'openfabric-angular-test-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css'],
})
export class ContainerComponent {
  showLoginForm = true;
  showSignupForm = false;

  toggleForm(showLogin: boolean): void {
    this.showLoginForm = showLogin;
    this.showSignupForm = !showLogin;
  }
}
