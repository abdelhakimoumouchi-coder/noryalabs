'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { colorCartKey } from '@/lib/productColors'

export interface CartItem {
  cartKey?: string
  productId: string
  name: string
  priceDa: number
  quantity: number
  image: string
  slug: string
  selectedColorName?: string | null
  selectedColorHex?: string | null
  selectedColorImage?: string | null
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (cartKey: string) => void
  updateQuantity: (cartKey: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'cart'

function withCartKey(item: CartItem): CartItem {
  return {
    ...item,
    cartKey: item.cartKey || colorCartKey(item.productId, item.selectedColorName),
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Lecture sécurisée du localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setItems(Array.isArray(parsed) ? parsed.map(withCartKey) : [])
      }
    } catch (e) {
      console.warn('Cart storage corrompu, réinitialisation.', e)
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Persistance
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isHydrated])

  // Synchronisation multi-onglets
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          setItems(Array.isArray(parsed) ? parsed.map(withCartKey) : [])
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const addItem = (newItem: CartItem) => {
    const normalizedNewItem = withCartKey(newItem)
    setItems(current => {
      const existing = current.find(item => withCartKey(item).cartKey === normalizedNewItem.cartKey)
      if (existing) {
        return current.map(item =>
          withCartKey(item).cartKey === normalizedNewItem.cartKey
            ? { ...withCartKey(item), quantity: item.quantity + normalizedNewItem.quantity }
            : item
        )
      }
      return [...current, normalizedNewItem]
    })
  }

  const removeItem = (cartKey: string) => {
    setItems(current => current.filter(item => withCartKey(item).cartKey !== cartKey))
  }

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartKey)
      return
    }
    setItems(current =>
      current.map(item =>
        withCartKey(item).cartKey === cartKey ? { ...withCartKey(item), quantity } : item
      )
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.priceDa * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
