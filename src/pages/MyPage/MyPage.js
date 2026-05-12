import React from "react";
import Profile from "./Profile";
import Status from "./Status";
import "../../styles/MyPage.css";
import Statistics from "./Status";

const MyPage = () => {
  return (
    <div className="mypage-container">
      <Profile />
      <Statistics />
    </div>
  );
};

export default MyPage;