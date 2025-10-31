import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { CartItem, Product } from '@/lib/types'

interface ReceiptData {
  items: CartItem[]
  total: number
  paymentMethod: string
  cashGiven?: number
  change?: number
  timestamp: string
  receiptNumber: string
}

interface CartState {
  cart: CartItem[]
  isCheckingOut: boolean
  isCompleted: boolean
  receiptData: ReceiptData | null
  originalPrices: { [itemId: number]: number } | null
}

const initialState: CartState = {
  cart: [],
  isCheckingOut: false,
  isCompleted: false,
  receiptData: null,
  originalPrices: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const product = action.payload
      const existingItem = state.cart.find((item) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.cart.push({ ...product, quantity: 1 })
      }
    },

    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const { id, quantity } = action.payload

      if (quantity <= 0) {
        state.cart = state.cart.filter((item) => item.id !== id)
      } else {
        const item = state.cart.find((item) => item.id === id)
        if (item) {
          item.quantity = quantity
        }
      }
    },

    updateItemPrice: (state, action: PayloadAction<{ id: number; price: number }>) => {
      const { id, price } = action.payload
      const item = state.cart.find((item) => item.id === id)
      if (item) {
        item.price = price
      }
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload)
    },

    clearCart: (state) => {
      state.cart = []
    },

    setCheckingOut: (state, action: PayloadAction<boolean>) => {
      state.isCheckingOut = action.payload
    },

    setCompleted: (state, action: PayloadAction<boolean>) => {
      state.isCompleted = action.payload
    },

    setReceiptData: (state, action: PayloadAction<ReceiptData | null>) => {
      state.receiptData = action.payload
    },

    completePayment: (state, action: PayloadAction<{
      method: string
      cashGiven?: number
      change?: number
    }>) => {
      const total = state.cart.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
        return sum + price * item.quantity
      }, 0)

      const receiptNumber = `R-${Math.floor(100000 + Math.random() * 900000)}`

      state.receiptData = {
        items: [...state.cart],
        total,
        paymentMethod: action.payload.method,
        cashGiven: action.payload.cashGiven,
        change: action.payload.change,
        timestamp: new Date().toISOString(),
        receiptNumber,
      }

      state.isCompleted = true
      state.isCheckingOut = false
    },

    startNewSale: (state) => {
      state.cart = []
      state.isCompleted = false
      state.receiptData = null
      state.isCheckingOut = false
      state.originalPrices = null
    },

    roundUpTotal: (state) => {
      console.log('roundUpTotal action called, cart length:', state.cart.length)
      if (state.cart.length === 0) {
        console.log('Cart is empty, exiting')
        return
      }

      // Store original prices if not already stored
      if (!state.originalPrices) {
        state.originalPrices = {}
        state.cart.forEach((item) => {
          const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
          state.originalPrices![item.id] = price
        })
        console.log('Stored original prices:', state.originalPrices)
      }

      // Calculate current total
      const currentTotal = state.cart.reduce((total, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
        return total + price * item.quantity
      }, 0)

      console.log('Current total:', currentTotal)

      // Round up to nearest whole number
      const roundedTotal = Math.ceil(currentTotal)
      console.log('Rounded total:', roundedTotal)

      // Calculate the difference
      const difference = roundedTotal - currentTotal
      console.log('Difference:', difference)

      if (difference > 0) {
        // Add the difference to the last item's price
        const lastItem = state.cart[state.cart.length - 1]
        const lastItemPrice = typeof lastItem.price === 'string' ? parseFloat(lastItem.price) : lastItem.price
        const priceAdjustment = difference / lastItem.quantity
        console.log('Adjusting last item price by:', priceAdjustment)
        lastItem.price = lastItemPrice + priceAdjustment
      }
    },

    revertRoundUp: (state) => {
      console.log('revertRoundUp action called')
      console.log('Original prices:', state.originalPrices)
      console.log('Cart length:', state.cart.length)

      if (!state.originalPrices || state.cart.length === 0) {
        console.log('No original prices or empty cart, exiting')
        return
      }

      // Restore original prices
      state.cart.forEach((item) => {
        if (state.originalPrices![item.id] !== undefined) {
          console.log(`Restoring item ${item.id} price from ${item.price} to ${state.originalPrices![item.id]}`)
          item.price = state.originalPrices![item.id]
        }
      })

      // Clear stored original prices
      state.originalPrices = null
      console.log('Prices reverted')
    },
  },
})

export const {
  addToCart,
  updateQuantity,
  updateItemPrice,
  removeFromCart,
  clearCart,
  setCheckingOut,
  setCompleted,
  setReceiptData,
  completePayment,
  startNewSale,
  roundUpTotal,
  revertRoundUp,
} = cartSlice.actions

// Selectors
export const selectCart = (state: { cart: CartState }) => state.cart.cart
export const selectIsCheckingOut = (state: { cart: CartState }) => state.cart.isCheckingOut
export const selectIsCompleted = (state: { cart: CartState }) => state.cart.isCompleted
export const selectReceiptData = (state: { cart: CartState }) => state.cart.receiptData
export const selectCartTotal = (state: { cart: CartState }) => {
  return state.cart.cart.reduce((total, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
    return total + price * item.quantity
  }, 0)
}

export default cartSlice.reducer
