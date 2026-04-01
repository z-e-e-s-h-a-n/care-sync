import { cn } from "@workspace/ui/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import type { UserResponse } from "@workspace/contracts/user";

interface UserAvatarProps {
  user: UserResponse;
  className?: string;
}

const UserAvatar = ({ className, user }: UserAvatarProps) => {
  return (
    <Avatar className={cn("size-10 rounded-lg", className)}>
      <AvatarImage src={user.avatar?.url} alt={user.displayName} />
      <AvatarFallback
        className={cn("uppercase rounded-full bg-accent", className)}
      >
        {user.firstName.charAt(0)}
        {user.lastName?.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
