import { BrowserRouter} from "react-router-dom"
import Navbar from "./Components/Navbar"
import Main from "./Components/Main";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Main />
    </BrowserRouter>
  );
}

export default App
