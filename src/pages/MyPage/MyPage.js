import React from "react";
import Profile from "./Profile";
import Status from "./Status";
import "../../styles/MyPage.css";


const MyPage = () => {
  return (
    <main className="mypage">
      <Profile />
      <Status />
    </main>
  );
};

export default MyPage;