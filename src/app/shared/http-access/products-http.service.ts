import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@config/app.config';
import { CreateProductDto, UpdateProductDto, Product } from '@models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsHttpService {
  private readonly appConfig = inject(APP_CONFIG);
  private readonly http = inject(HttpClient);

  getProductList() {
    return this.http.get<Product[]>(`${this.appConfig.apiUrl}/products`);
  }

  createProduct(Product: CreateProductDto) {
    return this.http.post<Product>(`${this.appConfig.apiUrl}/products`, Product);
  }

  updateProduct(id: string, Product: UpdateProductDto) {
    return this.http.put<Product>(`${this.appConfig.apiUrl}/products/${id}`, Product);
  }
}
