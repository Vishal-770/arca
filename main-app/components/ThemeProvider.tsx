"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { usePathname } from "next/navigation"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname()
  
  return (
    <NextThemesProvider 
      {...props} 
      forcedTheme={pathname === "/" ? "dark" : undefined}
    >
      {children}
    </NextThemesProvider>
  )
}