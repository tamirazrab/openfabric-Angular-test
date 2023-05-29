import { Component,  OnInit } from '@angular/core';
import { Product } from '../../model/product.model';
import { Observable } from 'rxjs';
import { ProductService } from '../../product.service';


@Component({
  selector: 'openfabric-angular-test-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
})
export class ViewComponent implements OnInit{
  product$: Observable<Product | null>;

  constructor(
    private productService: ProductService,
  ) { }
  ngOnInit(): void {
    this.product$ = this.productService.getProductState();
  }



}
