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
        <div className={styles.topSection}>
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
              <a
                href="https://www.facebook.com/profile.php?id=61585262580268"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="EcoTrack Facebook"
              >
                <FontAwesomeIcon icon={faFacebook} />
              </a>

              <a
                href="https://www.instagram.com/ecotrack336/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="EcoTrack Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>

              <a
                href="https://www.linkedin.com/in/hadar-nagar-5a0ab032a/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="EcoTrack LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedin} />
              </a>

              <a
                href="https://x.com/TrackEco85780"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="EcoTrack Twitter"
              >
                <FontAwesomeIcon icon={faTwitter} />
              </a>
            </div>
          </div>

          <div className={styles.column}>
            <h4>Quick Links</h4>
            <ul className={styles.linkList}>
              {quickLinks.map((link) => (
                <li key={link.href}><a href={link.href}>{link.label}</a></li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <h4>Our Services</h4>
            <div className={styles.socialLinks}>
              <a
                href="https://www.facebook.com/profile.php?id=61585262580268"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="EcoTrack Facebook"
              >
                <FontAwesomeIcon icon={faFacebook} />
              </a>

              <a
                href="https://www.instagram.com/ecotrack336/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="EcoTrack Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>

              <a
                href="https://www.linkedin.com/in/hadar-nagar-5a0ab032a/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="EcoTrack LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedin} />
              </a>

              <a
                href="https://x.com/TrackEco85780"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="EcoTrack Twitter"
              >
                <FontAwesomeIcon icon={faTwitter} />
              </a>
            </div>

            <ul className={styles.linkList}>
              <li><a href="/home#feature-transport">Transportation Tracking</a></li>
              <li><a href="/home#feature-environment">Waste Reduction</a></li>
              <li><a href="/home#feature-water">Water Conservation</a></li>
              <li><a href="/home#feature-energy">Energy Management</a></li>
            </ul>
          </div>

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

        <div className={styles.bottomSection}>
          <div className={styles.copyright}>
            <p>
              © {currentYear} EcoTrack. Made with{' '}
              <FontAwesomeIcon icon={faHeart} className={styles.heartIcon} />{' '}
              for a sustainable future.
            </p>
          </div>
          <div className={styles.legalLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;