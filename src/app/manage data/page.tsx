'use client';
import { useState, useEffect } from 'react';
import Header from '@/app/components/Header/Header';
import styles from './page.module.css';

export default function ManageDataPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    electricity: '',
    water: '',
    transportation: '',
    waste: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const userDataString = localStorage.getItem('currentUser');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setCurrentUser(userData);
    }
  }, []);

  const handleInputChange = (category: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const saveConsumptionData = async (category: 'Water' | 'Electricity' | 'Transportation' | 'Waste', value: number, unit: string) => {
    if (!currentUser) {
      alert('יש להתחבר כדי לשמור נתונים');
      return;
    }

    if (!value || value <= 0) {
      alert('יש להזין ערך תקין');
      return;
    }

    setLoading(true);
    try {
      const currentDate = new Date();
      const response = await fetch('/api/consumption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser.email,
          category,
          value,
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          improvementScore: 0
        })
      });

      if (response.ok) {
        alert(`נתוני ${category === 'Electricity' ? 'חשמל' : category === 'Water' ? 'מים' : category === 'Transportation' ? 'תחבורה' : 'פסולת'} נשמרו בהצלחה!`);
        // Reset the specific field
        const fieldName = category.toLowerCase();
        setFormData(prev => ({ ...prev, [fieldName]: '' }));
      } else {
        const error = await response.json();
        alert(`שגיאה בשמירת נתונים: ${error.error || 'שגיאה לא ידועה'}`);
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('שגיאה בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contentBox}>
          <h1 className={styles.title}>ניהול נתונים</h1>
          
          {!currentUser && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '20px' }}>
              יש להתחבר כדי לשמור נתונים. <a href="/signIn" style={{ color: '#2d5c2d' }}>התחבר כאן</a>
            </div>
          )}
          
          {currentUser && (
            <div style={{ textAlign: 'center', padding: '15px', color: '#2d5c2d', backgroundColor: '#f0f8f0', borderRadius: '8px', marginBottom: '20px' }}>
              שלום {currentUser.name || currentUser.email}! הזן את נתוני הצריכה שלך להחודש הנוכחי
            </div>
          )}
          
          <div className={styles.dataSection}>
            <div className={styles.dataCard}>
              <h3>צריכת חשמל</h3>
              <div className={styles.inputGroup}>
                <label>קילוואט שעה חודשי:</label>
                <input 
                  type="number" 
                  placeholder="הזן צריכה חודשית" 
                  value={formData.electricity}
                  onChange={(e) => handleInputChange('electricity', e.target.value)}
                  disabled={loading}
                />
              </div>
              <button 
                className={styles.saveBtn}
                onClick={() => saveConsumptionData('Electricity', parseFloat(formData.electricity), 'kWh')}
                disabled={loading || !formData.electricity}
              >
                {loading ? 'שומר...' : 'שמור נתונים'}
              </button>
            </div>

            <div className={styles.dataCard}>
              <h3>צריכת מים</h3>
              <div className={styles.inputGroup}>
                <label>מ&quot;ק מים חודשי:</label>
                <input 
                  type="number" 
                  placeholder="הזן צריכה חודשית" 
                  value={formData.water}
                  onChange={(e) => handleInputChange('water', e.target.value)}
                  disabled={loading}
                />
              </div>
              <button 
                className={styles.saveBtn}
                onClick={() => saveConsumptionData('Water', parseFloat(formData.water), 'm³')}
                disabled={loading || !formData.water}
              >
                {loading ? 'שומר...' : 'שמור נתונים'}
              </button>
            </div>

            <div className={styles.dataCard}>
              <h3>תחבורה</h3>
              <div className={styles.inputGroup}>
                <label>ק&quot;מ נסיעה חודשי:</label>
                <input 
                  type="number" 
                  placeholder="הזן מרחק נסיעה" 
                  value={formData.transportation}
                  onChange={(e) => handleInputChange('transportation', e.target.value)}
                  disabled={loading}
                />
              </div>
              <button 
                className={styles.saveBtn}
                onClick={() => saveConsumptionData('Transportation', parseFloat(formData.transportation), 'km')}
                disabled={loading || !formData.transportation}
              >
                {loading ? 'שומר...' : 'שמור נתונים'}
              </button>
            </div>

            <div className={styles.dataCard}>
              <h3>פסולת</h3>
              <div className={styles.inputGroup}>
                <label>ק&quot;ג פסולת שבועי:</label>
                <input 
                  type="number" 
                  placeholder="הזן כמות פסולת" 
                  value={formData.waste}
                  onChange={(e) => handleInputChange('waste', e.target.value)}
                  disabled={loading}
                />
              </div>
              <button 
                className={styles.saveBtn}
                onClick={() => saveConsumptionData('Waste', parseFloat(formData.waste), 'kg')}
                disabled={loading || !formData.waste}
              >
                {loading ? 'שומר...' : 'שמור נתונים'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>footer</footer>
      
    </div>
  );
}