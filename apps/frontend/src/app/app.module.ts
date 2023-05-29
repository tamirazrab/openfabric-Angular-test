import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header/header.component';
import { ProductService } from './product/product.service';
import { AuthService } from './auth/auth.service';
import { AuthInterceptor } from './auth/auth.interceptor';
import { AppComponent } from './app.component';


@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    RouterModule,
    AppRoutingModule,
    AuthModule, ProductModule, HeaderComponent, HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [AuthService, ProductService, {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent],
})
export class AppModule { }
