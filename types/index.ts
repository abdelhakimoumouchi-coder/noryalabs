export interface Product {
  id: string
  slug: string
  name: string
  priceDa: number
  category: string
  description: string
  benefits: string[]
  images: string[]
  stock: number
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  status: string
  customerName: string
  phone: string
  wilaya: string
  address: string
  notes?: string | null
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
