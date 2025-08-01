import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Product } from '@models/product.model';
import { ApiStatus } from '@shared/enums/api.enum';
import { ProductsHttpService } from '@shared/http-access/products-http.service';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAlertService, TuiButton, TuiLoader, TuiScrollable, TuiScrollbar, TuiTitle } from '@taiga-ui/core';
import { TuiStatus } from '@taiga-ui/kit';

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
    TuiTitle
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent implements OnInit {
  private readonly productsHttpService = inject(ProductsHttpService);
  private readonly alerts = inject(TuiAlertService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly ApiStatus = ApiStatus;
  protected readonly columns = ['name', 'description', 'status', 'action'];

  getProductListStatus = signal<ApiStatus>(ApiStatus.IDLE);
  productList = signal<Product[]>([]);

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

  openCreateProductDialog() {

  }
}
