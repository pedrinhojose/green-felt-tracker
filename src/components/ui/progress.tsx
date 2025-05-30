
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  barClassName?: string;
  heightClassName?: string;
  widthClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, barClassName, heightClassName, widthClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      heightClassName,
      widthClassName,
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full flex-1 transition-all", barClassName)}
      style={{ 
        width: `${value || 0}%`,
        transform: 'none'  // Removendo a transformação que estava invertendo a barra
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
