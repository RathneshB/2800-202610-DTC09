import { Link } from "react-router-dom";

interface Props {
  title: string;
  description: string;
  button: string;
}
const Card = ({ title, description, button }: Props) => {
  return (
    <div style={styles.cardContainer}>
      <h2>{title}</h2>
      <p>{description}</p>
      <div>
        <Link to="/" style={styles.Links}>{button}</Link>
      </div>
    </div>
  );
};

const styles = {
  cardContainer: {
    display: "flex",
    justifyContent: "left",
    padding: "2rem",
    flexDirection: "column",
    border: "1px solid #72B01D",
    backgroundColor: "#a6e44fff",
    width: '50%',
  },
  Links: {
    color: "white",
    fontSize: "1rem",
    padding: "0.5rem",
    textDecoration: "none",
  },
};
export default Card;
