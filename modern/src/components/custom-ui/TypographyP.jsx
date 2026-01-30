import {clsx} from "clsx";

export function TypographyP({children, className}) {
  return (
    <p className={clsx("gb:leading-7 gb:[&:not(:first-child)]:mt-6 gb:text-foreground", className)}>
      {children}
    </p>
  )
}
