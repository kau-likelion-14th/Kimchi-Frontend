import MainPage from "./pages/Mainpage.js";
import MyPage from "./pages/MyPage/MyPage";
import FriendPage from "./pages/FriendPage/FriendPage.js"
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import React from 'react';
import LoginPage from './pages/LoginPage/LoginPage';
import FriendDetailPage from './pages/FriendPage/FriendDetailPage';


function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div>
      {!isLoginPage && <Header />}

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/friends" element={<FriendPage />} />
        <Route path="/friends/:id" element={<FriendDetailPage />} />
      </Routes>

      {!isLoginPage && <Footer />}
    </div>
  );
}

export default App;