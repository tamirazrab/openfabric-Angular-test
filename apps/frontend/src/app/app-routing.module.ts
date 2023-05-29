import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';

export const routes: Routes = [
  { path: '', loadChildren: () => ProductModule },
  { path: 'auth', loadChildren: () => AuthModule },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
