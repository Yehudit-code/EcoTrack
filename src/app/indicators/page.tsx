'use client';
import { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import styles from './page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTint, faBolt, faCar, faTrash, faTable, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { consumptionService, ConsumptionData as ServiceConsumptionData } from '../services/client/ConsumptionService';

interface ConsumptionData {
  _id?: string;
  category: 'Water' | 'Electricity' | 'Gas' | 'Transportation' | 'Waste';
  value: number;
  month: number;
  year: number;
  improvementScore?: number;
  userId?: string;
  tipsGiven?: string[];
}

interface ChartData {
  category: string;
  data: { month: string; value: number }[];
  displayName: string;
  color: string;
  icon: any;
}

export default function IndicatorsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('graph');
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const categoryConfig = {
    Water: { displayName: 'Water Consumption', color: '#556b2f', icon: faTint },
    Electricity: { displayName: 'Electricity Usage', color: '#556b2f', icon: faBolt },
    Transportation: { displayName: 'Transportation', color: '#556b2f', icon: faCar },
    Transport: { displayName: 'Transportation', color: '#556b2f', icon: faCar }, // Support old naming
    Waste: { displayName: 'Waste Management', color: '#556b2f', icon: faTrash }
  };

  useEffect(() => {
    // First check if user is logged in
    checkUserStatus();
  }, []);

  useEffect(() => {
    // Load consumption data after user check
    if (currentUser) {
      loadConsumptionData();
    } else {
      // Show static demo data when no user is logged in
      const staticData = consumptionService.getStaticData();
      setConsumptionData(staticData as ConsumptionData[]);
      setLoading(false);
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

  const loadConsumptionData = async () => {
    try {
      setLoading(true);
      if (currentUser?.email) {
        console.log('📊 Loading consumption data via service for:', currentUser.email);
        const data = await consumptionService.getUserConsumption(currentUser.email);
        console.log('📊 Received data from service:', data);
        setConsumptionData(data as ConsumptionData[]);
      } else {
        console.log('📊 No user email, loading static data');
        const staticData = consumptionService.getStaticData();
        setConsumptionData(staticData as ConsumptionData[]);
      }
    } catch (error) {
      console.error('Error loading consumption data:', error);
      // Fallback to static data on error
      const staticData = consumptionService.getStaticData();
      setConsumptionData(staticData as ConsumptionData[]);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (): ChartData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
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
        displayName: categoryConfig[category as keyof typeof categoryConfig]?.displayName || category,
        color: categoryConfig[category as keyof typeof categoryConfig]?.color || '#999',
        icon: categoryConfig[category as keyof typeof categoryConfig]?.icon || faChartBar
      };
    });
  };

  const chartData = processChartData();

  if (loading) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.loading}>Loading data...</div>
        </main>
      </div>
    );
  }

  // Remove this check - always show the graphs

  return (
    <>
      <Header />
      <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.contentBox}>
          

          
          {/* Tab Buttons */}
          <div className={styles.tabButtons}>
            <button 
              className={`${styles.tabButton} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => setViewMode('table')}
            >
              <FontAwesomeIcon icon={faTable} style={{color: '#666', marginRight: '8px', fontSize: '14px', fontWeight: '300'}} /> Table View
            </button>
            <button 
              className={`${styles.tabButton} ${viewMode === 'graph' ? styles.active : ''}`}
              onClick={() => setViewMode('graph')}
            >
              <FontAwesomeIcon icon={faChartBar} style={{color: '#666', marginRight: '8px', fontSize: '14px', fontWeight: '300'}} /> Chart View
            </button>
          </div>

          {viewMode === 'graph' && (
            <div className={styles.chartsGrid}>
              {chartData.map((chart) => (
                <div 
                  key={chart.category} 
                  className={styles.chartCard}
                >
                  <h3 className={styles.chartTitle} style={{ color: chart.color }}>
                    <span className={styles.chartIcon}>
                      <FontAwesomeIcon icon={chart.icon} style={{
                        color: '#666', 
                        fontSize: '16px',
                        fontWeight: '300'
                      }} />
                    </span>
                    {chart.displayName}
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
                    <th>Category</th>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Value</th>
                    <th>Improvement Score</th>
                  </tr>
                </thead>
                <tbody>
                  {consumptionData.length > 0 ? (
                    consumptionData
                      .sort((a, b) => b.year - a.year || b.month - a.month) // Sort newest first
                      .map((item) => (
                      <tr key={item._id}>
                        <td>
                          <span style={{marginRight: '8px'}}>
                            <FontAwesomeIcon 
                              icon={categoryConfig[item.category as keyof typeof categoryConfig]?.icon || faChartBar} 
                              style={{
                                color: '#666', 
                                fontSize: '14px',
                                fontWeight: '300'
                              }} 
                            />
                          </span>
                          {categoryConfig[item.category as keyof typeof categoryConfig]?.displayName || item.category}
                        </td>
                        <td>{item.month}</td>
                        <td>{item.year}</td>
                        <td>{item.value.toLocaleString()}</td>
                        <td>{item.improvementScore || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        {currentUser ? 'No data yet. Start tracking your consumption!' : 'Please sign in to view your data'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
}

// Simple Line Chart Component
function SimpleLineChart({ data, color }: { data: { month: string; value: number }[]; color: string }) {
  if (!data.length) {
    return (
      <div className={styles.noData}>
        <div className={styles.icon}>📊</div>
        <div>No data available yet</div>
        <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>Start tracking your consumption</div>
      </div>
    );
  }

  // Validate data values
  const validData = data.filter(d => typeof d.value === 'number' && !isNaN(d.value));
  
  if (validData.length === 0) {
    return (
      <div className={styles.noData}>
        <div className={styles.icon}>📊</div>
        <div>Invalid data</div>
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