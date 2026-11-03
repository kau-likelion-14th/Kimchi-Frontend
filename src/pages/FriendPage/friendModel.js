export function toFriendModel(user) {
  if (user?.userId == null) {
    throw new Error("사용자 ID가 없습니다.");
  }

  const [name, tag = ""] = (user.userName || "").split("#");

  return {
    id: String(user.userId),
    userId: user.userId,
    name: name || "이름 없음",
    tag,
    bio: user.introduction || "",
    profileImageUrl: user.profileImageUrl || null,
  };
}
