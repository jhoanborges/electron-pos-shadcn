"use client"

import { Button } from "@/components/ui/button"
import type { CartItem } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Printer, ArrowRight } from "lucide-react"
import { NumericFormat } from 'react-number-format'

interface ReceiptProps {
    data: {
        items: CartItem[]
        total: number
        paymentMethod: string
        cashGiven?: number
        change?: number
        timestamp: string | Date
        receiptNumber: string
    }
    onNewSale: () => void
}

export function Receipt({ data, onNewSale }: ReceiptProps) {
    const formatDate = (timestamp: string | Date) => {
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
        return new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date)
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="flex flex-col h-full overflow-auto p-4 bg-gray-50">
            <Card className="w-full bg-white p-6 print:shadow-none">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">ACME Store</h1>
                    <p className="text-gray-500 text-sm">123 Main Street, Anytown</p>
                    <p className="text-gray-500 text-sm">Tel: (555) 123-4567</p>
                </div>

                <div className="mb-4 text-sm">
                    <div className="flex justify-between">
                        <span>Receipt #:</span>
                        <span>{data.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{formatDate(data.timestamp)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="capitalize">{data.paymentMethod}</span>
                    </div>
                </div>

                <div className="border-t border-b py-4 my-4">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2">Item</th>
                                <th className="text-center py-2">Qty</th>
                                <th className="text-right py-2">Price</th>
                                <th className="text-right py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item) => {
                                const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price
                                return (
                                    <tr key={item.id} className="border-b border-dashed">
                                        <td className="py-2">{item.name}</td>
                                        <td className="text-center py-2">{item.quantity}</td>
                                        <td className="text-right py-2">
                                            <NumericFormat
                                                value={itemPrice}
                                                decimalSeparator=","
                                                thousandSeparator="."
                                                decimalScale={2}
                                                fixedDecimalScale
                                                prefix="$"
                                                displayType="text"
                                            />
                                        </td>
                                        <td className="text-right py-2">
                                            <NumericFormat
                                                value={itemPrice * item.quantity}
                                                decimalSeparator=","
                                                thousandSeparator="."
                                                decimalScale={2}
                                                fixedDecimalScale
                                                prefix="$"
                                                displayType="text"
                                            />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-1 text-sm mb-6">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>
                            <NumericFormat
                                value={data.total}
                                decimalSeparator=","
                                thousandSeparator="."
                                decimalScale={2}
                                fixedDecimalScale
                                prefix="$"
                                displayType="text"
                            />
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax:</span>
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
                    <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>
                            <NumericFormat
                                value={data.total}
                                decimalSeparator=","
                                thousandSeparator="."
                                decimalScale={2}
                                fixedDecimalScale
                                prefix="$"
                                displayType="text"
                            />
                        </span>
                    </div>

                    {data.paymentMethod === "cash" && (
                        <>
                            <div className="flex justify-between pt-2">
                                <span>Cash given:</span>
                                <span>
                                    <NumericFormat
                                        value={data.cashGiven || 0}
                                        decimalSeparator=","
                                        thousandSeparator="."
                                        decimalScale={2}
                                        fixedDecimalScale
                                        prefix="$"
                                        displayType="text"
                                    />
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Change:</span>
                                <span>
                                    <NumericFormat
                                        value={data.change || 0}
                                        decimalSeparator=","
                                        thousandSeparator="."
                                        decimalScale={2}
                                        fixedDecimalScale
                                        prefix="$"
                                        displayType="text"
                                    />
                                </span>
                            </div>
                        </>
                    )}
                </div>

                <div className="text-center text-sm text-gray-500 mb-6">
                    <p>Thank you for your purchase!</p>
                    <p>Please come again</p>
                </div>

                <div className="flex flex-col gap-2 print:hidden">
                    <Button variant="outline" className="w-full" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                    <Button className="w-full" onClick={onNewSale}>
                        New Sale
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </Card>
        </div>
    )
}
