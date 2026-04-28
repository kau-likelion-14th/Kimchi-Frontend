import "../styles/Footer.css";
import logo from "../assets/image/LTE.png";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <img src={logo} alt="LTE 로고" className="footer-logo" />
        <span className="footer-title">Lion To-do Everyday</span>
      </div>

      <p className="footer-description">
        LTE는 멋쟁이 사자처럼에서 개발한 투두 관리 기반의 웹서비스입니다.
      </p>

      <div className="footer-info">
        <div className="footer-row">
          <span>상호명 멋쟁이사자처럼</span>
          <span>대표자 전유안</span>
          <span>주소 경기도 고양시 항공대학교76 항공우주센터 3층 창업카페</span>
        </div>

        <div className="footer-row">
          <span>사업자등록번호 333-22-55555</span>
          <span>개인정보보호책임자 전유안</span>
          <span>개인정보보호책임자 전유안</span>
          <span>이메일 kimyena4930@naver.com</span>
          <span>전화번호 010-4276-4930</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;