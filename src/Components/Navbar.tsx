import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <>
      <style>{`
        .login-btn {
          color: black;
          font-size: 1rem;
          padding: 0.5rem 1rem;
          text-decoration: none;
          background: white;
          border-radius: 50px;
          font-weight: 600;
          transition: background 0.2s, color 0.2s;
        }
        .signup-btn {
          color: white;
          font-size: 1rem;
          padding: 0.5rem 1rem;
          text-decoration: none;
          background: black;
          border-radius: 50px;
          font-weight: 600;
          transition: background 0.2s, color 0.2s;
        }
        .login-btn:hover {
          background: #f0f0f0;
        }
        .signup-btn:hover {
          background: #302f2fff;
        }
      `}</style>
      <nav style={styles.nav}>
        <div>
          <Link to="/" style={styles.Home}>
            <b>🍔FoodRoutes🚚</b>
          </Link>
        </div>
        <div style={styles.rightLinks}>
          <Link to="/login" className="login-btn">
            Log in
          </Link>
          <Link to="/Signup" className="signup-btn">
            Sign Up
          </Link>
        </div>
      </nav>
    </>
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
};
export default Navbar