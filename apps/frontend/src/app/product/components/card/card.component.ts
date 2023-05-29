import { Component, Input } from '@angular/core';
import { Product } from '../../model/product.model';
import { Router } from '@angular/router';

@Component({
  selector: 'openfabric-angular-test-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent {
  @Input() product: Product;

  constructor(private router: Router) { }

  redirectToProduct(productId: string | undefined): void {
    this.router.navigate(['/product', productId]);
  }

  truncateDescription(description: string): string {
    const maxLength = 169;
    if (description.length > maxLength) {
      return description.slice(0, maxLength) + '...';
    } else {
      return description;
    }
  }

}
