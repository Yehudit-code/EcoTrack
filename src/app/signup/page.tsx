'use client';

import { useState } from 'react';
import styles from './page.module.css';
import Image from 'next/image';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    country: '',
    profilePic: null as File | null,
  });

  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.email) newErrors.email = 'נא להזין אימייל';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'האימייל אינו תקין';

    if (!formData.password) newErrors.password = 'נא להזין סיסמה';
    else if (formData.password.length < 6)
      newErrors.password = 'הסיסמה חייבת להיות באורך של לפחות 6 תווים';

    if (!formData.username) newErrors.username = 'נא להזין שם משתמש';
    else if (formData.username.length < 3)
      newErrors.username = 'שם המשתמש חייב להכיל לפחות 3 תווים';

    if (!formData.country) newErrors.country = 'נא לבחור מדינה';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (name === 'profilePic') {
      const file = files[0];
      setFormData({ ...formData, profilePic: file });
      if (file) setPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log('User data:', formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.signupBox}>
        <p className={styles.smallTitle}>Sign up personal</p>

        {/* כפתורי התחברות */}
        <button className={styles.socialBtn}>
          <Image src="/google.png" alt="Google" width={18} height={18} />
          Continue with Google
        </button>
        <button className={styles.socialBtn}>
          <Image src="/apple.png" alt="Apple" width={18} height={18} />
          Continue with Apple
        </button>

        <h2>Sign up to EcoTrack</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <div className={styles.left}>
              <label>Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className={styles.error}>{errors.email}</p>}

              <label>Password*</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className={styles.error}>{errors.password}</p>}

              <label>Username*</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && <p className={styles.error}>{errors.username}</p>}

              <label>Your Country/Region*</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="Israel">Israel</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="France">France</option>
              </select>
              {errors.country && <p className={styles.error}>{errors.country}</p>}
            </div>

            {/* העלאת תמונת פרופיל */}
            <div className={styles.right}>
              <label>Upload a profile picture</label>
              <div className={styles.uploadBox}>
                {preview ? (
                  <img src={preview} alt="Profile preview" className={styles.preview} />
                ) : (
                  <span>+</span>
                )}
                <input
                  type="file"
                  name="profilePic"
                  accept="image/*"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button type="submit" className={styles.signBtn}>Sign up</button>
          {success && <p className={styles.success}>נרשמת בהצלחה 🎉</p>}
        </form>
      </div>
    </main>
  );
}
