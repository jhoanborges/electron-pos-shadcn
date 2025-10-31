"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import type { CartItem } from "@/lib/types"
import { Minus, Plus, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NumericFormat } from 'react-number-format';

interface CartProps {
    items: CartItem[]
    onUpdateQuantity: (id: number, quantity: number) => void
    onUpdatePrice: (id: number, price: number) => void
    onRemoveItem: (id: number) => void
    onClearCart: () => void
    onCheckout: () => void
    total: number
}

export function Cart({ items, onUpdateQuantity, onUpdatePrice, onRemoveItem, onClearCart, onCheckout, total }: CartProps) {
    const [editingItem, setEditingItem] = useState<CartItem | null>(null)
    const [newPrice, setNewPrice] = useState<string>("")

    const handlePriceClick = (item: CartItem) => {
        setEditingItem(item)
        const currentPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price
        setNewPrice(currentPrice.toFixed(2))
    }

    const handlePriceSave = () => {
        if (editingItem && newPrice) {
            // Remove currency symbol and convert European format to standard format
            // Input: "$12.000,50" -> Output: 12000.50
            const cleanedPrice = newPrice
                .replace('$', '')           // Remove dollar sign
                .replace(/\./g, '')         // Remove thousand separators (dots)
                .replace(',', '.')          // Replace decimal comma with dot
                .trim()

            const price = parseFloat(cleanedPrice)
            if (!isNaN(price) && price > 0) {
                onUpdatePrice(editingItem.id, price)
                setEditingItem(null)
                setNewPrice("")
            }
        }
    }

    const handlePriceCancel = () => {
        setEditingItem(null)
        setNewPrice("")
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold">Current Sale</h2>
            </div>

            <Dialog open={!!editingItem} onOpenChange={(open) => !open && handlePriceCancel()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Price</DialogTitle>
                        <DialogDescription>
                            Change the unit price for {editingItem?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="price" className="text-right font-medium">
                                Price
                            </label>

                            <NumericFormat value={newPrice} 
                            decimalSeparator="," 
                            thousandSeparator="." 
                            customInput={Input}
                            allowNegative={false}
                            allowLeadingZeros={false}
                            decimalScale={2}
                            prefix="$"
                            onChange={(e) => {
                                console.log(e.target.value)
                                setNewPrice(e.target.value)}
                            }
                            />

                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handlePriceCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handlePriceSave}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center text-gray-500">
                        <p>No items in cart</p>
                        <p className="text-sm">Add products to begin a sale</p>
                    </div>
                </div>
            ) : (
                <>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm truncate">{item.name}</h3>
                                        <p
                                            className="text-sm text-gray-500 cursor-pointer hover:text-primary hover:underline transition-colors"
                                            onClick={() => handlePriceClick(item)}
                                            title="Click to edit price"
                                        >
                                            <NumericFormat
                                                value={typeof item.price === 'string' ? parseFloat(item.price) : item.price}
                                                decimalSeparator=","
                                                thousandSeparator="."
                                                decimalScale={2}
                                                fixedDecimalScale
                                                prefix="$"
                                                displayType="text"
                                            /> each
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                            <span className="sr-only">Decrease quantity</span>
                                        </Button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                            <span className="sr-only">Increase quantity</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => onRemoveItem(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Remove item</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t bg-gray-50">
                        <div className="flex justify-between mb-2">
                            <span className="font-medium">Subtotal</span>
                            <span>
                                <NumericFormat
                                    value={total}
                                    decimalSeparator=","
                                    thousandSeparator="."
                                    decimalScale={2}
                                    fixedDecimalScale
                                    prefix="$"
                                    displayType="text"
                                />
                            </span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">Tax</span>
                            <span>
                                <NumericFormat
                                    value={0}
                                    decimalSeparator=","
                                    thousandSeparator="."
                                    decimalScale={2}
                                    fixedDecimalScale
                                    prefix="$"
                                    displayType="text"
                                />
                            </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold mb-6">
                            <span>Total</span>
                            <span>
                                <NumericFormat
                                    value={total}
                                    decimalSeparator=","
                                    thousandSeparator="."
                                    decimalScale={2}
                                    fixedDecimalScale
                                    prefix="$"
                                    displayType="text"
                                />
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" onClick={onClearCart} className="w-full">
                                Clear
                            </Button>
                            <Button onClick={onCheckout} className="w-full" disabled={items.length === 0}>
                                Checkout
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
