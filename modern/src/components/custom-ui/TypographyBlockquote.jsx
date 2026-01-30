import {clsx} from "clsx";
export function TypographyBlockquote({children, className}) {
  return (
    <blockquote className={clsx("gb:mt-6 gb:border-l-2 gb:pl-6 gb:italic gb:text-foreground", className)}>
      {children}
    </blockquote>
  )
}
