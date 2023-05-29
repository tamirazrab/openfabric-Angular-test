import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from './model/product.model';
import { environment } from '../../environment';



export interface ProductPaginationOptions {
  sortBy?: string;
  limit?: number;
  page?: number;
  projectBy?: string;
}

interface ProductResponse {
  results: Product[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  getProducts(options: ProductPaginationOptions): Observable<ProductResponse> {
    let params = new HttpParams();

    if (options.sortBy) {
      params = params.set('sortBy', options.sortBy);
    }
    if (options.limit) {
      params = params.set('limit', options.limit);
    }
    if (options.page) {
      params = params.set('page', options.page);
    }
    if (options.projectBy) {
      params = params.set('projectBy', options.projectBy);
    }

    return this.http.get<ProductResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }



  getProductById(productId: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}`).pipe(
      catchError(this.handleError)
    );
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      catchError(this.handleError)
    );
  }

  updateProduct(productId: string, updates: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${productId}`, updates).pipe(
      catchError(this.handleError)
    );
  }

  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong. Please try again later.');
  }
}
