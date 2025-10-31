"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState, useCallback } from "react"
import { useDispatch } from "react-redux"
import { roundUpTotal, revertRoundUp, startNewSale } from "@/redux/slices/cartSlice"
import type { AppDispatch } from "@/redux/store"

export default function Home() {
  const [activeButton, setActiveButton] = useState<number | null>(null)
  const dispatch = useDispatch<AppDispatch>()

  const handleAction = useCallback((actionName: string, buttonIndex: number) => {
    setActiveButton(buttonIndex)

    // Reset active state after animation
    setTimeout(() => setActiveButton(null), 300)
  }, [])

  const handleRoundUp = useCallback(() => {
    console.log('Round up triggered')
    dispatch(roundUpTotal())
    handleAction("Redondear", 1)
  }, [dispatch, handleAction])

  const handleRevertRoundUp = useCallback(() => {
    console.log('Revert round up triggered')
    dispatch(revertRoundUp())
    handleAction("No Redondear", 2)
  }, [dispatch, handleAction])

  const handleNewSale = useCallback(() => {
    console.log('Nueva venta triggered')
    dispatch(startNewSale())
    handleAction("Nueva Venta", 3)
  }, [dispatch, handleAction])

  const buttonActions = [
    { label: "Redondear", key: "F7", action: handleRoundUp },
    { label: "No Redondear", key: "F8", action: handleRevertRoundUp },
    { label: "Nueva Venta", key: "F9", action: handleNewSale },
    { label: "Imprimir", key: "F10", action: () => handleAction("Imprimir", 4) },
    { label: "Exportar", key: "F11", action: () => handleAction("Exportar", 5) },
    { label: "Enviar", key: "F12", action: () => handleAction("Enviar", 6) },
  ]

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F7') {
        event.preventDefault()
        handleRoundUp()
      } else if (event.key === 'F8') {
        event.preventDefault()
        handleRevertRoundUp()
      } else if (event.key === 'F9') {
        event.preventDefault()
        handleNewSale()
      } else if (event.key === 'F10') {
        event.preventDefault()
        handleAction("Imprimir", 4)
      } else if (event.key === 'F11') {
        event.preventDefault()
        handleAction("Exportar", 5)
      } else if (event.key === 'F12') {
        event.preventDefault()
        handleAction("Enviar", 6)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleRoundUp, handleRevertRoundUp, handleNewSale, handleAction])

  return (
        <div className="flex justify-center gap-4 overflow-x-auto py-2">
          {buttonActions.map((button, index) => (
            <Button
              key={index}
              onClick={button.action}
              size="lg"
              className={`h-20 min-w-[180px] text-xl font-semibold flex flex-col gap-3 transition-all duration-200 ${
                activeButton === index + 1 ? "scale-95 bg-primary/90" : "hover:scale-105"
              }`}
            >
              <span>{button.label}</span>
              <span className="text-sm font-normal opacity-70 bg-background/20 px-3 py-1 rounded">{button.key}</span>
            </Button>
          ))}
        </div>
  )
}
