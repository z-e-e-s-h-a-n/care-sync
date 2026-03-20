"use client";
import { toast } from "sonner";

import { Monitor, Smartphone, ShieldAlert, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useSession } from "@/hooks/auth";

const getDeviceIcon = (deviceType?: string) => {
  if (!deviceType) return Monitor;
  return deviceType.toLowerCase() === "mobile" ? Smartphone : Monitor;
};

const formatLastSeen = (date: string | Date | null) => {
  if (!date) return "Unknown";
  return new Date(date).toLocaleString();
};

const UserSessions = () => {
  const { sessions, isSessionsLoading, revokeSession, revokeAllSessions } =
    useSession();

  const handleRevoke = async (id: string) => {
    try {
      await revokeSession(id);
      toast.success("Session revoked");
    } catch {
      toast.error("Failed to revoke session");
    }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeAllSessions();
      toast.success("All sessions revoked");
    } catch {
      toast.error("Failed to revoke all sessions");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="size-5" />
          Active Sessions
        </CardTitle>

        <Button
          size="sm"
          variant="destructive"
          onClick={handleRevokeAll}
          disabled={!sessions?.length}
        >
          Revoke all
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {isSessionsLoading && (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}

        {!isSessionsLoading && sessions?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No active sessions found.
          </p>
        )}

        {sessions?.map((s, i) => {
          const DeviceIcon = getDeviceIcon(s.deviceType);

          return (
            <div
              key={s.id}
              className="flex items-start justify-between gap-4 p-4 rounded-lg border"
            >
              <div className="flex gap-3">
                <DeviceIcon className="size-5 text-muted-foreground mt-1" />

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {s.deviceInfo.split("·").join("-")}
                    </p>

                    {i === 0 && (
                      <Badge variant="secondary" className="text-green-700">
                        Current
                      </Badge>
                    )}

                    {s.status !== "active" && (
                      <Badge variant="destructive">Revoked</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {s.location}
                    </p>
                    <span className="text-muted-foreground">-</span>
                    {s.isTrusted && (
                      <Badge
                        variant="secondary"
                        className="bg-green-700/10 text-green-700"
                      >
                        Trusted
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    IP: {s.ip} · Last seen: {formatLastSeen(s.lastSeenAt)}
                  </p>
                </div>
              </div>

              {s.status === "active" && i !== 0 && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRevoke(s.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              )}
            </div>
          );
        })}

        <Separator />

        <p className="text-xs text-muted-foreground">
          If you don’t recognize a session, revoke it immediately and change
          your password.
        </p>
      </CardContent>
    </Card>
  );
};

export default UserSessions;
