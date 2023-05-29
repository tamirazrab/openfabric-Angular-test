import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../auth/auth.service';
import { ProductService } from '../../product.service';
import { Product } from '../../model/product.model';
import { Observable, Subscription } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'openfabric-angular-test-parent-view',
  templateUrl: './parent-view.component.html',
  styleUrls: ['./parent-view.component.css'],
})
export class ParentViewComponent implements OnInit, OnDestroy {
  product: Product;
  productId: string;
  isEditOpen = false;
  // user$: Observable<User | null>;
  loggedIn$: Observable<boolean>;

  private userSubscription: Subscription;
  private loggedInSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private productService: ProductService,
    private location: Location
  ) {

  }
  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('productId') ?? '';
    this.fetchProduct();
    // this.user$ = this.authService.getUser();
    this.loggedIn$ = this.authService.getLoggedIn();

    // this.userSubscription = this.user$.subscribe();
    this.loggedInSubscription = this.loggedIn$.subscribe();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.loggedInSubscription.unsubscribe();
  }

  navigateToRoot() {
    // FIXME - route not going backward - fix if there is anytime left
    // this.router.navigate(['/home']);

    // FIXME - Hacky solution due to short time
    window.location.href = '/';
  }

  fetchProduct(): void {
    this.productService.getProductById(this.productId).subscribe(
      (product: Product) => {
        if (product)
          this.product = product;
        else {
          this.snackBar.open('Product does not exist in the database.', 'Close', { duration: 3000 });
          this.router.navigate(['/']); // Redirect to root page if product is not found
        }
      },
      (error) => {
        console.error(error);
        this.router.navigate(['/']); // Redirect to root page if product not found
      }
    );
  }

  editProduct(): void {
    this.isEditOpen = true;
  }

  cancelEdit(): void {
    this.isEditOpen = false;
  }

  confirmDeleteProduct(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: 'Are you sure you want to delete this product?'
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.deleteProduct();
      }
    });
  }

  deleteProduct(): void {
    this.productService.deleteProduct(this.productId).subscribe(
      () => {
        this.snackBar.open('Product deleted successfully.', 'OK', {
          duration: 3000
        });
        this.router.navigate(['/']);
      },
      (error) => {
        // Handle error and display appropriate message
        console.error(error);
      }
    );
  }
}
