import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface FieldSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const FieldSelect = React.forwardRef<HTMLSelectElement, FieldSelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    )
  },
)
FieldSelect.displayName = "FieldSelect"

export { FieldSelect }
