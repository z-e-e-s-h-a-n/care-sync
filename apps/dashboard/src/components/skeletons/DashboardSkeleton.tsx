import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";

const DashboardSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col animate-pulse">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Dashboard Cards Skeleton */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="@container/card">
                <CardHeader>
                  <CardDescription>
                    <Skeleton className="h-4 w-24" />
                  </CardDescription>
                  <CardTitle>
                    <Skeleton className="h-8 w-16 @[250px]/card:h-10" />
                  </CardTitle>
                  <div className="mt-2">
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart Area Skeleton */}
          <div className="px-4 lg:px-6">
            <Card className="@container/card">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-48" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-64 hidden @[540px]/card:block" />
                  <Skeleton className="h-4 w-32 @[540px]/card:hidden" />
                </CardDescription>
                <div className="mt-2">
                  <Skeleton className="h-10 w-40 hidden @[767px]/card:block" />
                  <Skeleton className="h-10 w-40 @[767px]/card:hidden" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-62.5 w-full rounded-md" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Posts & Content Overview Skeleton */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 lg:grid-cols-2 overflow-hidden">
            {/* Recent Posts Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-32" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-48" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Overview Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-64" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Tabs Skeleton */}
                  <Skeleton className="h-10 w-full rounded-md" />

                  {/* Categories Tab Content Skeleton */}
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                          <Skeleton className="h-2 w-full rounded-lg" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
