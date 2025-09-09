import * as React from "react"

import { cn } from "@/lib/utils"

// Simplified drawer implementation without external dependencies
const Drawer = ({ open, onOpenChange, children, ...props }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative w-full max-w-full">
        {children}
      </div>
    </div>
  )
}

const DrawerContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background max-h-[95vh]",
      className
    )}
    {...props}
  >
    <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
    {children}
  </div>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)

const DrawerFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)

const DrawerTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))

const DrawerDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))

const DrawerClose = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={className}
    {...props}
  >
    {children}
  </button>
))

export {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
}