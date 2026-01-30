import {clsx} from "clsx";

export function TypographyH4({children, className}) {
  return (
    <h4 className={clsx("gb:scroll-m-20 gb:text-xl gb:font-semibold gb:tracking-tight gb:text-foreground", className)}>
      {children}
    </h4>
  )
}
