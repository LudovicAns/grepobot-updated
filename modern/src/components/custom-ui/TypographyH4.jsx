import {clsx} from "clsx";

export function TypographyH4({children, className}) {
  return (
    <h4 className={clsx("scroll-m-20 text-xl font-semibold tracking-tight", className)}>
      {children}
    </h4>
  )
}
