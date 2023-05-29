import { Component, Input } from '@angular/core';
import { Product } from '../../model/product.model';


@Component({
  selector: 'openfabric-angular-test-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
})
export class ViewComponent {
  @Input() product: Product;

  constructor(
  ) { }



}
