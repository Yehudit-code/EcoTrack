'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faHome, faChartBar, faDatabase, faInfoCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import styles from './CompanyHeader.module.css';

export default function Header() {
  const user = useUserStore((s) => s.user);
  const hasHydrated = useUserStore((s) => s._hasHydrated);
  const [profilePic, setProfilePic] = useState('/images/default-profile-company.png');

  useEffect(() => {
    if (!hasHydrated || !user) return;

    setProfilePic(
      user.photo ||
      '/images/default-profile-company.png'
    );
  }, [user, hasHydrated]);

  if (!hasHydrated) return null; // אל תציג את ההדר לפני שהמשתמש נטען

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <FontAwesomeIcon icon={faLeaf} className={styles.logoIcon} />
        <span className={styles.logoText}>EcoTrack</span>
      </div>

      <nav className={styles.nav}>
        <Link href="/home" className={styles.navLink}>
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </Link>
        <Link href="/company/display-users" className={styles.navLink}>
          <FontAwesomeIcon icon={faDatabase} />
          <span>Display Users</span>
        </Link>
        <Link href="/contact" className={styles.navLink}>
          <FontAwesomeIcon icon={faChartBar} />
          <span>Contact</span>
        </Link>
        <Link href="/about" className={styles.navLink}>
          <FontAwesomeIcon icon={faInfoCircle} />
          <span>About</span>
        </Link>
      </nav>

      <div className={styles.userSection}>
        <Link href="/profile" className={styles.profileLink}>
          <img src={profilePic} alt="Profile" className={styles.profileImg} />
        </Link>
      </div>
    </header>
  );
}
