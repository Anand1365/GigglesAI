import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login-page');
  };

  return (
    <div className={styles.landingPage}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Giggles AI</h1>
      </header>
      <main className={styles.main}>
        <div className={styles.heroContent}>
          <h2 className={styles.title}>Welcome to Giggles AI</h2>
          <p className={styles.subtitle}>Your AI-powered humor companion</p>
          <button 
            className={styles.getStartedButton}
            onClick={handleGetStarted}
          >
            Get Started
          </button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;