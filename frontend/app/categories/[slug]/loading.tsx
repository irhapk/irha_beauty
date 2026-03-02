import { Skeleton } from "@/components/ui/skeleton";

export default function Loading(): React.ReactElement {
  return (
    <div className="pt-36">
      <Skeleton className="h-64 w-full md:h-80" />
      <div className="mx-auto max-w-[1470px] px-6 py-16">
        <Skeleton className="mb-10 h-5 w-24" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="aspect-[3/4] w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
