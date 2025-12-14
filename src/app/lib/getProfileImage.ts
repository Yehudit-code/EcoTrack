export function getProfileImage(user: any) {
  if (!user) return "/images/default-profile.png";

  if (user.photo && user.photo.trim() !== "") return user.photo;

  if (user.photoURL && user.photoURL.trim() !== "") return user.photoURL;

  if (user.role === "company") {
    return "/images/default-profile-company.png";
  }

  return "/images/default-profile.png";
}
