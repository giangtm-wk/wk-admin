import { ProductStatus } from '@shared/enums/product-status.enum';

export interface Product {
  id: number;
  name: string;
  description: string;
  originPrice: number;
  price?: number;
  discount?: number;
  stock?: number;
  stockBySize?: { [size: string]: number };
  stockByColor?: { [color: string]: number };
  imageUrls?: string[];
  categories?: string[];
  brand?: string;
  tags?: string[];
  weight?: string;
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  origin?: string;
  additionalInfo?: { [key: string]: any };
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProductDto = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export interface UpdateProductDto extends Partial<CreateProductDto> {}
