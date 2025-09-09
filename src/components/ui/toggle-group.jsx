import * as React from "react"
import { Button } from "@/components/ui/button"

const ToggleGroup = React.forwardRef(({ 
  className, 
  type = "single", 
  value, 
  onValueChange, 
  children, 
  ...props 
}, ref) => {
  const handleItemClick = (itemValue) => {
    if (type === "single") {
      onValueChange?.(value === itemValue ? null : itemValue)
    } else {
      // Multiple selection logic would go here if needed
      onValueChange?.(itemValue)
    }
  }

  return (
    <div
      ref={ref}
      className={`flex items-center justify-center gap-1 ${className || ''}`}
      role="group"
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isPressed: value === child.props.value,
            onPress: () => handleItemClick(child.props.value)
          })
        }
        return child
      })}
    </div>
  )
})

const ToggleGroupItem = React.forwardRef(({ 
  className, 
  children, 
  value, 
  isPressed, 
  onPress, 
  ...props 
}, ref) => (
  <Button
    ref={ref}
    variant={isPressed ? "default" : "outline"}
    size="sm"
    className={`h-9 px-3 ${isPressed ? 'bg-blue-600 text-white' : ''} ${className || ''}`}
    onClick={onPress}
    {...props}
  >
    {children}
  </Button>
))

ToggleGroup.displayName = "ToggleGroup"
ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }