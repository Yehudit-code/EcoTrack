import React from 'react';
import { useUserStore } from '@/store/useUserStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faEnvelope, faPhone, faMapMarkerAlt, faHeart } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const user = useUserStore((s) => s.user);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  if (!hasHydrated) return null;

  let quickLinks;
  if (user?.role === 'user') {
    quickLinks = [
      { href: '/home', label: 'Home' },
      { href: '/user/manage-data', label: 'Manage Data' },
      { href: '/user/indicators', label: 'Analytics' },
      { href: '/user/social-sharing', label: 'Social Sharing' },
      { href: '/about', label: 'About Us' },
    ];
  } else if (user?.role === 'company') {
    quickLinks = [
      { href: '/home', label: 'Home' },
      { href: '/company/display-users', label: 'Display Users' },
      { href: '/contact', label: 'Contact' },
      { href: '/about', label: 'About Us' },
    ];
  } else {
    quickLinks = [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About Us' },
    ];
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Top Section */}
        <div className={styles.topSection}>
          {/* Company Info */}
          <div className={styles.column}>
            <div className={styles.brand}>
              <FontAwesomeIcon icon={faLeaf} className={styles.brandIcon} />
              <h3>EcoTrack</h3>
            </div>
            <p className={styles.description}>
              Leading the way in sustainable consumption tracking and environmental awareness. 
              Join us in creating a greener future for generations to come.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.column}>
            <h4>Quick Links</h4>
            <ul className={styles.linkList}>
              {quickLinks.map((link) => (
                <li key={link.href}><a href={link.href}>{link.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className={styles.column}>
            <h4>Our Services</h4>
            <ul className={styles.linkList}>
              <li><a href="/home#feature-transport">Transportation Tracking</a></li>
              <li><a href="/home#feature-environment">Waste Reduction</a></li>
              <li><a href="/home#feature-water">Water Conservation</a></li>
              <li><a href="/home#feature-energy">Energy Management</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.column}>
            <h4>Contact Us</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>123 Eco Street, Green City, GC 12345</span>
              </div>
              <div className={styles.contactItem}>
                <FontAwesomeIcon icon={faPhone} />
                <span>+972515407228</span>

              </div>
              <div className={styles.contactItem}>
                <FontAwesomeIcon icon={faEnvelope} />
                <span>ecotrack33@ecotrack.com</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;