'use client';
import { useState, useEffect } from 'react';
import Header from '@/app/components/Header/Header';
import styles from './page.module.css';

interface ConsumptionData {
  _id: string;
  category: 'Water' | 'Electricity' | 'Gas' | 'Transportation' | 'Waste';
  value: number;
  month: number;
  year: number;
  improvementScore?: number;
}

interface ChartData {
  category: string;
  data: { month: string; value: number }[];
  hebrewName: string;
  color: string;
}

export default function IndicatorsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('graph');
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const categoryConfig = {
    Water: { hebrewName: 'מים', color: '#2196F3' },
    Electricity: { hebrewName: 'חשמל', color: '#FF9800' },
    Transportation: { hebrewName: 'תחבורה', color: '#4CAF50' },
    Transport: { hebrewName: 'תחבורה', color: '#4CAF50' }, // Support old naming
    Waste: { hebrewName: 'פסולת', color: '#F44336' }
  };

  useEffect(() => {
    // First check if user is logged in
    checkUserStatus();
  }, []);

  useEffect(() => {
    // Fetch consumption data only after we have user info
    if (currentUser) {
      fetchConsumptionData();
    }
  }, [currentUser]);

  const checkUserStatus = async () => {
    try {
      // Check if user data exists in localStorage
      const userDataString = localStorage.getItem('currentUser');
      console.log('🔍 Frontend: localStorage currentUser:', userDataString);
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log('👤 Frontend: Parsed user data:', userData);
        setCurrentUser(userData);
      } else {
        // User not logged in, show message but don't redirect
        console.log('❌ Frontend: No user in localStorage');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsumptionData = async () => {
    try {
      if (currentUser) {
        // Send userEmail as query parameter to get only current user's data
        const url = `/api/consumption?userEmail=${currentUser.email}`;
        console.log('🔗 Frontend: Fetching from URL:', url);
        console.log('📧 Frontend: Using email:', currentUser.email);
        
        const response = await fetch(url);
        console.log('📡 Frontend: API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Frontend: Received data:', data);
          console.log('📊 Frontend: Data array:', data.data);
          setConsumptionData(data.data || []);
        } else {
          console.log('❌ Frontend: API response not ok:', response.status);
        }
      } else {
        // No user logged in - show empty graphs
        console.log('❌ Frontend: No currentUser, setting empty data');
        setConsumptionData([]);
      }
    } catch (error) {
      console.error('Error fetching consumption data:', error);
      setConsumptionData([]);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (): ChartData[] => {
    const months = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
    
    // Get only categories that actually have data
    const availableCategories = [...new Set(consumptionData.map(item => item.category))];
    
    return availableCategories.map(category => {
      const categoryData = consumptionData
        .filter(item => item.category === category)
        .sort((a, b) => a.year - b.year || a.month - b.month)
        .map(item => ({
          month: months[item.month - 1] || `${item.month}/${item.year}`,
          value: item.value,
          date: new Date(item.year, item.month - 1)
        }))
        .slice(-12); // Show up to last 12 data points

      return {
        category,
        data: categoryData,
        hebrewName: categoryConfig[category as keyof typeof categoryConfig]?.hebrewName || category,
        color: categoryConfig[category as keyof typeof categoryConfig]?.color || '#999'
      };
    });
  };

  const chartData = processChartData();

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.loading}>טוען נתונים...</div>
        </main>
      </div>
    );
  }

  // Remove this check - always show the graphs

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contentBox}>
          <h1 className={styles.title}>
            מדדים ונתונים{currentUser ? ` - ${currentUser.name || currentUser.email}` : ''}
          </h1>
          
          {/* Data Summary */}
          {consumptionData.length > 0 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              margin: '20px 0', 
              padding: '20px', 
              backgroundColor: '#f0f8f0', 
              borderRadius: '12px',
              direction: 'rtl'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d5c2d' }}>
                  {consumptionData.length}
                </div>
                <div style={{ color: '#666' }}>סה״כ רשומות</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d5c2d' }}>
                  {[...new Set(consumptionData.map(item => item.category))].length}
                </div>
                <div style={{ color: '#666' }}>קטגוריות פעילות</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d5c2d' }}>
                  {[...new Set(consumptionData.map(item => `${item.month}/${item.year}`))].length}
                </div>
                <div style={{ color: '#666' }}>חודשים עם נתונים</div>
              </div>
            </div>
          )}
          
          {/* Tab Buttons */}
          <div className={styles.tabButtons}>
            <button 
              className={`${styles.tabButton} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => setViewMode('table')}
            >
              table
            </button>
            <button 
              className={`${styles.tabButton} ${viewMode === 'graph' ? styles.active : ''}`}
              onClick={() => setViewMode('graph')}
            >
              graph
            </button>
          </div>

          {viewMode === 'graph' && (
            <div className={styles.chartsGrid}>
              {chartData.map((chart) => (
                <div key={chart.category} className={styles.chartCard}>
                  <h3 className={styles.chartTitle} style={{ color: chart.color }}>
                    {chart.hebrewName}
                  </h3>
                  <div className={styles.chartContainer}>
                    <div className={styles.chartArea}>
                      <SimpleLineChart data={chart.data} color={chart.color} />
                    </div>
                    <div className={styles.chartInfo}>
                      {/* Additional info area */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'table' && (
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>קטגוריה</th>
                    <th>חודש</th>
                    <th>שנה</th>
                    <th>ערך</th>
                    <th>ציון שיפור</th>
                  </tr>
                </thead>
                <tbody>
                  {consumptionData.length > 0 ? (
                    consumptionData
                      .sort((a, b) => b.year - a.year || b.month - a.month) // Sort newest first
                      .map((item) => (
                      <tr key={item._id}>
                        <td>{categoryConfig[item.category as keyof typeof categoryConfig]?.hebrewName || item.category}</td>
                        <td>{item.month}</td>
                        <td>{item.year}</td>
                        <td>{item.value.toLocaleString()}</td>
                        <td>{item.improvementScore || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        {currentUser ? 'אין נתונים עדיין. התחל לעקוב אחר הצריכה שלך!' : 'התחבר כדי לראות את הנתונים שלך'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>footer</footer>
    </div>
  );
}

// Simple Line Chart Component
function SimpleLineChart({ data, color }: { data: { month: string; value: number }[]; color: string }) {
  if (!data.length) {
    return (
      <div className={styles.noData}>
        <div className={styles.icon}>📊</div>
        <div>אין נתונים עדיין</div>
        <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>התחל לעקוב אחר הצריכה שלך</div>
      </div>
    );
  }

  // Validate data values
  const validData = data.filter(d => typeof d.value === 'number' && !isNaN(d.value));
  
  if (validData.length === 0) {
    return (
      <div className={styles.noData}>
        <div className={styles.icon}>📊</div>
        <div>נתונים לא חוקיים</div>
      </div>
    );
  }

  const maxValue = Math.max(...validData.map(d => d.value));
  const minValue = Math.min(...validData.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = validData.map((item, index) => {
    const x = validData.length > 1 ? (index / (validData.length - 1)) * 200 : 100;
    const y = 80 - ((item.value - minValue) / range) * 60;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={styles.chartSvg}>
      <svg width="220" height="100" viewBox="0 0 220 100">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        {validData.map((item, index) => {
          const x = validData.length > 1 ? (index / (validData.length - 1)) * 200 : 100;
          const y = 80 - ((item.value - minValue) / range) * 60;
          
          // Ensure x and y are valid numbers
          const safeX = isNaN(x) ? 100 : x;
          const safeY = isNaN(y) ? 50 : y;
          
          return (
            <circle
              key={index}
              cx={safeX}
              cy={safeY}
              r="3"
              fill={color}
            />
          );
        })}
      </svg>
      <div className={styles.chartLabels}>
        {data.map((item, index) => (
          <span key={index} className={styles.monthLabel}>
            {item.month}
          </span>
        ))}
      </div>
    </div>
  );
}