import React, { useState, useEffect } from 'react';
import styles from './LoadingScreen.module.css';
import logo from '../assets/Loadguard_animate.gif';

const messages = [
  "Welcome to the future of security!",
  "Bienvenidos al futuro de la seguridad!",
  "Miresevini ne te ardhmen e sigurise!"
];

const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, 2000); // Change message every 2 seconds

    const visibilityTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 6000); // Hide after 6 seconds (2 seconds per message)

    return () => {
      clearInterval(messageInterval);
      clearTimeout(visibilityTimeout);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${styles.loadingScreen} ${!isVisible ? styles.hidden : ''}`}>
      <h1 className={`${styles.header} ${styles.textFlip}`}>{messages[messageIndex]}</h1>
      <img src={logo} alt="Loading..." className={styles.logo} />
    </div>
  );
};

export default LoadingScreen;