"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "gb:flex gb:h-9 gb:w-full gb:items-center gb:justify-between gb:whitespace-nowrap gb:rounded-md gb:border gb:border-input gb:bg-transparent gb:px-3 gb:py-2 gb:text-sm gb:shadow-sm gb:ring-offset-background gb:data-[placeholder]:text-muted-foreground gb:focus:outline-none gb:focus:ring-1 gb:focus:ring-ring gb:disabled:cursor-not-allowed gb:disabled:opacity-50 gb:[&>span]:line-clamp-1",
      className
    )}
    {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="gb:h-4 gb:w-4 gb:opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "gb:flex gb:cursor-default gb:items-center gb:justify-center gb:py-1",
      className
    )}
    {...props}>
    <ChevronUp className="gb:h-4 gb:w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "gb:flex gb:cursor-default gb:items-center gb:justify-center gb:py-1",
      className
    )}
    {...props}>
    <ChevronDown className="gb:h-4 gb:w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "gb:relative gb:z-[100001] gb:max-h-[--radix-select-content-available-height] gb:min-w-[8rem] gb:overflow-y-auto gb:overflow-x-hidden gb:rounded-md gb:border gb:bg-popover gb:text-popover-foreground gb:shadow-md gb:data-[state=open]:animate-in gb:data-[state=closed]:animate-out gb:data-[state=closed]:fade-out-0 gb:data-[state=open]:fade-in-0 gb:data-[state=closed]:zoom-out-95 gb:data-[state=open]:zoom-in-95 gb:data-[side=bottom]:slide-in-from-top-2 gb:data-[side=left]:slide-in-from-right-2 gb:data-[side=right]:slide-in-from-left-2 gb:data-[side=top]:slide-in-from-bottom-2 gb:origin-[--radix-select-content-transform-origin]",
        position === "popper" &&
          "gb:data-[side=bottom]:translate-y-1 gb:data-[side=left]:-translate-x-1 gb:data-[side=right]:translate-x-1 gb:data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}>
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn("gb:p-1", position === "popper" &&
          "gb:h-[var(--radix-select-trigger-height)] gb:w-full gb:min-w-[var(--radix-select-trigger-width)]")}>
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("gb:px-2 gb:py-1.5 gb:text-sm gb:font-semibold", className)}
    {...props} />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "gb:relative gb:flex gb:w-full gb:cursor-default gb:select-none gb:items-center gb:rounded-sm gb:py-1.5 gb:pl-2 gb:pr-8 gb:text-sm gb:outline-none gb:focus:bg-accent gb:focus:text-accent-foreground gb:data-[disabled]:pointer-events-none gb:data-[disabled]:opacity-50",
      className
    )}
    {...props}>
    <span
      className="gb:absolute gb:right-2 gb:flex gb:h-3.5 gb:w-3.5 gb:items-center gb:justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="gb:h-4 gb:w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("gb:-mx-1 gb:my-1 gb:h-px gb:bg-muted", className)}
    {...props} />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
