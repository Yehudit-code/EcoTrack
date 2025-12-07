export function getProfileImage(user: any) {
  if (!user) return "/images/default-profile.png";

  // 1️⃣ תמונה שהמשתמש/חברה העלו
  if (user.photo && user.photo.trim() !== "") return user.photo;

  // 2️⃣ תמונה שהגיעה מגוגל (Google Auth)
  if (user.photoURL && user.photoURL.trim() !== "") return user.photoURL;

  // 3️⃣ דיפולט לפי תפקיד
  if (user.role === "company") {
    return "/images/default-profile-company.png";
  }

  return "/images/default-profile.png";
}
