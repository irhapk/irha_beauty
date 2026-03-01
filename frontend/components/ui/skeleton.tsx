import * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-sm bg-gray-100", className)}
      {...props}
    />
  );
}

export { Skeleton };
