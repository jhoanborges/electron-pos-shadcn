"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CreditCard, Banknote } from "lucide-react"
import axiosInstance from "@/lib/axios"
import type { CartItem } from "@/lib/types"

interface CheckoutProps {
    total: number
    items: CartItem[]
    onCancel: () => void
    onPaymentComplete: (details: {
        method: string
        cashGiven?: number
        change?: number
    }) => void
}

export function Checkout({ total, items, onCancel, onPaymentComplete }: CheckoutProps) {
    const [paymentMethod, setPaymentMethod] = useState<string>("card")
    const [cashAmount, setCashAmount] = useState<string>("")
    const [isProcessing, setIsProcessing] = useState(false)

    const handleCardPayment = () => {
        setIsProcessing(true)

        // Transform cart items to the required format
        const orderItems = items.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
        }))

        // Send order to backend
        axiosInstance.post("/api/mercadopago/orders", {
            items: orderItems
        })
        .then((response) => {
            setIsProcessing(false)
            console.log("Card payment processed successfully", response)
            onPaymentComplete({ method: "card" })
        })
        .catch((error) => {
            setIsProcessing(false)
            console.error("Error processing card payment:", error)

            // Handle MercadoPago API errors
            if (error.response?.data) {
                const errorData = error.response.data

                // Check if it's a MercadoPago error response
                if (errorData.error?.errors && Array.isArray(errorData.error.errors)) {
                    const mpErrors = errorData.error.errors
                    const errorMessages = mpErrors.map((err: any) => err.message).join(', ')
                    alert(`MercadoPago Error: ${errorMessages}`)
                } else if (errorData.message) {
                    alert(`Error: ${errorData.message}`)
                } else {
                    alert("Error processing payment. Please try again.")
                }
            } else if (error.message) {
                alert(`Error: ${error.message}`)
            } else {
                alert("Error processing payment. Please try again.")
            }
        })
    }

    const handleCashPayment = () => {
        const cashGiven = Number.parseFloat(cashAmount)
        if (isNaN(cashGiven) || cashGiven < total) return

        setIsProcessing(true)

        // Transform cart items to the required format
        const orderItems = items.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
        }))

        const change = cashGiven - total

        // Send order to backend
        axiosInstance.post("/api/orders", {
            items: orderItems
        })
        .then((response) => {
            setIsProcessing(false)
            console.log("Cash payment processed successfully", response)
            onPaymentComplete({
                method: "cash",
                cashGiven,
                change,
            })
        })
        .catch((error) => {
            setIsProcessing(false)
            console.error("Error processing cash payment:", error)

            // Handle API errors
            if (error.response?.data) {
                const errorData = error.response.data

                if (errorData.message) {
                    alert(`Error: ${errorData.message}`)
                } else {
                    alert("Error processing payment. Please try again.")
                }
            } else if (error.message) {
                alert(`Error: ${error.message}`)
            } else {
                alert("Error processing payment. Please try again.")
            }
        })
    }

    const calculateChange = () => {
        const cashGiven = Number.parseFloat(cashAmount)
        if (isNaN(cashGiven) || cashGiven < total) return 0
        return cashGiven - total
    }

    return (
        <div className="flex flex-col h-full bg-[#f5f5f5]">
            <div className="p-4 border-b flex items-center bg-[#f5f5f5]">
                <Button variant="ghost" size="icon" onClick={onCancel} className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Go back</span>
                </Button>
                <h2 className="text-xl font-bold">Checkout</h2>
            </div>

            <div className="flex-1 p-4 overflow-auto bg-[#f5f5f5]">
                <Card className="bg-[#f5f5f5] border-none shadow-none">
                    <CardHeader>
                        <CardTitle>Payment</CardTitle>
                        <CardDescription>Total amount: ${total.toFixed(2)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="card" value={paymentMethod} onValueChange={setPaymentMethod}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="card">
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Card
                                </TabsTrigger>
                                <TabsTrigger value="cash">
                                    <Banknote className="h-4 w-4 mr-2" />
                                    Cash
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="card" className="space-y-4 mt-4">
                                <div className="space-y-4">
                                    {/* Video Section */}
                                    <div className="flex justify-center">
                                        <video
                                            className="w-[400px] h-[400px] rounded-lg"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                        >
                                            <source src="/mp.mp4" type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="font-semibold text-base mb-2">Acepta todas las formas de pago</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            ¡Ofrece a tus clientes pagar en hasta 24 meses sin intereses!
                                        </p>
                                    </div>

                                    {/* Credit/Debit Cards */}
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-3 justify-center items-center">
                                            <img
                                                src="https://http2.mlstatic.com/storage/pog-cm-admin/calm-assets/banks@3x--7c4a80af.png"
                                                alt="Visa"
                                                className="h-8 object-contain"
                                            />
                                            <img
                                                src="https://http2.mlstatic.com/storage/pog-cm-admin/calm-assets/master@3x--bee5331f.png"
                                                alt="MasterCard"
                                                className="h-8 object-contain"
                                            />
                                            <img
                                                src="https://http2.mlstatic.com/storage/pog-cm-admin/calm-assets/american-express@3x--7ea56824.png"
                                                alt="American Express"
                                                className="h-8 object-contain"
                                            />
                                        </div>
                                    </div>

                                    {/* Digital Wallets */}
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-3 justify-center items-center">
                                            <img
                                                src="https://http2.mlstatic.com/storage/pog-cm-admin/calm-assets/apple-pay@3x--d8942f63.png"
                                                alt="Apple Pay"
                                                className="h-8 object-contain"
                                            />
                                            <img
                                                src="https://http2.mlstatic.com/storage/pog-cm-admin/calm-assets/banks@3x--9746f8ce.png"
                                                alt="Google Pay"
                                                className="h-8 object-contain"
                                            />
                                            <img
                                                src="https://http2.mlstatic.com/storage/pog-cm-admin/calm-assets/samsung-pay@3x--0bc8348e.png"
                                                alt="Samsung Pay"
                                                className="h-8 object-contain"
                                            />
                                        </div>
                                    </div>

                                    {/* Vales */}
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-500 text-center font-medium">
                                            Vales de despensa y restaurante
                                        </p>
                                        <div className="flex flex-wrap gap-2 justify-center items-center">
                                            <img
                                                src="https://http2.mlstatic.com/storage/pog-cm-admin/calm-assets/carnet@3x--805b1507.png"
                                                alt="Carnet"
                                                className="h-6 object-contain"
                                            />
                                            <img
                                                src="https://http2.mlstatic.com/storage/pog-cm-admin/calm-assets/upsivale@3x--8abafccc.png"
                                                alt="Upsí Vale"
                                                className="h-6 object-contain"
                                            />
                                            <img
                                                src="https://http2.mlstatic.com/storage/pog-cm-admin/calm-assets/toka@3x--8d348240.png"
                                                alt="Toka"
                                                className="h-6 object-contain"
                                            />
                                            <img
                                                src="https://http2.mlstatic.com/storage/pog-cm-admin/calm-assets/tengo@3x--8bb0543c.png"
                                                alt="Tengo!"
                                                className="h-6 object-contain"
                                            />
                                            <img
                                                src="https://http2.mlstatic.com/storage/pog-cm-admin/calm-assets/edenred@3x--76f56294.png"
                                                alt="Edenred"
                                                className="h-6 object-contain"
                                            />
                                            <img
                                                src="https://http2.mlstatic.com/storage/pog-cm-admin/calm-assets/pluxee@3x--67d4e210.png"
                                                alt="Pluxee"
                                                className="h-6 object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="cash" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cash-amount">Cash received</Label>
                                    <Input
                                        id="cash-amount"
                                        type="number"
                                        min={total}
                                        step="0.01"
                                        placeholder="Enter amount"
                                        value={cashAmount}
                                        onChange={(e) => setCashAmount(e.target.value)}
                                    />
                                </div>
                                {Number.parseFloat(cashAmount) >= total && (
                                    <div className="p-3 bg-green-50 text-green-700 rounded-md">
                                        <p className="font-medium">Change: ${calculateChange().toFixed(2)}</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter>
                        {paymentMethod === "card" ? (
                            <Button className="w-full" onClick={handleCardPayment} disabled={isProcessing}>
                                {isProcessing ? "Processing..." : "Process Payment"}
                            </Button>
                        ) : (
                            <Button
                                className="w-full"
                                onClick={handleCashPayment}
                                disabled={!cashAmount || isNaN(Number.parseFloat(cashAmount)) || Number.parseFloat(cashAmount) < total}
                            >
                                Complete Cash Payment
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
