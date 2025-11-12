import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '@models/product.model';
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
  TuiTitle
} from '@taiga-ui/core';
import { TuiChevron, TuiDataListWrapper, TuiSelect, TuiStatus } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextareaModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import type { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-products',
  imports: [
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
    TuiSelect
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
  protected readonly columns = ['name', 'description', 'status', 'action'];

  getProductListStatus = signal<ApiStatus>(ApiStatus.IDLE);
  productList = signal<Product[]>([]);

  private dialogRef?: Subscription;
  createProductStatus = signal<ApiStatus>(ApiStatus.IDLE);
  updateProductStatus = signal<ApiStatus>(ApiStatus.IDLE);
  deleteProductStatus = signal<ApiStatus>(ApiStatus.IDLE);

  protected readonly StatusList = [
    ProductStatus.UNLISTED,
    ProductStatus.DELETED,
    ProductStatus.UNLISTED,
    ProductStatus.ARCHIVED,
    ProductStatus.PENDING,
    ProductStatus.AVAILABLE,
    ProductStatus.PREORDER
  ];

  productForm = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    status: [ProductStatus.AVAILABLE, [Validators.required]],
  });

  get name() {
    return this.productForm.get('name') as FormControl;
  }
  get description() {
    return this.productForm.get('description') as FormControl;
  }
  get status() {
    return this.productForm.get('status') as FormControl;
  }

  selectedProduct?: Product;

  ngOnInit() {
    this.getProductList();
  }

  getProductList() {
    this.getProductListStatus.set(ApiStatus.LOADING);
    this.productsHttpService
      .getProductList()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (products) => {
          this.productList.set(products);
          this.getProductListStatus.set(ApiStatus.SUCCESS);
        },
        error: (error) => {
          this.alerts.open('', {
            label: 'Không thể tải danh sách sản phẩm',
            appearance: 'warning',
            autoClose: 3000,
          }).subscribe();
          this.getProductListStatus.set(ApiStatus.ERROR);
        }
      });
  }

  openCreateProductDialog(content: PolymorpheusContent<TuiDialogContext>) {
    this.productForm.reset({
      name: '',
      description: '',
      status: ProductStatus.AVAILABLE,
    });
    this.dialogRef = this.dialogs.open(content, {
      size: 'fullscreen'
    }).subscribe();
  }

  createProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    this.createProductStatus.set(ApiStatus.LOADING);
    this.productsHttpService.createProduct(this.productForm.value as any).subscribe({
      next: () => {
        this.createProductStatus.set(ApiStatus.SUCCESS);
        if (this.dialogRef) {
          this.dialogRef.unsubscribe();
        }
        this.alerts.open('', {
          label: 'Tạo sản phẩm thành công',
          appearance: 'success',
          autoClose: 3000,
        }).subscribe();
        this.getProductList();
      },
      error: () => {
        this.alerts.open('', {
          label: 'Không thể tạo sản phẩm mới',
          appearance: 'warning',
          autoClose: 3000,
        }).subscribe();
        this.createProductStatus.set(ApiStatus.ERROR);
      }
    });
  }

  openUpdateProductDialog(content: PolymorpheusContent<TuiDialogContext>, product: Product) {
    this.selectedProduct = product;
    this.productForm.reset({
      name: product.name,
      description: product.description,
      status: product.status,
    });
    this.dialogRef = this.dialogs.open(content, {
      size: 'fullscreen'
    }).subscribe();
  }

  updateProduct() {
    if (this.productForm.invalid || !this.selectedProduct) {
      this.productForm.markAllAsTouched();
      return;
    }
    this.updateProductStatus.set(ApiStatus.LOADING);
    this.productsHttpService.updateProduct(this.selectedProduct.id, this.productForm.value as any).subscribe({
      next: () => {
        this.updateProductStatus.set(ApiStatus.SUCCESS);
        this.dialogRef?.unsubscribe();
        this.alerts.open('', {
          label: 'Cập nhật sản phẩm thành công',
          appearance: 'success',
          autoClose: 3000,
        }).subscribe();
        this.getProductList();
      },
      error: () => {
        this.alerts.open('', {
          label: 'Không thể cập nhật thông tin sản phẩm',
          appearance: 'warning',
          autoClose: 3000,
        }).subscribe();
        this.updateProductStatus.set(ApiStatus.ERROR);
      }
    });
  }

  openDeleteProductDialog(content: PolymorpheusContent<TuiDialogContext>, product: Product) {
    this.selectedProduct = product;
    this.dialogRef = this.dialogs.open(content, {
      size: 'fullscreen'
    }).subscribe();
  }

  deleteProduct() {
    if (!this.selectedProduct) {
      return;
    }
    this.deleteProductStatus.set(ApiStatus.LOADING);
    return this.productsHttpService
      .updateProduct(this.selectedProduct.id, { status: ProductStatus.DELETED})
      .pipe()
      .subscribe({
        next: () => {
          this.deleteProductStatus.set(ApiStatus.SUCCESS);
          this.dialogRef?.unsubscribe();
          this.alerts.open('', {
            label: 'Xóa sản phẩm thành công',
            appearance: 'success',
            autoClose: 3000,
          }).subscribe();
          this.getProductList();
        },
        error: () => {
          this.alerts.open('', {
            label: 'Không thể xóa sản phẩm',
            appearance: 'warning',
            autoClose: 3000,
          }).subscribe();
          this.deleteProductStatus.set(ApiStatus.ERROR);
        }
      });
  }
}
