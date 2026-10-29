import "../styles/Header.css";
import logo from "../assets/image/LTE.png";
import LogoutIcon from "../assets/icon/logout.png"
import { NavLink, useNavigate } from "react-router-dom";
import api from "../Api";
import config from "../config";
import { useEffect, useState } from "react";

// localStorage에 저장된 사용자 이름 읽기
const readUserName = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "null")?.username || "";
    } catch {
        return "";
    }
};

function Header() {
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);
    const [userName, setUserName] = useState(readUserName);

    useEffect(() => {
        const handleAuthChanged = () => setUserName(readUserName());
        window.addEventListener("auth:changed", handleAuthChanged);
        return () => window.removeEventListener("auth:changed", handleAuthChanged);
    }, []);

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);

        try {
            await api.post(config.AUTH.LOGOUT, {});
        } catch (e) {
            console.error("서버 로그아웃 실패", e);
        } finally {
            // 서버 요청 성공 여부와 관계없이 로컬 인증 정보 삭제
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("auth:changed"));
            setLoggingOut(false);
            navigate("/login", { replace: true });
        }
    };

    return (
        <header className="header">
            {/*로고*/}
            <div className="header-left">
                <img src={logo} alt="LTE 로고" className="header-logo"/>
                <span className="header-title">Lion To-do Evryday</span>
            </div>

            {/*메뉴*/}
            <nav className="header-nav">  
                <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    홈
                </NavLink>

                <NavLink to="/friends" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    친구
                </NavLink>

                <NavLink to="/mypage" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    마이페이지
                </NavLink>
            </nav>
            
            {/*사용자 정보*/}
            <div className="header-right">
                <span className="user-name">{userName ? `${userName}님` : ""}</span>
                <img src={LogoutIcon} alt="로그아웃" className="logout-icon" onClick={handleLogout}/>
            </div>

        </header>
    );
}

export default Header;