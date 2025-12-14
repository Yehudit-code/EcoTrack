'use client';
import { useState, useEffect } from 'react';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import styles from '@/app/user/indicators/page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTint, faBolt, faCar, faTrash, faTable, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { consumptionService, ConsumptionData as ServiceConsumptionData } from '@/app/services/client/ConsumptionService';
import { useUserStore } from '@/store/useUserStore';

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
  const currentUser = useUserStore((state) => state.user);

  const [viewMode, setViewMode] = useState<'table' | 'graph'>('graph');
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryConfig = {
    Water: { displayName: 'Water Consumption', color: '#556b2f', icon: faTint },
    Electricity: { displayName: 'Electricity Usage', color: '#556b2f', icon: faBolt },
    Gas: { displayName: 'Gas', color: '#556b2f', icon: faCar },
    Transportation: { displayName: 'Transportation', color: '#556b2f', icon: faCar },
    Waste: { displayName: 'Waste Management', color: '#556b2f', icon: faTrash }
  };

   // Load data based on logged-in user
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (!currentUser) {
          const staticData = consumptionService.getStaticData();
          setConsumptionData(staticData as ConsumptionData[]);
          return;
        }

        const data = await consumptionService.getUserConsumption(currentUser.email);
        setConsumptionData(data as ConsumptionData[]);
      } catch {
        const fallback = consumptionService.getStaticData();
        setConsumptionData(fallback as ConsumptionData[]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // Convert raw data into chart-friendly structure
  const processChartData = (): ChartData[] => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const categories = [...new Set(consumptionData.map(item => item.category))];

    return categories.map(category => {
      const filtered = consumptionData
        .filter(item => item.category === category)
        .sort((a, b) => a.year - b.year || a.month - b.month)
        .map(item => ({
          month: months[item.month - 1] ?? `${item.month}/${item.year}`,
          value: item.value
        }))
        .slice(-12);

      const config =
        categoryConfig[category as keyof typeof categoryConfig] ||
        { displayName: category, color: '#999', icon: faChartBar };

      return {
        category,
        data: filtered,
        displayName: config.displayName,
        color: config.color,
        icon: config.icon
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

  return (
    <>
      <Header />

      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.contentBox}>

            {/* View Switch */}
            <div className={styles.tabButtons}>
              <button
                className={`${styles.tabButton} ${viewMode === 'table' ? styles.active : ''}`}
                onClick={() => setViewMode('table')}
              >
                <FontAwesomeIcon icon={faTable} /> Table View
              </button>

              <button
                className={`${styles.tabButton} ${viewMode === 'graph' ? styles.active : ''}`}
                onClick={() => setViewMode('graph')}
              >
                <FontAwesomeIcon icon={faChartBar} /> Chart View
              </button>
            </div>

            {/* Graph View */}
            {viewMode === 'graph' && (
              <div className={styles.chartsGrid}>
                {chartData.map(chart => (
                  <div key={chart.category} className={styles.chartCard}>
                    <h3 className={styles.chartTitle} style={{ color: chart.color }}>
                      <FontAwesomeIcon icon={chart.icon} /> {chart.displayName}
                    </h3>

                    <SimpleLineChart data={chart.data} color={chart.color} />
                  </div>
                ))}
              </div>
            )}

            {/* Table View */}
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
                        .sort((a, b) => b.year - a.year || b.month - a.month)
                        .map(item => (
                          <tr key={`${item.year}-${item.month}-${item.category}`}>
                            <td>
                              <FontAwesomeIcon
                                icon={
                                  categoryConfig[item.category as keyof typeof categoryConfig]?.icon ||
                                  faChartBar
                                }
                                style={{ marginRight: '8px' }}
                              />
                              {categoryConfig[item.category as keyof typeof categoryConfig]?.displayName ||
                                item.category}
                            </td>
                            <td>{item.month}</td>
                            <td>{item.year}</td>
                            <td>{item.value.toLocaleString()}</td>
                            <td>{item.improvementScore ?? 0}</td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                          {currentUser
                            ? 'No data yet. Start tracking your consumption.'
                            : 'Please sign in to view your data.'}
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

/* Simple Line Chart Component */
function SimpleLineChart({
  data,
  color
}: {
  data: { month: string; value: number }[];
  color: string;
}) {
  if (!data.length) return <div>No data available</div>;

  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;

  return (
    <svg width="220" height="100">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={data
          .map((d, i) => {
            const x = (i / (data.length - 1)) * 200;
            const y = 80 - ((d.value - min) / range) * 60;
            return `${x},${y}`;
          })
          .join(' ')}
      />
    </svg>
  );
}
