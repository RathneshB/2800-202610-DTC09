import {Link} from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <div>
        <Link to="/" style={styles.Links}>Home</Link>
      </div>
      <div style={styles.rightLinks}>
        <Link to="/" style={styles.Links}>Login</Link>
        <Link to="/"style={styles.Links}>Sign Up</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem",
    backgroundColor: "#3F7D20",
  },
  Links: {
    color: "white",
    fontSize: "1rem",
    padding: "0.5rem",
    textDecoration: "none",
  },
  rightLinks: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    fontSize: "1rem",
  },
};
export default Navbar