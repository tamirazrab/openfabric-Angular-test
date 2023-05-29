export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string[];
  brand: string[];
  quantity?: number;
  imageUrl: string;
  isActive?: boolean;
  tags: string[];
}
