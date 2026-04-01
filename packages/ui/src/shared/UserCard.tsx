import type { UserResponse } from "@workspace/contracts/user";
import UserAvatar from "./UserAvatar";

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
      <UserAvatar user={currentUser} className={avatarSize} />
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
