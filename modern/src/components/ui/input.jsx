import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "gb:flex gb:h-9 gb:w-full gb:rounded-md gb:border gb:border-input gb:bg-transparent gb:px-3 gb:py-1 gb:text-base gb:shadow-sm gb:transition-colors gb:file:border-0 gb:file:bg-transparent gb:file:text-sm gb:file:font-medium gb:file:text-foreground gb:placeholder:text-muted-foreground gb:focus-visible:outline-none gb:focus-visible:ring-1 gb:focus-visible:ring-ring gb:disabled:cursor-not-allowed gb:disabled:opacity-50 gb:md:text-sm",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
