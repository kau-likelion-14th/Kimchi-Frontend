import React, { useEffect } from "react";
import "../../styles/FriendUnfollowModal.css";

// FriendUnfollowModal: 팔로우 삭제 확인 모달 컴포넌트
// FriendPage에서 불려옴
// isOpen: 모달을 열지 닫을지 결정 (true면 화면에 표시, false면 아무것도 안 뜸)
// friend: 삭제하려는 친구 정보 (이름, 태그 표시에 사용)
// onConfirm: "예" 버튼 클릭 시 -> FriendPage의 handleConfirmRemove 실행 -> 팔로우 목록에서 삭제
// onClose: "아니오" 버튼 또는 바깥 클릭 시 -> 모달 닫기
function FriendUnfollowModal({ isOpen, friend, onConfirm, onClose }) {

  // 모달이 열려있을 때 ESC 키를 누르면 모달이 닫히도록 키보드 이벤트 등록
  // isOpen이 false면 이벤트 등록 안 함
  // 모달이 닫히거나 컴포넌트가 사라질 때 이벤트를 제거해서 중복 등록 방지
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // isOpen이 false면 아무것도 렌더링하지 않음 -> 화면에 모달이 안 보임
  if (!isOpen) return null;

  // friend 정보가 없을 경우를 대비해 기본값 처리
  // friend가 null이면 빈 문자열로 표시
  const displayName = friend?.name ?? "";
  const displayTag = friend?.tag ? `#${friend.tag}` : "";

  // 모달 바깥(overlay) 클릭 시 모달 닫기
  // e.target(클릭한 요소)이 e.currentTarget(overlay 자체)일 때만 닫힘
  // 모달 내부를 클릭했을 때는 닫히지 않음
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    // overlay 클릭 시 handleOverlayClick 실행 -> 모달 바깥 클릭하면 닫힘
    <div className="friend-unfollow-modal__overlay" onClick={handleOverlayClick}>
      <div
        className="friend-unfollow-modal__content"
        role="dialog"
        aria-modal="true"
      >
        {/* 삭제하려는 친구의 이름과 태그를 보여줌 */}
        <p className="friend-unfollow-modal__text">
          <span className="friend-unfollow-modal__name">{displayName}</span>{" "}
          <span className="friend-unfollow-modal__tag">{displayTag}</span>
          님을 팔로우 목록에서
          <br />
          삭제하시겠습니까?
        </p>

        <div className="friend-unfollow-modal__actions">
          {/* "예" 클릭 -> onConfirm 실행 -> FriendPage의 handleConfirmRemove
              -> followList에서 해당 친구 제거 -> 모달 닫힘 */}
          <button
            type="button"
            className="friend-unfollow-modal__btn friend-unfollow-modal__btn--yes"
            onClick={onConfirm}
          >
            예
          </button>

          {/* "아니오" 클릭 -> onClose 실행 -> 모달만 닫히고 팔로우 목록은 그대로 유지 */}
          <button
            type="button"
            className="friend-unfollow-modal__btn friend-unfollow-modal__btn--no"
            onClick={onClose}
          >
            아니오
          </button>
        </div>
      </div>
    </div>
  );
}

export default FriendUnfollowModal;