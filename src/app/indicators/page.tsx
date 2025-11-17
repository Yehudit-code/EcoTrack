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
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setCurrentUser(userData);
      } else {
        // User not logged in, show message but don't redirect
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
        // Send userId as query parameter to get only current user's data
        const response = await fetch(`/api/consumption?userId=${currentUser._id}`);
        if (response.ok) {
          const data = await response.json();
          setConsumptionData(data.data || []);
        }
      } else {
        // No user logged in - show empty graphs
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
    const categories = ['Water', 'Electricity', 'Transportation', 'Waste'] as const;
    const months = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
    
    return categories.map(category => {
      const categoryData = consumptionData
        .filter(item => item.category === category)
        .sort((a, b) => a.year - b.year || a.month - b.month)
        .slice(-6) // Last 6 months
        .map(item => ({
          month: months[item.month - 1],
          value: item.value
        }));

      return {
        category,
        data: categoryData,
        hebrewName: categoryConfig[category].hebrewName,
        color: categoryConfig[category].color
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
                    consumptionData.map((item) => (
                      <tr key={item._id}>
                        <td>{categoryConfig[item.category as keyof typeof categoryConfig]?.hebrewName || item.category}</td>
                        <td>{item.month}</td>
                        <td>{item.year}</td>
                        <td>{item.value}</td>
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

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 200;
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
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 200;
          const y = 80 - ((item.value - minValue) / range) * 60;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
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