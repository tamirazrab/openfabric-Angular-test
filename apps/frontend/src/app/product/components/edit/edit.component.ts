import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../product.service';
import { Product } from '../../model/product.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'openfabric-angular-test-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit {
  productForm: FormGroup;
  categories: string[] = ['Electronics', 'Clothing', 'Home', 'Books', 'Beauty'];
  brands: string[] = ['Apple', 'Nike', 'IKEA', "L'Oreal"];
  productId: string;
  errorMessage: string;

  isNewProduct: boolean;

  @Input() product: Product;
  @Output() onCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() onUpdate: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('productId') ?? '';
    this.isNewProduct = !this.productId;
    this.buildProductForm();
    if (!this.isNewProduct) {
      this.productForm.patchValue(this.product);
    }
  }

  buildProductForm(): void {
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(24)]],
      description: ['', [Validators.required, Validators.minLength(100), Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      category: ['', [Validators.required, Validators.pattern(/^(Electronics|Clothing|Home|Books|Beauty)$/)]],
      brand: ['', [Validators.required, Validators.pattern(/^(Apple|Nike|IKEA|L'Oreal)$/)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.required],
      isActive: [false, Validators.required],
      tags: ['']
    });
  }

  get formControls() {
    return this.productForm.controls;
  }

  cancelEdit(): void {
    this.onCancel.emit();
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    const product: Product = {
      ...this.productForm.value,
    };

    //NOTE - on editing product tag is array, but when creating new product tag is string - it could be with data is populating
    if (this.isNewProduct) {
      const tagsValue: string = this.productForm.value.tags;
      product.tags = tagsValue.split(',').map((tag: string) => tag.trim());
    }


    console.log("🚀 ~ file: edit.component.ts:78 ~ EditComponent ~ onSubmit ~ product:", product)
    if (this.isNewProduct) {
      this.productService.createProduct(product).subscribe(
        (response) => {
          this.snackBar.open('Product created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/product', response.id]);
        },
        (error) => {
          let errorMessage = 'An error occurred while creating the product.';
          if (error && error.message) {
            errorMessage = error.message;
          }
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        }
      );
    } else {
      this.productService.updateProduct(this.productId, product).subscribe(
        () => {
          this.snackBar.open('Product updated successfully!', 'Close', { duration: 3000 });
          this.onUpdate.emit();
        },
        (error) => {
          let errorMessage = 'An error occurred while updating the product.';
          if (error && error.message) {
            errorMessage = error.message;
          }
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        }
      );
    }
  }
}
