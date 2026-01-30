export interface Subcategory {
  id: string
  name: string
  slug: string
  order: number
  categoryId: string
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  slug: string
  name: string
  priceDa: number
  category: string
  subcategoryId?: string | null
  subcategory?: Subcategory | null
  description: string
  benefits: string[]
  images: string[]
  colors?: string[]
  stock: number
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_delivery'
  | 'delivered'
  | 'canceled'
  | 'returned'

export interface Order {
  id: string
  status: OrderStatus
  firstName: string
  lastName: string
  phone: string
  wilaya: string
  address: string
  notes?: string | null
  subtotalDa: number
  shippingDa: number
  totalDa: number
  createdAt: Date
  updatedAt: Date
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPriceDa: number
  subtotalDa: number
  product?: Product
}

export interface Category {
  id: string
  name: string
  slug: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ProductsResponse {
  products: Product[]
  pagination: PaginationInfo
}