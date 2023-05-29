import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ContainerComponent } from './components/container/container.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@NgModule({
  declarations: [LoginComponent, RegisterComponent, ContainerComponent],
  imports: [CommonModule, FormsModule,
    ReactiveFormsModule, AuthRoutingModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
})
export class AuthModule { }
