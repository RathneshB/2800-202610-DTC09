import image from '../assets/food.jpg'
import image1 from '../assets/food2.jpg'
import image2 from '../assets/food3.jpg'
import image3 from '../assets/groceries.jpg'
import image4 from '../assets/map.jpg'
import Card from './Card'

const Main = () => {
  return (
    <main style={styles.background}>
      <div>
        <h1>
          <b>🍔FoodRoutes🚚</b>
        </h1>
      </div>
      <div>
        <h2>
          <b>Find Affordable Food Near You</b>
        </h2>
      </div>
      <div style={styles.imageContainer}>
        <img src={image} style={styles.image} />
        <img src={image1} style={styles.image} />
        <img src={image2} style={styles.image} />
      </div>
      <div style={styles.cardContainer}>
        <Card
          title="Find Food Near You"
          description="Search nearby supermarkets, corner stores, and food banks to find the most affordable nearby grocery options in your area. Filter by distance, price, and store type."
          button="Get Started"
          checks={["Free to use", "No signup Needed", "placeholder for now"]}
        />
        <img src={image3} style={styles.image} />
      </div>
      <div style={styles.cardContainer}>
        <img src={image4} style={styles.image} />
        <Card
          title="Live Route Map"
          description="Plan the most efficient trip to affordable food near you. Get live transit direction, walking routes, and bus schedule to save time and money on both food and traveling expenses."
          button="View Map"
          checks={["Live transit routes", "Time estimates", "placeholder for now"]}
        />
      </div>
    </main>
  );
}

const styles = {
  background: {
    backgroundColor: "white",
    paddingTop: '5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  imageContainer: {
    display: "flex",
    padding: "1rem",
    gap: "1rem",
  },
  image: {
    width: '50%',
    height: 'auto',
    overflow: "hidden",
    objectFit: 'cover',
    borderRadius: '16px',
  },
  cardContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    padding: '1rem',
    gap: '1rem',
  },
} as const;

export default Main