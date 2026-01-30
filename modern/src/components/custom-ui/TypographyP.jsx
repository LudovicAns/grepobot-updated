import {clsx} from "clsx";

export function TypographyP({children, className}) {
  return (
    <p className={clsx("leading-7 [&:not(:first-child)]:mt-6", className)}>
      {children}
    </p>
  )
}
