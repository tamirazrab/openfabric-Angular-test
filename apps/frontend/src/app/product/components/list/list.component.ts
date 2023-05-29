import { Component, OnInit } from '@angular/core';
import { Product } from '../../model/product.model';
import { ProductPaginationOptions, ProductService } from '../../product.service';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'openfabric-angular-test-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {
  products: Product[] = [];
  currentPage = 1;
  totalPages = 1;
  totalResults = 0;
  limit = 12;
  sortBy = '';
  loggedIn$: Observable<boolean>;

  constructor(private productService: ProductService, private router: Router, private authService: AuthService,) { }

  ngOnInit(): void {
    this.fetchProducts();

    this.loggedIn$ = this.authService.getLoggedIn();
  }

  fetchProducts(): void {
    const options: ProductPaginationOptions = {
      page: this.currentPage,
      limit: this.limit,
      sortBy: this.sortBy
    };

    this.productService.getProducts(options).subscribe(
      (response) => {
        this.products = response.results;
        this.totalPages = response.totalPages;
        this.totalResults = response.totalResults;
      },
      (error) => {
        console.log('Error occurred while fetching products:', error);
      }
    );
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.fetchProducts();
  }

  handlePageEvent(event: PageEvent) {
    this.totalResults = event.length;
    this.limit = event.pageSize;
    this.currentPage = event.pageIndex;
    this.fetchProducts();
  }

  addNewProduct() {
    this.router.navigateByUrl('/product/new');
  }
}
