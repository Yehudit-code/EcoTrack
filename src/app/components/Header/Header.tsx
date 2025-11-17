'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
        <Image src="/logoEcoTrack.png" alt="ECO TRACK logo" width={40} height={40} />
        <span className={styles.logoText}>ECO TRACK</span>
      </div>

      <nav className={styles.nav}>
  <Link href="/home">Home</Link>
  <Link href="/manage-data">Manage data</Link>
  <Link href="/indicators">Indicators</Link>
  <Link href="/about">About</Link> 
</nav>


      {/* תמונת המשתמש מימין */}
      {profilePic && (
        <div className={styles.profileContainer}>
          <img src={profilePic} alt="User" className={styles.profileImg} />
        </div>
      )}
    </header>
  );
}
