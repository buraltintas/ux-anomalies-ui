interface UserLike {
  name?: string | null;
  nickname?: string | null;
  email?: string | null;
  image?: string | null;
  avatarUrl?: string | null;
  provider?: "google" | "github";
}

export function getUserAvatarSrc(user: UserLike): string | undefined {
  const avatar = user.avatarUrl?.trim();
  if (avatar) return avatar;
  const image = user.image?.trim();
  if (image) return image;
  return undefined;
}

export function getUserDisplayName(user: UserLike): string {
  return user.nickname ?? user.name ?? user.email?.split("@")[0] ?? "UX Explorer";
}

export function getUserInitials(user: UserLike): string {
  const name = getUserDisplayName(user).trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? "UX").toUpperCase();
}

export function getProviderLabel(provider?: "google" | "github") {
  if (provider === "google") return "Google";
  if (provider === "github") return "GitHub";
  return null;
}
