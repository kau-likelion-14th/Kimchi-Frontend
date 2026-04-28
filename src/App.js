import MainPage from "./pages/Mainpage.js";
import MyPage from "./pages/MyPage/MyPage";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="app">
      <Header />

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;