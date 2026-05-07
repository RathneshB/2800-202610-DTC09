import { BrowserRouter } from "react-router-dom"
import Navbar from "./Components/Navbar"
import Main from "./Components/Main";
import Footer from "./Components/footer";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Main />
      <Footer />
    </BrowserRouter>
  );
}

export default App
