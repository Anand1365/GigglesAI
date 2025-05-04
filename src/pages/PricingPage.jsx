import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PricingPage.module.css';

const PricingPage = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className={styles.pricingPage}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleBackClick}>
          <span>←</span> Back
        </button>
        <h1 className={styles.title}>Pricing Plans</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <div className={styles.cardHeader}>
              <h2>Free</h2>
              <p className={styles.price}>$0<span>/month</span></p>
            </div>
            <div className={styles.cardBody}>
              <ul className={styles.featureList}>
                <li>Access to basic avatars</li>
                <li>10 conversations per day</li>
                <li>Standard response time</li>
                <li>Basic customization</li>
              </ul>
              <button className={styles.selectButton}>Get Started</button>
            </div>
          </div>

          <div className={`${styles.pricingCard} ${styles.featured}`}>
            <div className={styles.cardHeader}>
              <h2>Premium</h2>
              <p className={styles.price}>$9.99<span>/month</span></p>
            </div>
            <div className={styles.cardBody}>
              <ul className={styles.featureList}>
                <li>Access to all avatars</li>
                <li>Unlimited conversations</li>
                <li>Priority response time</li>
                <li>Advanced customization</li>
                <li>No advertisements</li>
              </ul>
              <button className={styles.selectButton}>Subscribe Now</button>
            </div>
          </div>

          <div className={styles.pricingCard}>
            <div className={styles.cardHeader}>
              <h2>Business</h2>
              <p className={styles.price}>$29.99<span>/month</span></p>
            </div>
            <div className={styles.cardBody}>
              <ul className={styles.featureList}>
                <li>Team access (up to 5 users)</li>
                <li>Unlimited conversations</li>
                <li>Fastest response time</li>
                <li>Full customization</li>
                <li>API access</li>
                <li>Dedicated support</li>
              </ul>
              <button className={styles.selectButton}>Contact Sales</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
