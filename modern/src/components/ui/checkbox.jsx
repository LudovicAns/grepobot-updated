import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "gb:grid gb:place-content-center gb:peer gb:h-4 gb:w-4 gb:shrink-0 gb:rounded-sm gb:border gb:border-primary gb:shadow gb:focus-visible:outline-none gb:focus-visible:ring-1 gb:focus-visible:ring-ring gb:disabled:cursor-not-allowed gb:disabled:opacity-50 gb:data-[state=checked]:bg-primary gb:data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}>
    <CheckboxPrimitive.Indicator className={cn("gb:grid gb:place-content-center gb:text-current")}>
      <Check className="gb:h-4 gb:w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
