import image from "../assets/food.jpg";
import image1 from "../assets/food2.jpg";
import image2 from "../assets/food3.jpg";
import Card from "./Card";

const Main = () => {
  return (
    <main style={styles.background}>
      <div>
        <h1>🍔FoodRoutes🚚</h1>
      </div>
      <div>
        <h2>Find affordable food near you</h2>
      </div>
      <div style={styles.imageContainer}>
        <img src={image} style={styles.image} />
        <img src={image1} style={styles.image} />
        <img src={image2} style={styles.image} />
      </div>
      <div style={styles.cardContainer}>
        <Card
          title="Main feature 1"
          description="Placeholder nonsense yes because of that reason we are creating this app to allow user to do this and that"
          button="Get Started"
        />
        <img src={image} style={styles.image} />
      </div>
      <div style={styles.cardContainer}>
        <img src={image} style={styles.image} />
        <Card
          title="Main Feature 2"
          description="Placeholder nonsense yes because of that reason we are creating this app to allow user to do this and that"
          button="View Map"
        />
      </div>
    </main>
  );
};

const styles = {
  background: {
    backgroundColor: "#E6E6FA",
    paddingTop: "3rem",
  },
  imageContainer: {
    display: "flex",
    padding: "1rem",
    gap: "1rem",
  },
  image: {
    overflow: "hidden",
  },
  cardContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: "4rem",
    padding: "1rem",
    gap: "1rem",
  },
};

export default Main;
