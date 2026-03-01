import { Skeleton } from "@/components/ui/skeleton";

export default function Loading(): React.ReactElement {
  return (
    <div className="pt-20">
      <div className="mx-auto max-w-[1470px] px-6 py-16">
        <Skeleton className="mb-10 h-12 w-48" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
