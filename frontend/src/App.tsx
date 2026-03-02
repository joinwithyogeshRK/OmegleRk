import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Room from "./components/Room";

function App() {
  console.log("Room instance:", Math.random());
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
