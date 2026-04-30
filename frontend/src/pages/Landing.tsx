import { Link } from 'react-router-dom';
import styles from './Landing.module.css';

export function Landing() {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <span className={styles.logo}>vote-off</span>
        <div className={styles.navLinks}>
          <Link to="/login" className={styles.navLink}>Sign in</Link>
          <Link to="/register" className={styles.cta}>Get started</Link>
        </div>
      </header>

      <main className={styles.hero}>
        <h1 className={styles.headline}>Rank anything,<br />one matchup at a time.</h1>
        <p className={styles.sub}>
          Create a bracket, add your options, and let voters decide through head-to-head Elo matchups.
        </p>
        <Link to="/register" className={styles.heroCta}>Create your first bracket</Link>
        <p className={styles.signin}>
          Already have an account? <Link to="/login" className={styles.signinLink}>Sign in</Link>
        </p>
      </main>
    </div>
  );
}
