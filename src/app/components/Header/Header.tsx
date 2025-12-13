"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import NotificationMenu from "@/app/components/NotificationMenu/NotificationMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faHome,
  faChartBar,
  faDatabase,
  faInfoCircle,
  faUser,
  faShoppingCart,
  faUsers,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";

import { useUserStore } from "@/store/useUserStore";
import { getProfileImage } from "@/app/lib/getProfileImage";
import styles from "./Header.module.css";

export default function Header() {
  const user = useUserStore((s) => s.user);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  const [profilePic, setProfilePic] = useState("/images/default-profile.png");
  const [proposalsCount, setProposalsCount] = useState(0);

  // סגירה בלחיצה מחוץ
  useEffect(() => {
    if (!hasHydrated || !user) return;

    setProfilePic(getProfileImage(user));

    if (user.role === "user") {
      fetch(`/api/company-requests?userId=${user._id}`)
        .then((res) => res.json())
        .then((data) =>
          setProposalsCount(Array.isArray(data) ? data.length : 0)
        )
        .catch(() => setProposalsCount(0));
    }
  }, [user, hasHydrated]);

  if (!hasHydrated) return null;

  return (
    <header className={styles.header}>
      {/* Logo */}
      <div className={styles.logoContainer}>
        <FontAwesomeIcon icon={faLeaf} className={styles.logoIcon} />
        <span className={styles.logoText}>EcoTrack</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <Link href="/home" className={styles.navLink}>
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </Link>

        {user?.role === "user" && (
          <>
            <Link href="/user/manage-data" className={styles.navLink}>
              <FontAwesomeIcon icon={faDatabase} />
              <span>Manage Data</span>
            </Link>

            <Link href="/user/indicators" className={styles.navLink}>
              <FontAwesomeIcon icon={faChartBar} />
              <span>Analytics</span>
            </Link>

            <Link href="/user/social-sharing" className={styles.navLink}>
              <FontAwesomeIcon icon={faUser} />
              <span>Social Sharing</span>
            </Link>
          </>
        )}

        {user?.role === "company" && (
          <>
            <Link href="/company/display-users" className={styles.navLink}>
              <FontAwesomeIcon icon={faUsers} />
              <span>Display Users</span>
            </Link>

            <Link href="/contact" className={styles.navLink}>
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Contact</span>
            </Link>
          </>
        )}

        <Link href="/about" className={styles.navLink}>
          <FontAwesomeIcon icon={faInfoCircle} />
          <span>About</span>
        </Link>
      </nav>

      {/* User section */}
      <div className={styles.userSection}>
        {user?.role === "user" && proposalsCount > 0 && (
          <Link href="/proposals-inbox" className={styles.cartLink}>
            <FontAwesomeIcon icon={faShoppingCart} />
            <span className={styles.badge}>{proposalsCount}</span>
          </Link>
        )}

        {/* פרופיל */}
        <Link href="/profile" className={styles.profileLink}>
          <img src={profilePic} alt="Profile" className={styles.profileImg} />
        </Link>
      </div>
    </header>
  );
}
