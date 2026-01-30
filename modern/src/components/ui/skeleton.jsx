import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("gb:animate-pulse gb:rounded-md gb:bg-primary/10", className)}
      {...props} />
  );
}

export { Skeleton }
