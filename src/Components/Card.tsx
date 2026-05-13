import { Link } from "react-router-dom";

interface Props {
  title: string;
  description: string;
  button: string;
  checks: string[];
  // stats: {number: string; label: string}
}
const Card = ({ title, description, button, checks }: Props) => {
  return (
    <>
      <style>{`
        .card-wrap {
          position: relative;
          overflow: hidden;
          transition: transform 0.2s;
        }
        .card-wrap:hover{
          border-color: #3F7D20 !important;
          transform: translateY(-3px);
        }
        .card-btn {
          color: #F3EFF5;
          width: 100%;
          font-size: 1rem;
          font-weight: 600;
          align-items:center;
          box-sizing: border-box;
          padding: 0.5rem 1rem;
          text-decoration: none;
          border-radius: 16px;
          background: #3F7D20;
          display: inline-flex;
          justify-content: space-between;
          margin-top: 1rem;
          transition: background 0.3s;
        }
        .card-btn:hover {
          background: #72B01D;
        }
        .card-btn:hover .card-arrow {
          transform: translateX(8px);
        }
        .card-arrow {
          transition: transform 0.2s;
        }
      `}</style>
      <div style={styles.cardContainer} className="card-wrap">
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.desc}>{description}</p>
        <div style={styles.checkList}>
          {checks.map((item, i) => (
            <span key={i} style={styles.checkItems}>✓ {item}</span>
          ))}
        </div>
        <div style={styles.divider}></div>
        <Link to="/" className="card-btn">
          {button}
          <span className="card-arrow"> →</span>
        </Link>
      </div>
    </>
  );
};

const styles = {
  cardContainer: {
    // width: "45%",
    flex: 1,
    display: "flex",
    padding: "1rem",
    flexDirection: "column",
    gap: "1rem",
    border: "1.5px solid #72B01D",
    borderTop: "8px solid #72B01D",
    backgroundColor: "#E6E6FA",
    borderRadius: "16px",
    alignItems: "flex-start",
    textAlign: "left",
  },
  title: {
    color: "#0D0A0B",
    fontSize: "2rem",
    fontWeight: "700",
    margin: 0,
  },
  desc: {
    color: "#0D0A0B",
    fontSize: "1rem",
    fontWeight: "400",
    lineHeight: 1.65,
    margin: 0,
  },
  divider: {
    height: "1px",
    background: "#72B01D",
    margin: "4px 0",
    width: "100%",
  },
  checkList: {
    display: "flex",
    flexDirection: "column",
  },
  checkItems: {
    color: "#3F7D20",
    gap: "6px",
    fontWeight: "600",
  },
} as const;
export default Card;
