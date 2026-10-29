export type ProductCategory =
  | 'Shirts'
  | 'T-Shirts'
  | 'Jeans'
  | 'Trousers'
  | 'Formal Wear'
  | 'Casual Wear'
  | 'Jackets'
  | 'Ethnic Wear'
  | 'Festive Wear';

export const ALL_CATEGORIES: ProductCategory[] = [
  'Shirts',
  'T-Shirts',
  'Jeans',
  'Trousers',
  'Formal Wear',
  'Casual Wear',
  'Jackets',
  'Ethnic Wear',
  'Festive Wear',
];

export interface Product {
  id?: string;
  name: string;
  slug: string;
  category: ProductCategory;
  description: string;
  price?: number | null;
  originalPrice?: number | null;
  sizes: string[];
  colors: string[];
  imageBase64: string;
  additionalImages?: string[];
  featured: boolean;
  isNew: boolean;
  active: boolean;
  sortOrder: number;
  inStock?: boolean;
  createdAt?: any;
}

export interface StoreInfoDetails {
  name: string;
  category: string;
  address: string;
  fullAddress: string;
  phone: string;
  rawPhone: string;
  whatsappNumber: string;
  rating: number;
  reviewCount: number;
  mapsQueryUrl: string;
}

export const STORE_INFO: StoreInfoDetails = {
  name: 'Looks Mens Wear',
  category: "Men's Clothing Store",
  address: 'Anjahiya Bazar, Mehdawal, Menhdawal, Uttar Pradesh 272271',
  fullAddress: 'Anjahiya Bazar, Mehdawal, Menhdawal, Uttar Pradesh 272271, India',
  phone: '+91 91182 68554',
  rawPhone: 'tel:+919118268554',
  whatsappNumber: '919118268554',
  rating: 3.5,
  reviewCount: 2,
  mapsQueryUrl: 'https://www.google.com/maps/search/?api=1&query=Looks+Mens+Wear+Anjahiya+Bazar+Mehdawal+Uttar+Pradesh+272271',
};
