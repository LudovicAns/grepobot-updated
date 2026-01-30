import {clsx} from "clsx";

export function TypographyH1({children, className}) {
  return (
    <h1 className={clsx("gb:scroll-m-20 gb:text-center gb:text-4xl gb:font-extrabold gb:tracking-tight gb:text-balance gb:text-foreground", className)}>
      {children}
    </h1>
  )
}