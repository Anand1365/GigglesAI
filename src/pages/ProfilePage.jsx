import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await authService.checkAuth();
        setUser(response.user);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile. Please try again.');
        // Redirect to login if not authenticated
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate('/login-page');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login-page');
  };

  const handleBackToChat = () => {
    navigate('/avtar-section-page');
  };

  if (isLoading) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Giggles AI</h1>
        <h2 className={styles.subtitle}>Your Profile</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        
        {user && (
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatar}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <h3 className={styles.userName}>{user.name}</h3>
            </div>
            
            <div className={styles.profileInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{user.email}</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Account ID:</span>
                <span className={styles.infoValue}>{user.id}</span>
              </div>
            </div>
            
            <div className={styles.buttonGroup}>
              <button 
                className={styles.backButton}
                onClick={handleBackToChat}
              >
                Back to Chat
              </button>
              <button 
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
