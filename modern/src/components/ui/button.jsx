import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "gb:inline-flex gb:items-center gb:justify-center gb:gap-2 gb:whitespace-nowrap gb:rounded-md gb:text-sm gb:font-medium gb:transition-colors gb:focus-visible:outline-none gb:focus-visible:ring-1 gb:focus-visible:ring-ring gb:disabled:pointer-events-none gb:disabled:opacity-50 gb:[&_svg]:pointer-events-none gb:[&_svg]:size-4 gb:[&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "gb:bg-primary gb:text-primary-foreground gb:shadow gb:hover:bg-primary/90",
        destructive:
          "gb:bg-destructive gb:text-destructive-foreground gb:shadow-sm gb:hover:bg-destructive/90",
        outline:
          "gb:border gb:border-input gb:bg-background gb:shadow-sm gb:hover:bg-accent gb:hover:text-accent-foreground",
        secondary:
          "gb:bg-secondary gb:text-secondary-foreground gb:shadow-sm gb:hover:bg-secondary/80",
        ghost: "gb:bg-transparent gb:hover:bg-accent gb:hover:text-accent-foreground",
        link: "gb:text-primary gb:underline-offset-4 gb:hover:underline",
      },
      size: {
        default: "gb:h-9 gb:px-4 gb:py-2",
        sm: "gb:h-8 gb:rounded-md gb:px-3 gb:text-xs",
        lg: "gb:h-10 gb:rounded-md gb:px-8",
        icon: "gb:h-9 gb:w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
