import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("gb:relative gb:overflow-hidden", className)}
    {...props}>
    <ScrollAreaPrimitive.Viewport className="gb:h-full gb:w-full gb:rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "gb:flex gb:touch-none gb:select-none gb:transition-colors",
      orientation === "vertical" &&
        "gb:h-full gb:w-2.5 gb:border-l gb:border-l-transparent gb:p-[1px]",
      orientation === "horizontal" &&
        "gb:h-2.5 gb:flex-col gb:border-t gb:border-t-transparent gb:p-[1px]",
      className
    )}
    {...props}>
    <ScrollAreaPrimitive.ScrollAreaThumb className="gb:relative gb:flex-1 gb:rounded-full gb:bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
