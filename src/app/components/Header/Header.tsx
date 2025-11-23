'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [profilePic, setProfilePic] = useState<string>('/images/default-profile.png');

  useEffect(() => {
    // נשלף את המשתמש השמור בלוקאל סטורג'
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);

      // סדר עדיפויות לתמונה:
      // 1. תמונה שהעלה המשתמש
      // 2. תמונה מגוגל
      // 3. ברירת מחדל
      const pic =
        parsed.photo ||
        parsed.photoURL ||
        '/images/default-profile.png';

      setProfilePic(pic);

      // נשמור גם כדי שהheader הבא ידע לקרוא
      localStorage.setItem('profilePic', pic);
    }
  }, []);

  return (
    <header className={styles.header}>
      {/* לוגו */}
      <div className={styles.logoContainer}>
        <Image src="/logoEcoTrack.png" alt="ECO TRACK logo" width={40} height={40} />
        <span className={styles.logoText}>ECO TRACK</span>
      </div>

      {/* ניווט */}
      <nav className={styles.nav}>
        <Link href="/home">Home</Link>
        <Link href="/manage-data">Manage data</Link>
        <Link href="/indicators">Indicators</Link>
        <Link href="/social-sharing">Social Sharing</Link>
        <Link href="/about">About</Link>
      </nav>

      {/* תמונת משתמש */}
      <div className={styles.profileContainer}>
        <Link href="/profile" className={styles.profileLink}>
          <img
            src={profilePic}
            alt="User profile"
            className={styles.profileImg}
          />
        </Link>
      </div>
    </header>
  );
}
