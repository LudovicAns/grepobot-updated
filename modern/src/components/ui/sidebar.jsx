import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "200px"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

const SidebarContext = React.createContext(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef((
  {
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
  },
  ref
) => {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback((value) => {
    const openState = typeof value === "function" ? value(open) : value
    if (setOpenProp) {
      setOpenProp(openState)
    } else {
      _setOpen(openState)
    }

    // This sets the cookie to keep the sidebar state.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  }, [setOpenProp, open])

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile
      ? setOpenMobile((open) => !open)
      : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo(() => ({
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar,
  }), [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar])

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style
            }
          }
          className={cn(
            "gb:group/sidebar-wrapper gb:flex gb:min-h-0 gb:h-full gb:w-full gb:has-[[data-variant=inset]]:bg-sidebar",
            className
          )}
          ref={ref}
          {...props}>
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
})
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef((
  {
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    className,
    children,
    ...props
  },
  ref
) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        className={cn(
          "gb:flex gb:h-full gb:w-[200px] gb:flex-col gb:bg-sidebar gb:text-sidebar-foreground",
          className
        )}
        ref={ref}
        {...props}>
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-mobile="true"
          className="gb:w-[200px] gb:bg-sidebar gb:p-0 gb:text-sidebar-foreground gb:[&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE
            }
          }
          side={side}>
          <SheetHeader className="gb:sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="gb:flex gb:h-full gb:w-full gb:flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      ref={ref}
      className="gb:group gb:peer gb:flex-none gb:text-sidebar-foreground gb:relative"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}>
      {/* This is what handles the sidebar gap on desktop */}
      <div
        className={cn(
          "gb:relative gb:w-[200px] gb:bg-transparent gb:transition-[width] gb:duration-200 gb:ease-linear",
          "gb:group-data-[collapsible=offcanvas]:w-0",
          "gb:group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "gb:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
            : "gb:group-data-[collapsible=icon]:w-[48px]"
        )} />
      <div
        className={cn(
          "gb:absolute gb:inset-y-0 gb:z-10 gb:flex gb:h-full gb:w-[200px] gb:transition-[left,right,width] gb:duration-200 gb:ease-linear",
          side === "left"
            ? "gb:left-0 gb:group-data-[collapsible=offcanvas]:left-[-200px]"
            : "gb:right-0 gb:group-data-[collapsible=offcanvas]:right-[-200px]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "gb:p-2 gb:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
            : "gb:group-data-[collapsible=icon]:w-[48px] gb:group-data-[side=left]:border-r gb:group-data-[side=right]:border-l",
          className
        )}
        {...props}>
        <div
          data-sidebar="sidebar"
          className="gb:flex gb:h-full gb:w-full gb:flex-col gb:bg-sidebar gb:group-data-[variant=floating]:rounded-lg gb:group-data-[variant=floating]:border gb:group-data-[variant=floating]:border-sidebar-border gb:group-data-[variant=floating]:shadow">
          {children}
        </div>
      </div>
    </div>
  );
})
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("gb:h-7 gb:w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}>
      <PanelLeft />
      <span className="gb:sr-only">Toggle Sidebar</span>
    </Button>
  );
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "gb:absolute gb:inset-y-0 gb:z-20 gb:hidden gb:w-4 gb:-translate-x-1/2 gb:transition-all gb:ease-linear gb:after:absolute gb:after:inset-y-0 gb:after:left-1/2 gb:after:w-[2px] gb:hover:after:bg-sidebar-border gb:group-data-[side=left]:-right-4 gb:group-data-[side=right]:left-0 gb:sm:flex",
        "gb:[[data-side=left]_&]:cursor-w-resize gb:[[data-side=right]_&]:cursor-e-resize",
        "gb:[[data-side=left][data-state=collapsed]_&]:cursor-e-resize gb:[[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "gb:group-data-[collapsible=offcanvas]:translate-x-0 gb:group-data-[collapsible=offcanvas]:after:left-full gb:group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "gb:[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "gb:[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props} />
  );
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "gb:relative gb:flex gb:w-full gb:flex-1 gb:flex-col gb:bg-background",
        "gb:md:peer-data-[variant=inset]:m-2 gb:md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 gb:md:peer-data-[variant=inset]:ml-0 gb:md:peer-data-[variant=inset]:rounded-xl gb:md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props} />
  );
})
SidebarInset.displayName = "SidebarInset"

const SidebarInput = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "gb:h-8 gb:w-full gb:bg-background gb:shadow-none gb:focus-visible:ring-2 gb:focus-visible:ring-sidebar-ring",
        className
      )}
      {...props} />
  );
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("gb:flex gb:flex-col gb:gap-2 gb:p-2", className)}
      {...props} />
  );
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("gb:flex gb:flex-col gb:gap-2 gb:p-2", className)}
      {...props} />
  );
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("gb:mx-2 gb:w-auto gb:bg-sidebar-border", className)}
      {...props} />
  );
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "gb:flex gb:min-h-0 gb:flex-1 gb:flex-col gb:gap-2 gb:overflow-auto gb:group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props} />
  );
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("gb:relative gb:flex gb:w-full gb:min-w-0 gb:flex-col gb:p-2", className)}
      {...props} />
  );
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "gb:flex gb:h-8 gb:shrink-0 gb:items-center gb:rounded-md gb:px-2 gb:text-xs gb:font-medium gb:text-sidebar-foreground/70 gb:outline-none gb:ring-sidebar-ring gb:transition-[margin,opacity] gb:duration-200 gb:ease-linear gb:focus-visible:ring-2 gb:[&>svg]:size-4 gb:[&>svg]:shrink-0",
        "gb:group-data-[collapsible=icon]:-mt-8 gb:group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props} />
  );
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "gb:absolute gb:right-3 gb:top-3.5 gb:flex gb:aspect-square gb:w-5 gb:items-center gb:justify-center gb:rounded-md gb:p-0 gb:text-sidebar-foreground gb:outline-none gb:ring-sidebar-ring gb:transition-transform gb:hover:bg-sidebar-accent gb:hover:text-sidebar-accent-foreground gb:focus-visible:ring-2 gb:[&>svg]:size-4 gb:[&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "gb:after:absolute gb:after:-inset-2 gb:after:md:hidden",
        "gb:group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props} />
  );
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("gb:w-full gb:text-sm", className)}
    {...props} />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("gb:flex gb:w-full gb:min-w-0 gb:flex-col gb:gap-1", className)}
    {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("gb:group/menu-item gb:relative", className)}
    {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "gb:peer/menu-button gb:flex gb:w-full gb:items-center gb:gap-2 gb:overflow-hidden gb:rounded-md gb:p-2 gb:text-left gb:text-sm gb:outline-none gb:ring-sidebar-ring gb:transition-[width,height,padding] gb:bg-transparent gb:hover:bg-sidebar-accent gb:hover:text-sidebar-accent-foreground gb:focus-visible:ring-2 gb:active:bg-sidebar-accent gb:active:text-sidebar-accent-foreground gb:disabled:pointer-events-none gb:disabled:opacity-50 gb:group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 gb:aria-disabled:pointer-events-none gb:aria-disabled:opacity-50 gb:data-[active=true]:bg-sidebar-accent gb:data-[active=true]:font-medium gb:data-[active=true]:text-sidebar-accent-foreground gb:data-[state=open]:hover:bg-sidebar-accent gb:data-[state=open]:hover:text-sidebar-accent-foreground gb:group-data-[collapsible=icon]:!size-8 gb:group-data-[collapsible=icon]:!p-2 gb:[&>span:last-child]:truncate gb:[&>svg]:size-4 gb:[&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "gb:bg-transparent gb:hover:bg-sidebar-accent gb:hover:text-sidebar-accent-foreground",
        outline:
          "gb:bg-background gb:shadow-[0_0_0_1px_hsl(var(--sidebar-border))] gb:hover:bg-sidebar-accent gb:hover:text-sidebar-accent-foreground gb:hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "gb:h-8 gb:text-sm",
        sm: "gb:h-7 gb:text-xs",
        lg: "gb:h-12 gb:text-sm gb:group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef((
  {
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
  },
  ref
) => {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props} />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip} />
    </Tooltip>
  );
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "gb:absolute gb:right-1 gb:top-1.5 gb:flex gb:aspect-square gb:w-5 gb:items-center gb:justify-center gb:rounded-md gb:p-0 gb:text-sidebar-foreground gb:outline-none gb:ring-sidebar-ring gb:transition-transform gb:hover:bg-sidebar-accent gb:hover:text-sidebar-accent-foreground gb:focus-visible:ring-2 gb:peer-hover/menu-button:text-sidebar-accent-foreground gb:[&>svg]:size-4 gb:[&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "gb:after:absolute gb:after:-inset-2 gb:after:md:hidden",
        "gb:peer-data-[size=sm]/menu-button:top-1",
        "gb:peer-data-[size=default]/menu-button:top-1.5",
        "gb:peer-data-[size=lg]/menu-button:top-2.5",
        "gb:group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "gb:group-focus-within/menu-item:opacity-100 gb:group-hover/menu-item:opacity-100 gb:data-[state=open]:opacity-100 gb:peer-data-[active=true]/menu-button:text-sidebar-accent-foreground gb:md:opacity-0",
        className
      )}
      {...props} />
  );
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "gb:pointer-events-none gb:absolute gb:right-1 gb:flex gb:h-5 gb:min-w-5 gb:select-none gb:items-center gb:justify-center gb:rounded-md gb:px-1 gb:text-xs gb:font-medium gb:tabular-nums gb:text-sidebar-foreground",
      "gb:peer-hover/menu-button:text-sidebar-accent-foreground gb:peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      "gb:peer-data-[size=sm]/menu-button:top-1",
      "gb:peer-data-[size=default]/menu-button:top-1.5",
      "gb:peer-data-[size=lg]/menu-button:top-2.5",
      "gb:group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props} />
))
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeleton = React.forwardRef(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("gb:flex gb:h-8 gb:items-center gb:gap-2 gb:rounded-md gb:px-2", className)}
      {...props}>
      {showIcon && (
        <Skeleton className="gb:size-4 gb:rounded-md" data-sidebar="menu-skeleton-icon" />
      )}
      <Skeleton
        className="gb:h-4 gb:max-w-[--skeleton-width] gb:flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width
          }
        } />
    </div>
  );
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

const SidebarMenuSub = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "gb:mx-3.5 gb:flex gb:min-w-0 gb:translate-x-px gb:flex-col gb:gap-1 gb:border-l gb:border-sidebar-border gb:px-2.5 gb:py-0.5",
      "gb:group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props} />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef(({ ...props }, ref) => <li ref={ref} {...props} />)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef(
  ({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a"

    return (
      <Comp
        ref={ref}
        data-sidebar="menu-sub-button"
        data-size={size}
        data-active={isActive}
        className={cn(
          "gb:flex gb:h-7 gb:min-w-0 gb:-translate-x-px gb:items-center gb:gap-2 gb:overflow-hidden gb:rounded-md gb:px-2 gb:text-sidebar-foreground gb:outline-none gb:ring-sidebar-ring gb:hover:bg-sidebar-accent gb:hover:text-sidebar-accent-foreground gb:focus-visible:ring-2 gb:active:bg-sidebar-accent gb:active:text-sidebar-accent-foreground gb:disabled:pointer-events-none gb:disabled:opacity-50 gb:aria-disabled:pointer-events-none gb:aria-disabled:opacity-50 gb:[&>span:last-child]:truncate gb:[&>svg]:size-4 gb:[&>svg]:shrink-0 gb:[&>svg]:text-sidebar-accent-foreground",
          "gb:data-[active=true]:bg-sidebar-accent gb:data-[active=true]:text-sidebar-accent-foreground",
          size === "sm" && "gb:text-xs",
          size === "md" && "gb:text-sm",
          "gb:group-data-[collapsible=icon]:hidden",
          className
        )}
        {...props} />
    );
  }
)
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
