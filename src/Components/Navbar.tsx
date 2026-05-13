import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <div>
        <Link to="/" style={styles.Home}>
          <b>🍔FoodRoutes🚚</b>
        </Link>
      </div>
      <div style={styles.rightLinks}>
        <Link to="/" style={styles.Login}>
          Log in
        </Link>
        <Link to="/" style={styles.SignUp}>
          Sign Up
        </Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem",
    backgroundColor: "#3F7D20",
  },
  Login: {
    color: "black",
    fontSize: "1rem",
    padding: "0.5rem 1rem",
    textDecoration: "none",
    backgroundColor: "white",
    borderRadius: "50px",
  },
  SignUp: {
    color: "white",
    fontSize: "1rem",
    padding: "0.5rem 1rem",
    textDecoration: "none",
    backgroundColor: "black",
    borderRadius: "50px",
  },
  Home: {
    color: "black",
    fontSize: "2rem",
    padding: "0.5rem",
    textDecoration: "none",
    borderRadius: "50px",
    font: "bold",
  },
  rightLinks: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    fontSize: "1rem",
  },
  LoginHover: {
    
  }
};
export default Navbar