"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faHome,
  faChartBar,
  faDatabase,
  faInfoCircle,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import { getProfileImage } from "@/app/lib/getProfileImage";

import styles from "./Header.module.css";

export default function Header() {
  const [profilePic, setProfilePic] = useState<string>("/images/default-profile.png");

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      const parsed = JSON.parse(userData);
      const pic = getProfileImage(parsed);
      setProfilePic(pic);
    }
  }, []);

  return (
    <header className={styles.header}>
      {/* לוגו */}
      <div className={styles.logoContainer}>
        <FontAwesomeIcon icon={faLeaf} className={styles.logoIcon} />
        <span className={styles.logoText}>EcoTrack</span>
      </div>

      {/* ניווט */}
      <nav className={styles.nav}>
        <Link href="/home" className={styles.navLink}>
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </Link>
        <Link href="/manage-data" className={styles.navLink}>
          <FontAwesomeIcon icon={faDatabase} />
          <span>Manage Data</span>
        </Link>
        <Link href="/indicators" className={styles.navLink}>
          <FontAwesomeIcon icon={faChartBar} />
          <span>Analytics</span>
        </Link>
        <Link href="/social-sharing" className={styles.navLink}>
          <FontAwesomeIcon icon={faUser} />
          <span>Social Sharing</span>
        </Link>
        <Link href="/about" className={styles.navLink}>
          <FontAwesomeIcon icon={faInfoCircle} />
          <span>About</span>
        </Link>
      </nav>

      <div className={styles.userSection}>
        <Link href="/profile" className={styles.profileLink}>
          <div className={styles.profileContainer}>
            <img
              src={profilePic}
              alt="User Profile"
              className={styles.profileImg}
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
