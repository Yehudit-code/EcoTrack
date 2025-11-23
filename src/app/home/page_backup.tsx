// 'use client';
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import styles from '../page.module.css';

// export default function HomePage() {
//   const [currentTipIndex, setCurrentTipIndex] = useState(0);
//   const [visibleItems, setVisibleItems] = useState(new Set<string>());
//   const observerRef = useRef<IntersectionObserver | null>(null);

//   // Intersection Observer for scroll animations
//   const intersectionCallback = useCallback((entries: IntersectionObserverEntry[]) => {
//     entries.forEach((entry: IntersectionObserverEntry) => {
//       if (entry.isIntersecting) {
//         setVisibleItems(prev => new Set([...prev, entry.target.id]));
//       }
//     });
//   }, []);

//   useEffect(() => {
//     observerRef.current = new IntersectionObserver(intersectionCallback, {
//       threshold: 0.2,
//       rootMargin: '50px'
//     });

//     return () => {
//       if (observerRef.current) {
//         observerRef.current.disconnect();
//       }
//     };
//   }, [intersectionCallback]);

//   const dailyTips = [
//     '"Save more - protect yourself and the environment"',
//     '"Every drop you save creates a wave of change"',
//     '"Green home = bright future"',
//     '"Less electricity = healthier planet"',
//     '"Sustainability isn\'t a trend, it\'s our responsibility"',
//     '"Small changes bring big results"',
//     '"Nature gives us everything, let\'s give back"',
//     '"Green living starts at your home"',
//     '"Every choice matters for our future"',
//     '"Smart technology for a healthier home"'
//   ];

//   useEffect(() => {
//     // Change tip every 10 minutes (600,000 milliseconds)
//     const interval = setInterval(() => {
//       setCurrentTipIndex((prevIndex) => 
//         (prevIndex + 1) % dailyTips.length
//       );
//     }, 600000); // 10 minutes

//     return () => clearInterval(interval);
//   }, [dailyTips.length]);

//   // Demo chart data
//   const chartData = {
//     waterUsage: [
//       { month: 'Jan', value: 180, target: 200 },
//       { month: 'Feb', value: 165, target: 200 },
//       { month: 'Mar', value: 145, target: 200 },
//       { month: 'Apr', value: 130, target: 200 },
//       { month: 'May', value: 115, target: 200 },
//       { month: 'Jun', value: 125, target: 200 }
//     ],
//     energyConsumption: [
//       { month: 'Jan', value: 420, target: 450 },
//       { month: 'Feb', value: 380, target: 450 },
//       { month: 'Mar', value: 350, target: 450 },
//       { month: 'Apr', value: 320, target: 450 },
//       { month: 'May', value: 285, target: 450 },
//       { month: 'Jun', value: 300, target: 450 }
//     ]
//   };

//   return (
//     <div className={styles.container}>
//       <main className={styles.main}>
//         {/* Professional Header */}
//         <div className={styles.headerSection}>
//           <div className={styles.headerContent}>
//             <h1 className={styles.mainTitle}>Environmental Dashboard</h1>
//             <p className={styles.subtitle}>Monitor and optimize your environmental impact</p>
//           </div>
//         </div>

//         {/* KPI Cards */}
//         <div className={styles.kpiGrid}>
//           <div className={styles.kpiCard}>
//             <div className={styles.kpiHeader}>
//               <h3>Water Efficiency</h3>
//               <span className={styles.kpiTrend}>+12%</span>
//             </div>
//             <div className={styles.kpiValue}>78.5%</div>
//             <div className={styles.kpiSubtext}>vs. last month</div>
//           </div>
          
//           <div className={styles.kpiCard}>
//             <div className={styles.kpiHeader}>
//               <h3>Energy Savings</h3>
//               <span className={styles.kpiTrend}>+8.2%</span>
//             </div>
//             <div className={styles.kpiValue}>1,240 kWh</div>
//             <div className={styles.kpiSubtext}>reduced this month</div>
//           </div>
          
//           <div className={styles.kpiCard}>
//             <div className={styles.kpiHeader}>
//               <h3>CO2 Reduction</h3>
//               <span className={styles.kpiTrend}>+15%</span>
//             </div>
//             <div className={styles.kpiValue}>450 kg</div>
//             <div className={styles.kpiSubtext}>carbon footprint saved</div>
//           </div>
          
//           <div className={styles.kpiCard}>
//             <div className={styles.kpiHeader}>
//               <h3>Sustainability Score</h3>
//               <span className={styles.kpiTrend}>+5pts</span>
//             </div>
//             <div className={styles.kpiValue}>8.7/10</div>
//             <div className={styles.kpiSubtext}>environmental rating</div>
//           </div>
//         </div>

//         {/* Charts Section */}
//         <div className={styles.chartsGrid}>
//           {/* Water Usage Chart */}
//           <div className={styles.chartCard}>
//             <div className={styles.chartHeader}>
//               <h3>Water Usage Trend</h3>
//               <span className={styles.chartPeriod}>Last 6 Months</span>
//             </div>
//             <div className={styles.chartContainer}>
//               <div className={styles.chart}>
//                 {chartData.waterUsage.map((data, index) => (
//                   <div key={index} className={styles.chartBar}>
//                     <div className={styles.barContainer}>
//                       <div 
//                         className={styles.targetBar}
//                         style={{ height: '100%' }}
//                       ></div>
//                       <div 
//                         className={styles.actualBar}
//                         style={{ height: `${(data.value / data.target) * 100}%` }}
//                       ></div>
//                     </div>
//                     <span className={styles.barLabel}>{data.month}</span>
//                     <span className={styles.barValue}>{data.value}L</span>
//                   </div>
//                 ))}
//               </div>
//               <div className={styles.chartLegend}>
//                 <div className={styles.legendItem}>
//                   <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></div>
//                   <span>Actual Usage</span>
//                 </div>
//                 <div className={styles.legendItem}>
//                   <div className={styles.legendColor} style={{ backgroundColor: '#e2e8f0' }}></div>
//                   <span>Target</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Energy Consumption Chart */}
//           <div className={styles.chartCard}>
//             <div className={styles.chartHeader}>
//               <h3>Energy Consumption</h3>
//               <span className={styles.chartPeriod}>Last 6 Months</span>
//             </div>
//             <div className={styles.chartContainer}>
//               <div className={styles.chart}>
//                 {chartData.energyConsumption.map((data, index) => (
//                   <div key={index} className={styles.chartBar}>
//                     <div className={styles.barContainer}>
//                       <div 
//                         className={styles.targetBar}
//                         style={{ height: '100%' }}
//                       ></div>
//                       <div 
//                         className={styles.actualBar}
//                         style={{ height: `${(data.value / data.target) * 100}%` }}
//                       ></div>
//                     </div>
//                     <span className={styles.barLabel}>{data.month}</span>
//                     <span className={styles.barValue}>{data.value}kWh</span>
//                   </div>
//                 ))}
//               </div>
//               <div className={styles.chartLegend}>
//                 <div className={styles.legendItem}>
//                   <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></div>
//                   <span>Actual Usage</span>
//                 </div>
//                 <div className={styles.legendItem}>
//                   <div className={styles.legendColor} style={{ backgroundColor: '#e2e8f0' }}></div>
//                   <span>Target</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Daily Tip - Professional Version */}
//         <div className={styles.tipCard}>
//           <div className={styles.tipHeader}>
//             <h3>Today's Sustainability Insight</h3>
//             <span className={styles.tipRotation}>Updates every 10 minutes</span>
//           </div>
//           <div className={styles.tipContent}>
//             <p>{dailyTips[currentTipIndex]}</p>
//           </div>
//         </div>

//         {/* Animated Features Section */}
//         <div className={styles.featuresSection}>
//           <div className={styles.sectionTitle}>
//             <h2>Our Environmental Solutions</h2>
//             <p>Comprehensive tracking and analytics for sustainable living</p>
//           </div>

//           {/* Water Conservation */}
//           <div 
//             id="feature-water"
//             className={`${styles.featureRow} ${styles.slideLeft} ${visibleItems.has('feature-water') ? styles.visible : ''}`}
//             ref={(el: HTMLDivElement | null) => {
//               if (el && observerRef.current) {
//                 observerRef.current.observe(el);
//               }
//             }}
//           >
//             <div className={styles.featureImage}>
//               <img src="/images/water.png" alt="Water Conservation" />
//               <div className={styles.imageOverlay}>
//                 <h3>Water Conservation</h3>
//               </div>
//             </div>
//             <div className={styles.featureContent}>
//               <h3>Smart Water Management</h3>
//               <p>
//                 Advanced monitoring systems help reduce water consumption by up to 40% in residential homes. 
//                 Our intelligent sensors track usage patterns and provide real-time alerts for leaks or 
//                 excessive consumption, helping you save both water and money.
//               </p>
//               <ul>
//                 <li>Real-time consumption tracking</li>
//                 <li>Leak detection alerts</li>
//                 <li>Usage optimization recommendations</li>
//               </ul>
//             </div>
//           </div>

//           {/* Energy Management */}
//           <div 
//             id="feature-energy"
//             className={`${styles.featureRow} ${styles.slideRight} ${visibleItems.has('feature-energy') ? styles.visible : ''}`}
//             ref={(el: HTMLDivElement | null) => {
//               if (el && observerRef.current) {
//                 observerRef.current.observe(el);
//               }
//             }}
//           >
//             <div className={styles.featureContent}>
//               <h3>Energy Efficiency Analytics</h3>
//               <p>
//                 Comprehensive analytics provide deep insights into energy usage patterns and optimization 
//                 opportunities. Track peak consumption hours, identify energy-hungry devices, and receive 
//                 personalized recommendations to reduce your carbon footprint.
//               </p>
//               <ul>
//                 <li>Peak hour consumption analysis</li>
//                 <li>Device-level energy tracking</li>
//                 <li>Carbon footprint calculation</li>
//               </ul>
//             </div>
//             <div className={styles.featureImage}>
//               <img src="/images/electricity.png" alt="Energy Management" />
//               <div className={styles.imageOverlay}>
//                 <h3>Energy Management</h3>
//               </div>
//             </div>
//           </div>

//           {/* Sustainable Transportation */}
//           <div 
//             id="feature-transport"
//             className={`${styles.featureRow} ${styles.slideLeft} ${visibleItems.has('feature-transport') ? styles.visible : ''}`}
//             ref={(el: HTMLDivElement | null) => {
//               if (el && observerRef.current) {
//                 observerRef.current.observe(el);
//               }
//             }}
//           >
//             <div className={styles.featureImage}>
//               <img src="/images/bicycle.png" alt="Sustainable Transportation" />
//               <div className={styles.imageOverlay}>
//                 <h3>Eco Transportation</h3>
//               </div>
//             </div>
//             <div className={styles.featureContent}>
//               <h3>Sustainable Mobility Tracking</h3>
//               <p>
//                 Monitor and encourage eco-friendly transportation choices to significantly reduce your 
//                 carbon footprint. Track cycling distances, public transport usage, and walking routes 
//                 while calculating the environmental impact of your daily commute.
//               </p>
//               <ul>
//                 <li>Multi-modal transport tracking</li>
//                 <li>CO2 emissions calculation</li>
//                 <li>Eco-friendly route suggestions</li>
//               </ul>
//             </div>
//           </div>

//           {/* Environmental Impact */}
//           <div 
//             id="feature-environment"
//             className={`${styles.featureRow} ${styles.slideRight} ${visibleItems.has('feature-environment') ? styles.visible : ''}`}
//             ref={(el: HTMLDivElement | null) => {
//               if (el && observerRef.current) {
//                 observerRef.current.observe(el);
//               }
//             }}
//           >
//             <div className={styles.featureContent}>
//               <h3>Environmental Impact Assessment</h3>
//               <p>
//                 Comprehensive tracking of your complete environmental footprint with actionable 
//                 recommendations for improvement. Our advanced algorithms analyze your consumption 
//                 patterns and provide personalized strategies for sustainable living.
//               </p>
//               <ul>
//                 <li>Holistic impact analysis</li>
//                 <li>Sustainability scoring</li>
//                 <li>Personalized action plans</li>
//               </ul>
//             </div>
//             <div className={styles.featureImage}>
//               <img src="/images/leaves.png" alt="Environmental Impact" />
//               <div className={styles.imageOverlay}>
//                 <h3>Environmental Impact</h3>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className={styles.aboutSection}>
//             <div className={styles.aboutContent}>
//               <h2>About EcoTrack</h2>
//               <p className={styles.aboutText}>
//                 EcoTrack is a cutting-edge environmental monitoring platform designed to help individuals 
//                 and families make informed decisions about their ecological footprint. Our innovative 
//                 technology combines real-time data collection with intelligent analytics to provide 
//                 actionable insights for sustainable living.
//               </p>
//               <p className={styles.aboutText}>
//                 Founded on the principles of environmental responsibility and technological innovation, 
//                 EcoTrack empowers users to track their water usage, energy consumption, transportation 
//                 habits, and waste generation. Through detailed reporting and personalized recommendations, 
//                 we make sustainability accessible and achievable for everyone.
//               </p>
//               <p className={styles.aboutText}>
//                 Join thousands of users who have already reduced their environmental impact by an average 
//                 of 35% within the first six months of using EcoTrack. Together, we can create a more 
//                 sustainable future for generations to come.
//               </p>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
