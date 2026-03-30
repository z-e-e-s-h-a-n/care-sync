import { cn } from "@workspace/ui/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import type { UserResponse } from "@workspace/contracts/user";

interface UserCardProps {
  currentUser?: UserResponse;
  isLoading?: boolean;
  variant?: "default" | "avatar";
  avatarSize?: string;
}

const UserCard = ({
  currentUser,
  isLoading,
  variant = "default",
  avatarSize,
}: UserCardProps) => {
  if (isLoading || !currentUser) {
    return <div className="size-8 rounded-lg bg-muted animate-pulse" />;
  }

  return (
    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
      <Avatar className={cn("size-8 rounded-lg", avatarSize)}>
        <AvatarImage
          src={currentUser.avatar?.url}
          alt={currentUser.displayName}
        />
        <AvatarFallback
          className={cn(
            "uppercase",
            variant === "avatar" ? "rounded-full" : "rounded-lg",
            avatarSize,
          )}
        >
          {currentUser.firstName.charAt(0)}
          {currentUser.lastName?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      {variant === "default" && (
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">
            {currentUser?.displayName}
          </span>
          <span className="text-muted-foreground truncate text-xs">
            {currentUser?.email}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserCard;
