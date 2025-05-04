import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className={styles.aboutPage}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleBackClick}>
          <span>←</span> Back
        </button>
        <h1 className={styles.title}>About Giggles AI</h1>
      </header>

      <main className={styles.main}>
        <section className={styles.aboutSection}>
          <h2>Our Mission</h2>
          <p>
            Giggles AI is dedicated to bringing joy and laughter to your everyday conversations. 
            We believe that humor is a universal language that connects people and makes life more enjoyable.
          </p>
          
          <h2>What We Do</h2>
          <p>
            Our AI-powered platform offers a variety of virtual companions with different personalities, 
            each designed to engage in humorous and entertaining conversations. Whether you're looking for 
            a friendly chat, educational insights with a twist of humor, or just a good laugh, 
            our avatars are here for you.
          </p>
          
          <h2>Our Technology</h2>
          <p>
            Powered by advanced natural language processing and machine learning algorithms, 
            our AI avatars can understand context, recognize humor patterns, and generate 
            responses that feel natural and genuinely funny.
          </p>
          
          <h2>Join Us</h2>
          <p>
            Experience the future of AI-powered entertainment. Sign up today and start 
            chatting with our diverse range of avatars designed to brighten your day.
          </p>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
