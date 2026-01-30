import {clsx} from "clsx";

export function TypographyH2({children, className}) {
  return (
    <h2 className={clsx("gb:scroll-m-20 gb:border-b gb:pb-2 gb:text-3xl gb:font-semibold gb:tracking-tight gb:first:mt-0 gb:text-foreground", className)}>
      {children}
    </h2>
  )
}
