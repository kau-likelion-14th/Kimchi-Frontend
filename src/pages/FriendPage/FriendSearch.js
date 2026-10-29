import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/FriendSearch.css";
import searchIcon from "../../assets/icon/search.png";

// 임시 더미 데이터
// 검색 시 이 배열에서 필터링해서 결과를 보여줌
const dummyUsers = [
    {
        id: "1",
        userId: 1,
        name: "나나",
        tag: "1234",
        bio: "안녕하세요! 저는 나나입니다.",
        profileImageUrl: null,
    },
    {
        id: "2",
        userId: 2,
        name: "얀",
        tag: "2342",
        bio: "^^",
        profileImageUrl: null,
    },
    {
        id: "3",
        userId: 3,
        name: "지말",
        tag: "1214",
        bio: "ㅎㅎ",
        profileImageUrl: null,
    },
    {
        id: "4",
        userId: 4,
        name: "코다",
        tag: "1223",
        bio: ";ㅁ;",
        profileImageUrl: null,
    },
    {
        id: "5",
        userId: 5,
        name: "딜런",
        tag: "1777",
        bio: ".",
        profileImageUrl: null,
    },
];

// FriendSearch: 팔로우 요청(검색) 영역 컴포넌트
// FriendPage에서 불려옴
// title: 소제목 (기본값 "팔로우 요청")
// placeholder: 검색창 문구 (기본값 "이름/태그로 검색")
// onFollow: 팔로우 버튼 클릭 시 FriendPage의 followList에 유저를 추가함
// followingList: 현재 팔로우 중인 친구 목록
function FriendSearch({
  title = "팔로우 요청",
  placeholder = "이름/태그로 검색",
  onFollow,
  followingList = [],
}) {
  // useNavigate: 특정 친구를 클릭하면 상세 페이지로 이동
  const navigate = useNavigate();

  // query: 검색창에 입력된 텍스트를 저장
  // 초기값은 빈 문자열 -> 입력할 때마다 setQuery로 값이 바뀌고
  // 값이 바뀌면 검색 결과 목록이 바뀜
  const [query, setQuery] = useState("");

  // followingIdSet: followingList 배열을 Set으로 변환
  // Set을 쓰면 "이미 팔로우 중인지" 확인할 때 has()로 빠르게 조회 가능
  // followingList가 바뀔 때만 재계산됨 (useMemo로 성능 최적화)
  const followingIdSet = useMemo(() => {
    return new Set(followingList.map((x) => x.id));
  }, [followingList]);

  // query가 빈 문자열이면 빈 배열 반환하기 때문에 검색 결과가 보이지 않음
  // query가 있으면 이름, 태그, 이름+태그 중 하나라도 포함된 유저를 반환
  // 배열을 map()으로 돌려서 검색 결과 목록을 화면에 띄워줌
  const results = useMemo(() => {
    const q = query.trim();

    if (!q) return [];

    return dummyUsers.filter((user) => {
      return (
        user.name.includes(q) ||
        user.tag.includes(q) ||
        `${user.name}#${user.tag}`.includes(q)
      );
    });
  }, [query]);

  // goFriendDetail 한 명을 클릭하면 상세 페이지로 이동
  const goFriendDetail = (friend) => {
    navigate("/friends/detail", { state: { friend } });
  };

  return (
    <section className="friend-search">
      {/* FriendPage에서 넘겨준 title props -> "팔로우 요청" */}
      <h2 className="friend-search__title">{title}</h2>

      {/* 검색창에 입력할 때마다 onChange로 setQuery를 호출하여 query state를 업데이트함
          query가 바뀌면 목록이 바뀜 */}
      <div className="friend-search__input-box">
        <span className="friend-search__icon" aria-hidden="true">
          <img
            src={searchIcon}
            alt="검색"
            className="friend-search__icon-img"
          />
        </span>

        <input
          className="friend-search__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />
      </div>

      {/* 1. query가 비어있으면 -> 아무것도 안 뚬
          2. query가 있는데 results가 비어있으면 -> "검색 결과가 없습니다"
          3. results가 있으면 -> 유저 목록을 map()으로 순회하여서 보여줌 */}
      {query.trim() === "" ? null : results.length === 0 ? (
        <div className="friend-search__empty">검색 결과가 없습니다.</div>
      ) : (
        <ul className="friend-search__list">
          {results.map((user) => {
            // followingIdSet에 이 유저의 id가 있으면 이미 팔로우 하고 있는 중이고, 이를 "팔로잉"이라고 표시
            const isFollowing = followingIdSet.has(user.id);

            return (
              <li key={user.id} className="friend-search__item">
                {/* 유저 정보 영역: 클릭하면 goFriendDetail 실행 -> 상세 페이지로 이동 */}
                <div
                  className="friend-search__left"
                  role="button"
                  tabIndex={0}
                  onClick={() => goFriendDetail(user)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") goFriendDetail(user);
                  }}
                >
                  <div className="friend-avatar" aria-hidden="true">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt=""
                        className="friend-avatar__img"
                      />
                    ) : (
                      <UserIcon />
                    )}
                  </div>

                  <div className="friend-info">
                    <div className="friend-info__top">
                      <span className="friend-info__name">{user.name}</span>
                      <span className="friend-info__tag">#{user.tag}</span>
                    </div>

                    <div className="friend-info__bio">
                      {user.bio || "한 줄 소개"}
                    </div>
                  </div>
                </div>

                {/* - isFollowing이 true면 "팔로잉" 표시
                    - isFollowing이 false면 클릭 가능, onFollow(user) 실행
                    -> FriendPage의 handleFollow로 전달 -> followList에 이 유저 추가
                    -> followList가 바뀌면 followingIdSet도 재계산돼서 버튼 상태 바뀜 */}
                <button
                  type="button"
                  className={`friend-follow-btn ${
                    isFollowing ? "is-disabled" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFollow?.(user);
                  }}
                  disabled={isFollowing}
                >
                  {isFollowing ? "팔로잉" : "팔로우"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function UserIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z"
        fill="#ffffff"
        opacity="0.9"
      />
      <path
        d="M4 22c0-4.418 3.582-8 8-8s8 3.582 8 8"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default FriendSearch;