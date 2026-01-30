import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef((
  { className, orientation = "horizontal", decorative = true, ...props },
  ref
) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "gb:shrink-0 gb:bg-border",
      orientation === "horizontal" ? "gb:h-[1px] gb:w-full" : "gb:h-full gb:w-[1px]",
      className
    )}
    {...props} />
))
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
