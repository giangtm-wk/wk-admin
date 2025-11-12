import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateProductDto, Product, UpdateProductDto } from '@models/product.model';
import { ApiStatus } from '@shared/enums/api.enum';
import { ProductStatus } from '@shared/enums/product-status.enum';
import { ProductsHttpService } from '@shared/http-access/products-http.service';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAutoFocus } from '@taiga-ui/cdk';
import {
  TuiAlertService,
  TuiButton,
  TuiDialogContext,
  TuiDialogService,
  TuiLoader,
  TuiScrollable,
  TuiScrollbar,
  TuiTextfield,
  TuiTextfieldOptionsDirective,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiChevron, TuiDataListWrapper, TuiSelect, TuiStatus } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextareaModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import type { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-products',
  imports: [
    DecimalPipe,
    TuiLoader,
    TuiScrollbar,
    CdkVirtualScrollViewport,
    TuiScrollable,
    CdkFixedSizeVirtualScroll,
    TuiStatus,
    TuiButton,
    CdkVirtualForOf,
    TuiTable,
    TuiTitle,
    ReactiveFormsModule,
    TuiInputModule,
    TuiTextareaModule,
    TuiAutoFocus,
    TuiTextfieldOptionsDirective,
    TuiTextfieldControllerModule,
    TuiTextfield,
    TuiChevron,
    TuiDataListWrapper,
    TuiSelect,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent implements OnInit {
  private readonly productsHttpService = inject(ProductsHttpService);
  private readonly fb = inject(FormBuilder);
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly ApiStatus = ApiStatus;
  protected readonly columns = ['name', 'originPrice', 'price', 'stock', 'status', 'action'];

  getProductListStatus = signal<ApiStatus>(ApiStatus.IDLE);
  productList = signal<Product[]>([]);

  private dialogRef?: Subscription;
  createProductStatus = signal<ApiStatus>(ApiStatus.IDLE);
  updateProductStatus = signal<ApiStatus>(ApiStatus.IDLE);
  deleteProductStatus = signal<ApiStatus>(ApiStatus.IDLE);

  protected readonly StatusList = [
    ProductStatus.UNLISTED,
    ProductStatus.DELETED,
    ProductStatus.ARCHIVED,
    ProductStatus.PENDING,
    ProductStatus.AVAILABLE,
    ProductStatus.PREORDER,
  ];

  protected readonly StatusLabels: Record<ProductStatus, string> = {
    [ProductStatus.AVAILABLE]: 'Có sẵn',
    [ProductStatus.PENDING]: 'Chờ xử lý',
    [ProductStatus.ARCHIVED]: 'Đã lưu trữ',
    [ProductStatus.UNLISTED]: 'Không niêm yết',
    [ProductStatus.PREORDER]: 'Đặt trước',
    [ProductStatus.DELETED]: 'Đã xóa',
  };

  getStatusLabel(status: ProductStatus | null): string {
    if (!status) return '';
    return this.StatusLabels[status] || status;
  }

  // Helper methods to convert between string and array
  private arrayToString(arr?: string[] | string): string {
    if (!arr) return '';
    if (typeof arr === 'string') return arr;
    if (Array.isArray(arr)) return arr.join(', ');
    return '';
  }

  private stringToArray(str: string): string[] {
    return str
      ? str
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s)
      : [];
  }

  productForm = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    originPrice: [null as number | null, [Validators.required, Validators.min(0)]],
    price: [null as number | null],
    discount: [null as number | null, [Validators.min(0), Validators.max(100)]],
    stock: [null as number | null, [Validators.min(0)]],
    stockBySize: this.fb.control<{ [size: string]: number } | null>(null),
    stockByColor: this.fb.control<{ [color: string]: number } | null>(null),
    imageUrls: [''], // String input, will convert to array
    categories: [''], // String input, will convert to array
    brand: [''],
    tags: [''], // String input, will convert to array
    weight: [''],
    colors: [''], // String input, will convert to array
    sizes: [''], // String input, will convert to array
    materials: [''], // String input, will convert to array
    origin: [''],
    additionalInfo: this.fb.control<{ [key: string]: unknown } | null>(null),
    status: [ProductStatus.AVAILABLE, [Validators.required]],
  });

  get name() {
    return this.productForm.controls.name;
  }
  get description() {
    return this.productForm.controls.description;
  }
  get originPrice() {
    return this.productForm.controls.originPrice;
  }
  get price() {
    return this.productForm.controls.price;
  }
  get discount() {
    return this.productForm.controls.discount;
  }
  get stock() {
    return this.productForm.controls.stock;
  }
  get status() {
    return this.productForm.controls.status;
  }

  selectedProduct?: Product;

  ngOnInit() {
    this.getProductList();
  }

  getProductList() {
    this.getProductListStatus.set(ApiStatus.LOADING);
    this.productsHttpService
      .getProductList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.productList.set(products);
          this.getProductListStatus.set(ApiStatus.SUCCESS);
        },
        error: () => {
          this.alerts
            .open('', {
              label: 'Không thể tải danh sách sản phẩm',
              appearance: 'warning',
              autoClose: 3000,
            })
            .subscribe();
          this.getProductListStatus.set(ApiStatus.ERROR);
        },
      });
  }

  openCreateProductDialog(content: PolymorpheusContent<TuiDialogContext>) {
    this.productForm.reset({
      name: '',
      description: '',
      originPrice: 0,
      price: null,
      discount: null,
      stock: null,
      stockBySize: null,
      stockByColor: null,
      imageUrls: '',
      categories: '',
      brand: '',
      tags: '',
      weight: '',
      colors: '',
      sizes: '',
      materials: '',
      origin: '',
      additionalInfo: null,
      status: ProductStatus.AVAILABLE,
    });
    this.dialogRef = this.dialogs
      .open(content, {
        size: 'fullscreen',
      })
      .subscribe();
  }

  createProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.createProductStatus.set(ApiStatus.LOADING);

    // Convert string inputs to arrays for API
    const formValue = this.productForm.value;
    const productData: CreateProductDto = {
      name: formValue.name || '',
      description: formValue.description || '',
      originPrice: formValue.originPrice || 0,
      price: formValue.price || undefined,
      discount: formValue.discount || undefined,
      stock: formValue.stock || undefined,
      stockBySize: formValue.stockBySize || undefined,
      stockByColor: formValue.stockByColor || undefined,
      imageUrls: this.stringToArray(formValue.imageUrls as string),
      categories: this.stringToArray(formValue.categories as string),
      brand: formValue.brand || undefined,
      tags: this.stringToArray(formValue.tags as string),
      weight: formValue.weight || undefined,
      colors: this.stringToArray(formValue.colors as string),
      sizes: this.stringToArray(formValue.sizes as string),
      materials: this.stringToArray(formValue.materials as string),
      origin: formValue.origin || undefined,
      additionalInfo: formValue.additionalInfo || undefined,
      status: formValue.status || ProductStatus.AVAILABLE,
    };

    this.productsHttpService.createProduct(productData).subscribe({
      next: () => {
        this.createProductStatus.set(ApiStatus.SUCCESS);
        if (this.dialogRef) {
          this.dialogRef.unsubscribe();
        }
        this.alerts
          .open('', {
            label: 'Tạo sản phẩm thành công',
            appearance: 'success',
            autoClose: 3000,
          })
          .subscribe();
        this.getProductList();
      },
      error: () => {
        this.alerts
          .open('', {
            label: 'Không thể tạo sản phẩm mới',
            appearance: 'warning',
            autoClose: 3000,
          })
          .subscribe();
        this.createProductStatus.set(ApiStatus.ERROR);
      },
    });
  }

  openUpdateProductDialog(content: PolymorpheusContent<TuiDialogContext>, product: Product) {
    this.selectedProduct = product;
    this.productForm.patchValue({
      name: product.name,
      description: product.description || '',
      originPrice: product.originPrice,
      price: product.price || null,
      discount: product.discount || null,
      stock: product.stock || null,
      imageUrls: this.arrayToString(product.imageUrls),
      categories: this.arrayToString(product.categories),
      brand: product.brand || '',
      tags: this.arrayToString(product.tags),
      weight: product.weight || '',
      colors: this.arrayToString(product.colors),
      sizes: this.arrayToString(product.sizes),
      materials: this.arrayToString(product.materials),
      origin: product.origin || '',
      status: product.status,
    });

    // Set complex object fields separately to avoid type issues
    if (product.stockBySize) {
      this.productForm.controls.stockBySize.setValue(product.stockBySize);
    }
    if (product.stockByColor) {
      this.productForm.controls.stockByColor.setValue(product.stockByColor);
    }
    if (product.additionalInfo) {
      this.productForm.controls.additionalInfo.setValue(product.additionalInfo);
    }

    this.dialogRef = this.dialogs
      .open(content, {
        size: 'fullscreen',
      })
      .subscribe();
  }

  updateProduct() {
    if (this.productForm.invalid || !this.selectedProduct) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.updateProductStatus.set(ApiStatus.LOADING);

    // Convert string inputs to arrays for API
    const formValue = this.productForm.value;
    const productData: UpdateProductDto = {
      name: formValue.name || undefined,
      description: formValue.description || undefined,
      originPrice: formValue.originPrice || undefined,
      price: formValue.price || undefined,
      discount: formValue.discount || undefined,
      stock: formValue.stock || undefined,
      stockBySize: formValue.stockBySize || undefined,
      stockByColor: formValue.stockByColor || undefined,
      imageUrls: this.stringToArray(formValue.imageUrls as string),
      categories: this.stringToArray(formValue.categories as string),
      brand: formValue.brand || undefined,
      tags: this.stringToArray(formValue.tags as string),
      weight: formValue.weight || undefined,
      colors: this.stringToArray(formValue.colors as string),
      sizes: this.stringToArray(formValue.sizes as string),
      materials: this.stringToArray(formValue.materials as string),
      origin: formValue.origin || undefined,
      additionalInfo: formValue.additionalInfo || undefined,
      status: formValue.status || undefined,
    };

    this.productsHttpService.updateProduct(this.selectedProduct.id, productData).subscribe({
      next: () => {
        this.updateProductStatus.set(ApiStatus.SUCCESS);
        this.dialogRef?.unsubscribe();
        this.alerts
          .open('', {
            label: 'Cập nhật sản phẩm thành công',
            appearance: 'success',
            autoClose: 3000,
          })
          .subscribe();
        this.getProductList();
      },
      error: () => {
        this.alerts
          .open('', {
            label: 'Không thể cập nhật thông tin sản phẩm',
            appearance: 'warning',
            autoClose: 3000,
          })
          .subscribe();
        this.updateProductStatus.set(ApiStatus.ERROR);
      },
    });
  }

  openDeleteProductDialog(content: PolymorpheusContent<TuiDialogContext>, product: Product) {
    this.selectedProduct = product;
    this.dialogRef = this.dialogs
      .open(content, {
        size: 'fullscreen',
      })
      .subscribe();
  }

  deleteProduct() {
    if (!this.selectedProduct) {
      return;
    }
    this.deleteProductStatus.set(ApiStatus.LOADING);
    return this.productsHttpService
      .updateProduct(this.selectedProduct.id, { status: ProductStatus.DELETED })
      .pipe()
      .subscribe({
        next: () => {
          this.deleteProductStatus.set(ApiStatus.SUCCESS);
          this.dialogRef?.unsubscribe();
          this.alerts
            .open('', {
              label: 'Xóa sản phẩm thành công',
              appearance: 'success',
              autoClose: 3000,
            })
            .subscribe();
          this.getProductList();
        },
        error: () => {
          this.alerts
            .open('', {
              label: 'Không thể xóa sản phẩm',
              appearance: 'warning',
              autoClose: 3000,
            })
            .subscribe();
          this.deleteProductStatus.set(ApiStatus.ERROR);
        },
      });
  }
}
