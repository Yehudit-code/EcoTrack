'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faHome, faChartBar, faDatabase, faInfoCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import styles from './Header.module.css';

export default function Header() {
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const pic = localStorage.getItem('profilePic');
    if (pic) {
      setProfilePic(pic);
    }
  }, [setProfilePic]);

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
        <Link href="/manage-data" className={styles.navLink}>
          <FontAwesomeIcon icon={faDatabase} />
          <span>Manage Data</span>
        </Link>
        <Link href="/indicators" className={styles.navLink}>
          <FontAwesomeIcon icon={faChartBar} />
          <span>Analytics</span>
        </Link>
        <Link href="/about" className={styles.navLink}>
          <FontAwesomeIcon icon={faInfoCircle} />
          <span>About</span>
        </Link>
      </nav>

      <div className={styles.userSection}>
        {profilePic ? (
          <div className={styles.profileContainer}>
            <img src={profilePic} alt="User Profile" className={styles.profileImg} />
          </div>
        ) : (
          <div className={styles.defaultProfile}>
            <FontAwesomeIcon icon={faUser} />
          </div>
        )}
      </div>
    </header>
  );
}
