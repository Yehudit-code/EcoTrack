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
  faBell,
} from "@fortawesome/free-solid-svg-icons";

import { getProfileImage } from "@/app/lib/getProfileImage";
import styles from "./Header.module.css";

export default function Header() {
  const [profilePic, setProfilePic] = useState("/images/default-profile.png");
  const [proposalsCount, setProposalsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // סגירה בלחיצה מחוץ
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);


  // טעינת נתוני המשתמש וההצעות
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) return;

    const parsed = JSON.parse(userData);
    const pic = getProfileImage(parsed);
    setProfilePic(pic);

    fetch(`/api/company-requests?userId=${parsed._id}`)
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data);
        setProposalsCount(data.length);
      })
      .catch(() => {
        setNotifications([]);
        setProposalsCount(0);
      });
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <FontAwesomeIcon icon={faLeaf} className={styles.logoIcon} />
        <span className={styles.logoText}>EcoTrack</span>
      </div>

      <nav className={styles.nav}>
        <Link href="/home" className={styles.navLink}><FontAwesomeIcon icon={faHome} /><span>Home</span></Link>
        <Link href="/manage-data" className={styles.navLink}><FontAwesomeIcon icon={faDatabase} /><span>Manage Data</span></Link>
        <Link href="/indicators" className={styles.navLink}><FontAwesomeIcon icon={faChartBar} /><span>Analytics</span></Link>
        <Link href="/social-sharing" className={styles.navLink}><FontAwesomeIcon icon={faUser} /><span>Social Sharing</span></Link>
        <Link href="/about" className={styles.navLink}><FontAwesomeIcon icon={faInfoCircle} /><span>About</span></Link>
      </nav>

      {/* פעמון + פרופיל */}
      <div className={styles.rightSection} ref={menuRef}>
        {/* פעמון */}
        <div
          className={styles.bellWrapper}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <img src="/images/bell.png" className={styles.bellIcon} />

          {proposalsCount > 0 && (
            <span className={styles.bellBadge}>{proposalsCount}</span>
          )}
        </div>


        <NotificationMenu open={dropdownOpen} />

        {/* פרופיל */}
        <Link href="/profile" className={styles.profileLink}>
          <img src={profilePic} className={styles.profileImg} />
        </Link>
      </div>
    </header>
  );
}
