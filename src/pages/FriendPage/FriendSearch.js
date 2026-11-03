import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/FriendSearch.css";
import api from "../../Api";
import config from "../../config";
import { toFriendModel } from "./friendModel";
import searchIcon from "../../assets/icon/search.png";

// 검색어가 없을 때 미리 보여줄 사용자 수
const SUGGEST_SIZE = 1;

// 검색 API 요청 (GET /api/follow/search?nickname=&page=&size=)
function requestSearch(nickname, page, signal) {
  return api.get(config.FOLLOW.SEARCH, {
    params: { nickname, page, size: 10 },
    signal,
  });
}

// FriendSearch: 팔로우 요청(검색) 영역 컴포넌트
// FriendPage에서 불려옴
// title: 소제목 (기본값 "팔로우 요청")
// placeholder: 검색창 문구 (기본값 "이름/태그로 검색")
// onFollow: 팔로우 버튼 클릭 시 FriendPage의 followList에 유저를 추가함
// followingList: 현재 팔로우 중인 친구 목록
function FriendSearch({
  title = "팔로우 요청",
  placeholder = "닉네임으로 검색",
  onFollow,
  followingList = [],
  followingId = null,
  followError = "",
  followDisabled = false,
  refreshKey = 0,
}) {
  // useNavigate: 특정 친구를 클릭하면 상세 페이지로 이동
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [results, setResults] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nickname = query.trim();

  // 검색어/페이지가 바뀌면 300ms 뒤 서버에 검색 요청
  useEffect(() => {
    // 검색어가 없으면 팔로우 가능한 사용자를 미리 보여줌 (실패해도 조용히 안내 문구로 대체)
    if (!nickname) {
      let alive = true;
      setTotalPages(0);
      setError("");
      setLoading(false);

      api
        .get(config.FOLLOW.LIST, { params: { page: 0, size: SUGGEST_SIZE } })
        .then(({ data }) => {
          const list = Array.isArray(data?.result?.content)
            ? data.result.content
            : Array.isArray(data?.result)
            ? data.result
            : [];
          if (alive) setResults(list.slice(0, SUGGEST_SIZE).map(toFriendModel));
        })
        .catch(() => {
          if (alive) setResults([]);
        });

      return () => {
        alive = false;
      };
    }

    let active = true;
    const controller = new AbortController();

    setLoading(true);
    setError("");
    setResults([]);

    const timer = setTimeout(async () => {
      try {
        const { data } = await requestSearch(nickname, page, controller.signal);

        if (
          data?.isSuccess === false ||
          !Array.isArray(data?.result?.content) ||
          !Number.isInteger(data.result.totalPages) ||
          data.result.totalPages < 0
        ) {
          throw new Error("검색 응답을 확인해 주세요.");
        }

        if (!active) return;

        if (page > 0 && page >= data.result.totalPages) {
          setPage(Math.max(0, data.result.totalPages - 1));
          return;
        }

        setResults(data.result.content.map(toFriendModel));
        setTotalPages(data.result.totalPages);
      } catch {
        if (active) setError("검색에 실패했습니다. 다시 시도해 주세요.");
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [nickname, page, retryCount, refreshKey]);

  const handleChange = (e) => {
    const nextQuery = e.target.value;
    setQuery(nextQuery);
    if (nextQuery.trim() !== nickname) {
      setPage(0);
      setResults([]);
      setError("");
    }
  };

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
          onChange={handleChange}
          placeholder={placeholder}
        />
      </div>

      {followError && <p role="alert">{followError}</p>}

      {!nickname && results.length === 0 ? (
        <div className="friend-search__empty">검색할 닉네임을 입력해 주세요.</div>
      ) : loading ? (
        <div className="friend-search__empty" role="status">검색 중...</div>
      ) : error ? (
        <div className="friend-search__empty">
          <p role="alert">{error}</p>
          <button type="button" onClick={() => setRetryCount((c) => c + 1)}>
            다시 시도
          </button>
        </div>
      ) : results.length === 0 ? (
        <div className="friend-search__empty">검색 결과가 없습니다.</div>
      ) : (
        <ul className="friend-search__list">
          {results.map((user) => {
            const isFollowing = followingList.some((f) => f.id === user.id);
            const isPending = followingId === user.id;

            return (
              <li key={user.id} className="friend-search__item">
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
                      <img src={user.profileImageUrl} alt="" className="friend-avatar__img" />
                    ) : (
                      <UserIcon />
                    )}
                  </div>

                  <div className="friend-info">
                    <div className="friend-info__top">
                      <span className="friend-info__name">{user.name}</span>
                      {user.tag && <span className="friend-info__tag">#{user.tag}</span>}
                    </div>
                    <div className="friend-info__bio">{user.bio || "한 줄 소개"}</div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`friend-follow-btn ${isFollowing ? "is-disabled" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFollow?.(user);
                  }}
                  disabled={isFollowing || followingId !== null || followDisabled}
                >
                  {isPending ? "처리 중..." : isFollowing ? "팔로잉" : "팔로우"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {nickname && !loading && !error && totalPages > 1 && (
        <div>
          <button
            type="button"
            disabled={page === 0 || followingId !== null}
            onClick={() => setPage((v) => v - 1)}
          >
            이전
          </button>
          <span> {page + 1} / {totalPages} </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages || followingId !== null}
            onClick={() => setPage((v) => v + 1)}
          >
            다음
          </button>
        </div>
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