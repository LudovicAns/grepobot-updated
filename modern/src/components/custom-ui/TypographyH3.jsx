import {clsx} from "clsx";

export function TypographyH3({children, className}) {
  return (
    <h3 className={clsx("gb:scroll-m-20 gb:text-2xl gb:font-semibold gb:tracking-tight gb:text-foreground", className)}>
      {children}
    </h3>
  )
}
