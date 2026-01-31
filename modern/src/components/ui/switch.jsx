import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "gb:peer gb:inline-flex gb:h-5 gb:w-9 gb:shrink-0 gb:cursor-pointer gb:items-center gb:rounded-full gb:border-2 gb:border-transparent gb:shadow-sm gb:transition-colors gb:focus-visible:outline-none gb:focus-visible:ring-2 gb:focus-visible:ring-ring gb:focus-visible:ring-offset-2 gb:focus-visible:ring-offset-background gb:disabled:cursor-not-allowed gb:disabled:opacity-50 gb:data-[state=checked]:bg-primary gb:data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}>
    <SwitchPrimitives.Thumb
      className={cn(
        "gb:pointer-events-none gb:block gb:h-4 gb:w-4 gb:rounded-full gb:bg-background gb:shadow-lg gb:ring-0 gb:transition-transform gb:data-[state=checked]:translate-x-4 gb:data-[state=unchecked]:translate-x-0"
      )} />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
