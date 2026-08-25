import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>প</div>
          <div>
            <div className={styles.brandTitle}>PathShala (পাঠশালা)</div>
            <div className={styles.brandSub}>LMS Platform</div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.heroCard}>
          <div className={styles.badgeRow}>
            <span className={styles.phaseBadge}>
              <span className={styles.dot}></span> Phase 0: Scaffolded & Active
            </span>
          </div>
          <h1 className={styles.heroTitle}>Next.js + Strapi LMS Architecture</h1>
          <p className={styles.heroDesc}>
            PathShala is a role-governed Learning Management System built for CPS Academy.
            Access control is enforced at the backend layer across 4 distinct roles.
          </p>
        </section>

        <section>
          <h2 style={{ marginBottom: "16px" }}>Core Permission Matrix Roles</h2>
          <div className={styles.rolesGrid}>
            <div className={styles.roleCard}>
              <div className={`${styles.roleIndicator} ${styles.adminIndicator}`} />
              <div className={styles.roleHeader}>
                <span className={styles.roleName}>Admin</span>
                <span className={`${styles.rolePill} ${styles.adminPill}`}>Full Control</span>
              </div>
              <p className={styles.roleDesc}>
                User management, role assignment, system stats, and full content oversight.
              </p>
            </div>

            <div className={styles.roleCard}>
              <div className={`${styles.roleIndicator} ${styles.contentIndicator}`} />
              <div className={styles.roleHeader}>
                <span className={styles.roleName}>Content Manager</span>
                <span className={`${styles.rolePill} ${styles.contentPill}`}>Content Admin</span>
              </div>
              <p className={styles.roleDesc}>
                Manage courses, lessons, and blog posts without user administration.
              </p>
            </div>

            <div className={styles.roleCard}>
              <div className={`${styles.roleIndicator} ${styles.instructorIndicator}`} />
              <div className={styles.roleHeader}>
                <span className={styles.roleName}>Instructor</span>
                <span className={`${styles.rolePill} ${styles.instructorPill}`}>Scoped</span>
              </div>
              <p className={styles.roleDesc}>
                Manage lessons/quizzes for own courses and monitor enrolled student progress.
              </p>
            </div>

            <div className={styles.roleCard}>
              <div className={`${styles.roleIndicator} ${styles.studentIndicator}`} />
              <div className={styles.roleHeader}>
                <span className={styles.roleName}>Student</span>
                <span className={`${styles.rolePill} ${styles.studentPill}`}>Learner</span>
              </div>
              <p className={styles.roleDesc}>
                Enroll in courses, view lessons, take quizzes, and track progress.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.statusCard}>
          <div className={styles.statusInfo}>
            <span className={styles.statusLabel}>Backend CMS Integration</span>
            <span className={styles.statusValue}>
              <span className={styles.statusDot} />
              Strapi v5 API Connected (Port 1337)
            </span>
          </div>
          <div className={styles.statusInfo}>
            <span className={styles.statusLabel}>Frontend Architecture</span>
            <span className={styles.statusValue}>
              <span className={styles.statusDot} />
              Next.js 15 App Router (Port 3000)
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
