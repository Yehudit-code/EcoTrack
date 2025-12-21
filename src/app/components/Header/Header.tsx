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
} from "@fortawesome/free-solid-svg-icons";

import { useUserStore } from "@/store/useUserStore";
import { getProfileImage } from "@/app/lib/getProfileImage";

import styles from "./Header.module.css";

export default function Header() {
  const user = useUserStore((s) => s.user);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  const [profilePic, setProfilePic] = useState("/images/default-profile.png");
  const [proposalsCount, setProposalsCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!hasHydrated || !user) return;
    setProfilePic(getProfileImage(user));
  }, [user, hasHydrated]);

  useEffect(() => {
  if (!hasHydrated || !user?._id) return;

  fetch(`/api/company-requests?userId=${user._id}`)
    .then((res) => res.json())
    .then((data) => {
      const pending = Array.isArray(data)
        ? data.filter((req: any) => req.status !== "paid")
        : [];

      setProposalsCount(pending.length);
    })
    .catch(() => setProposalsCount(0));
}, [hasHydrated, user?._id]);

  if (!hasHydrated) return null;

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <FontAwesomeIcon icon={faLeaf} className={styles.logoIcon} />
        <span className={styles.logoText}>EcoTrack</span>
      </div>

      <nav className={styles.nav}>
        <Link href="/home" className={styles.navLink}>
          <FontAwesomeIcon icon={faHome} className={styles.navIcon} />
          <span className={styles.navText}>Home</span>
        </Link>

        <Link href="/user/manage-data" className={styles.navLink}>
          <FontAwesomeIcon icon={faDatabase} className={styles.navIcon} />
          <span className={styles.navText}>Manage Data</span>
        </Link>

        <Link href="/user/indicators" className={styles.navLink}>
          <FontAwesomeIcon icon={faChartBar} className={styles.navIcon} />
          <span className={styles.navText}>Analytics</span>
        </Link>

        <Link href="/user/social-sharing" className={styles.navLink}>
          <FontAwesomeIcon icon={faUser} className={styles.navIcon} />
          <span className={styles.navText}>Social Sharing</span>
        </Link>

        <Link href="/about" className={styles.navLink}>
          <FontAwesomeIcon icon={faInfoCircle} className={styles.navIcon} />
          <span className={styles.navText}>About</span>
        </Link>
      </nav>

      <div className={styles.rightSection} ref={menuRef}>
        <div
          className={styles.bellWrapper}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <img src="/images/bell.png" className={styles.bellIcon} />

          {proposalsCount > 0 && (
            <span className={styles.bellBadge}>{proposalsCount}</span>
          )}
        </div>

        {dropdownOpen && <NotificationMenu open={dropdownOpen} />}

        <Link href="/profile" className={styles.profileLink}>
          <img src={profilePic} className={styles.profileImg} />
        </Link>
      </div>
    </header>
  );
}
