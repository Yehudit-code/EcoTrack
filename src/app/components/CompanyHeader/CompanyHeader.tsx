'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faHome, faChartBar, faDatabase, faInfoCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import styles from './CompanyHeader.module.css';

export default function Header() {
  const [profilePic, setProfilePic] = useState<string>('/images/default-profile.png');

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const parsed = JSON.parse(userData);

      const pic =
        parsed.photo ||
        parsed.photoURL ||
        '/images/default-profile-company.png';

      setProfilePic(pic);

      localStorage.setItem('profilePic', pic);
    }
  }, []);

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
        <Link href="/displa-user" className={styles.navLink}>
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
          {profilePic ? (
            <div className={styles.profileContainer}>
              <img src={profilePic} alt="Company Profile" className={styles.profileImg} />
            </div>
          ) : (
            <div className={styles.defaultProfile}>
              <FontAwesomeIcon icon={faUser} />
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
