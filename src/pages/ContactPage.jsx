import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleBackClick = () => {
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to a server
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  return (
    <div className={styles.contactPage}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleBackClick}>
          <span>←</span> Back
        </button>
        <h1 className={styles.title}>Contact Us</h1>
      </header>

      <main className={styles.main}>
        {submitted ? (
          <div className={styles.thankYouMessage}>
            <h2>Thank You!</h2>
            <p>Your message has been sent. We'll get back to you as soon as possible.</p>
            <button 
              className={styles.backToHomeButton}
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className={styles.contactContainer}>
            <div className={styles.contactInfo}>
              <h2>Get In Touch</h2>
              <p>
                Have questions or feedback? We'd love to hear from you. 
                Fill out the form and our team will get back to you as soon as possible.
              </p>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📧</span>
                <span>support@gigglesai.com</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📱</span>
                <span>+1 (555) 123-4567</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📍</span>
                <span>123 AI Avenue, Tech City, TC 12345</span>
              </div>
            </div>
            
            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                ></textarea>
              </div>
              
              <button type="submit" className={styles.submitButton}>
                Send Message
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default ContactPage;
