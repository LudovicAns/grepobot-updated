"use client";
import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva } from "class-variance-authority";
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "gb:fixed gb:inset-0 gb:z-50 gb:bg-black/80 gb: gb:data-[state=open]:animate-in gb:data-[state=closed]:animate-out gb:data-[state=closed]:fade-out-0 gb:data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref} />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "gb:fixed gb:z-50 gb:gap-4 gb:bg-background gb:p-6 gb:shadow-lg gb:transition gb:ease-in-out gb:data-[state=closed]:duration-300 gb:data-[state=open]:duration-500 gb:data-[state=open]:animate-in gb:data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "gb:inset-x-0 gb:top-0 gb:border-b gb:data-[state=closed]:slide-out-to-top gb:data-[state=open]:slide-in-from-top",
        bottom:
          "gb:inset-x-0 gb:bottom-0 gb:border-t gb:data-[state=closed]:slide-out-to-bottom gb:data-[state=open]:slide-in-from-bottom",
        left: "gb:inset-y-0 gb:left-0 gb:h-full gb:w-3/4 gb:border-r gb:data-[state=closed]:slide-out-to-left gb:data-[state=open]:slide-in-from-left gb:sm:max-w-sm",
        right:
          "gb:inset-y-0 gb:right-0 gb:h-full gb:w-3/4 gb:border-l gb:data-[state=closed]:slide-out-to-right gb:data-[state=open]:slide-in-from-right gb:sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      <SheetPrimitive.Close
        className="gb:absolute gb:right-4 gb:top-4 gb:rounded-sm gb:opacity-70 gb:ring-offset-background gb:transition-opacity gb:hover:opacity-100 gb:focus:outline-none gb:focus:ring-2 gb:focus:ring-ring gb:focus:ring-offset-2 gb:disabled:pointer-events-none gb:data-[state=open]:bg-secondary">
        <X className="gb:h-4 gb:w-4" />
        <span className="gb:sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "gb:flex gb:flex-col gb:space-y-2 gb:text-center gb:sm:text-left",
      className
    )}
    {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "gb:flex gb:flex-col-reverse gb:sm:flex-row gb:sm:justify-end gb:sm:space-x-2",
      className
    )}
    {...props} />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("gb:text-lg gb:font-semibold gb:text-foreground", className)}
    {...props} />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("gb:text-sm gb:text-muted-foreground", className)}
    {...props} />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
