"use client";

import { Bell, BellRing, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import {
  useNotificationActions,
  useNotifications,
} from "@workspace/ui/hooks/use-notification";

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const NotificationsPage = () => {
  const { data, isLoading, unreadCount } = useNotifications();
  const { markAsReadAsync, isPending } = useNotificationActions();

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadAsync(id);
      toast.success("Notification marked as read.");
    } catch (error: any) {
      toast.error("Failed to update notification", {
        description: error?.message,
      });
    }
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 bg-linear-to-br from-primary/10 to-card">
          <CardHeader>
            <CardDescription>Total Notifications</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {data?.length ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-amber-200 bg-linear-to-br from-amber-100/60 to-card">
          <CardHeader>
            <CardDescription>Unread</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {unreadCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-emerald-200 bg-linear-to-br from-emerald-100/60 to-card">
          <CardHeader>
            <CardDescription>Read</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {(data?.length ?? 0) - unreadCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="size-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Track security events, account updates, and important system
            messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2 rounded-xl border p-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && !data?.length && (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center">
              <Bell className="size-8 text-muted-foreground" />
              <div>
                <p className="font-medium">No notifications yet</p>
                <p className="text-sm text-muted-foreground">
                  New account activity and system alerts will appear here.
                </p>
              </div>
            </div>
          )}

          {data?.map((notification) => {
            const isUnread = !notification.readAt;

            return (
              <div
                key={notification.id}
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  isUnread && "border-primary/30 bg-primary/5",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={isUnread ? "default" : "secondary"}>
                        {isUnread ? "Unread" : "Read"}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {notification.purpose}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Received {formatDateTime(notification.createdAt)}
                    </div>
                  </div>

                  {isUnread && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <CheckCheck className="size-4" />
                      Mark as read
                    </Button>
                  )}
                </div>
                <Separator className="my-4" />
                <div className="text-xs text-muted-foreground">
                  Channels: {notification.channels.join(", ")}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
};

export default NotificationsPage;
