import { User } from "firebase/auth";

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({ user, size = "md", className = "" }: UserAvatarProps) {
  const displayName = user.displayName || user.email || "U";
  const initial = displayName.charAt(0).toUpperCase();

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-accent text-accent-foreground font-medium ${sizeClasses[size]} ${className}`}
      title={displayName}
    >
      {initial}
    </div>
  );
}