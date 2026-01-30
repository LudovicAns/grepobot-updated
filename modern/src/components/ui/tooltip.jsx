import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "gb:z-50 gb:overflow-hidden gb:rounded-md gb:bg-primary gb:px-3 gb:py-1.5 gb:text-xs gb:text-primary-foreground gb:animate-in gb:fade-in-0 gb:zoom-in-95 gb:data-[state=closed]:animate-out gb:data-[state=closed]:fade-out-0 gb:data-[state=closed]:zoom-out-95 gb:data-[side=bottom]:slide-in-from-top-2 gb:data-[side=left]:slide-in-from-right-2 gb:data-[side=right]:slide-in-from-left-2 gb:data-[side=top]:slide-in-from-bottom-2 gb:origin-[--radix-tooltip-content-transform-origin]",
        className
      )}
      {...props} />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
