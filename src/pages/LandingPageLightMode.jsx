import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FrameComponent from "../components/FrameComponent";
import styles from "./LandingPageLightMode.module.css";

const LandingPageLightMode = () => {
  const navigate = useNavigate();

  const onABOUTTextClick = useCallback(() => {
    navigate("/about-page-2");
  }, [navigate]);

  const onPRICETextClick = useCallback(() => {
    navigate("/pricing-page-3");
  }, [navigate]);

  const onCONTACTTextClick = useCallback(() => {
    navigate("/contact-page");
  }, [navigate]);

  const onDarkModeIconClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const onLoginClick = useCallback(() => {
    navigate("/login-page");
  }, [navigate]);

  const onSignUpClick = useCallback(() => {
    navigate("/sign-up-page");
  }, [navigate]);

  return (
    <div className={styles.landingPageLightMode}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <b className={styles.gigglesAi}>
              <p className={styles.gigglesAi1}>Giggles AI</p>
            </b>
          </div>
          <div className={styles.navigationLinks}>
            <div className={styles.navItem}>HOME</div>
            <div
              className={styles.navItem}
              onClick={onABOUTTextClick}
            >ABOUT</div>
            <div
              className={styles.navItem}
              onClick={onPRICETextClick}
            >PRICE</div>
            <div 
              className={styles.navItem} 
              onClick={onCONTACTTextClick}
            >CONTACT</div>
          </div>
          <div className={styles.rightSection}>
            <div className={styles.socialIcons}>
              <img
                className={styles.iconItem}
                alt="Email"
                src="mdiemailopenoutline.svg"
              />
              <img
                className={styles.iconItem}
                alt="Instagram"
                src="feinstagram.svg"
              />
              <img
                className={styles.iconItem}
                alt="LinkedIn"
                src="linemdlink.svg"
              />
              <img
                className={styles.iconItem}
                alt="Dark Mode"
                src="materialsymbolsdarkmode.svg"
                onClick={onDarkModeIconClick}
              />
            </div>
            <div className={styles.authButtons}>
              <button 
                className={styles.loginButton}
                onClick={onLoginClick}
              >
                Login
              </button>
              <button 
                className={styles.signupButton}
                onClick={onSignUpClick}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className={styles.mainContent}>
        <FrameComponent lightMode={true} />
      </main>
    </div>
  );
};

export default LandingPageLightMode;
