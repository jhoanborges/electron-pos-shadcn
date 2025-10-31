"use client"

import { useDispatch, useSelector } from "react-redux"
import { ProductGrid } from "./product-grid"
import { Cart } from "./cart"
import { Checkout } from "./checkout"
import { Receipt } from "./receipt"
import { useProducts } from "@/lib/swr/useProducts"
import type { Product } from "@/lib/types"
import {
    addToCart as addToCartAction,
    updateQuantity as updateQuantityAction,
    updateItemPrice as updateItemPriceAction,
    removeFromCart as removeFromCartAction,
    clearCart as clearCartAction,
    setCheckingOut,
    completePayment,
    startNewSale as startNewSaleAction,
    selectCart,
    selectCartTotal,
    selectIsCheckingOut,
    selectIsCompleted,
    selectReceiptData,
} from "@/redux/slices/cartSlice"
import type { AppDispatch } from "@/redux/store"

export default function PosSystem() {
    const { products, isLoading, isError } = useProducts()
    const dispatch = useDispatch<AppDispatch>()

    // Get state from Redux
    const cart = useSelector(selectCart)
    const total = useSelector(selectCartTotal)
    const isCheckingOut = useSelector(selectIsCheckingOut)
    const isCompleted = useSelector(selectIsCompleted)
    const receiptData = useSelector(selectReceiptData)

    // Action handlers
    const addToCart = (product: Product) => {
        dispatch(addToCartAction(product))
    }

    const updateQuantity = (id: number, quantity: number) => {
        dispatch(updateQuantityAction({ id, quantity }))
    }

    const updatePrice = (id: number, price: number) => {
        dispatch(updateItemPriceAction({ id, price }))
    }

    const removeFromCart = (id: number) => {
        dispatch(removeFromCartAction(id))
    }

    const clearCart = () => {
        dispatch(clearCartAction())
    }

    const handleCheckout = () => {
        dispatch(setCheckingOut(true))
    }

    const handlePaymentComplete = (paymentDetails: {
        method: string
        cashGiven?: number
        change?: number
    }) => {
        dispatch(completePayment(paymentDetails))
    }

    const startNewSale = () => {
        dispatch(startNewSaleAction())
    }

    return (
        <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-2/3 p-4 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-red-500 text-center">
                            <p className="text-xl font-bold">Error loading products</p>
                            <p>Please try refreshing the page</p>
                        </div>
                    </div>
                ) : (
                    <ProductGrid products={products || []} onAddToCart={addToCart} />
                )}
            </div>
            <div className="w-full md:w-1/3 bg-white border-l border-gray-200 md:sticky md:top-0 md:h-screen md:overflow-auto">
                {isCompleted && receiptData ? (
                    <Receipt data={receiptData} onNewSale={startNewSale} />
                ) : isCheckingOut ? (
                    <Checkout
                        total={total}
                        items={cart}
                        onCancel={() => dispatch(setCheckingOut(false))}
                        onPaymentComplete={handlePaymentComplete}
                    />
                ) : (
                    <Cart
                        items={cart}
                        onUpdateQuantity={updateQuantity}
                        onUpdatePrice={updatePrice}
                        onRemoveItem={removeFromCart}
                        onClearCart={clearCart}
                        onCheckout={handleCheckout}
                        total={total}
                    />
                )}
            </div>
        </div>
    )
}
