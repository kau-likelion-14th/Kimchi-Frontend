import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import FriendCalendar from "./FriendCalendar";
import FriendTodo from "./FriendTodo";

import "../../styles/FriendDetailPage.css";

// 카테고리별 배경색/글자색 설정
// 투두 항목의 카테고리 태그에 인라인 스타일로 적용됨
const Categories = {
  공부: { backgroundColor: "#E5F8F1", color: "#333" },
  일상: { backgroundColor: "#FFC8BE", color: "#333" },
  동아리: { backgroundColor: "#B6DAFF", color: "#333" },
};

// 날짜 객체를 "2026-05-04" 형태의 문자열로 변환
// todosByDate, remainingByDate의 key가 이 형식이라 날짜 조회할 때 사용
const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// 친구 상세 페이지에서 쓸 임시 데이터
// 실제 서비스에서는 API에서 받아올 예정
const dummyFriend = {
  followId: "1",
  name: "나나",
  tag: "1234",
  bio: "안녕하세요! 저는 나나입니다.",
  profileImage: null,
};

// 친구가 저장한 노래 목록 (현재는 가장 최근 1곡만 화면에 표시)
const dummySavedSongs = [
  {
    id: 1,
    title: "Ditto",
    artist: "NewJeans",
    imageUrl: null,
  },
];

// 날짜별 투두 목록
// key가 날짜 문자열, value가 그 날의 투두 배열
// 캘린더에서 날짜를 클릭하면 해당 key로 조회해서 투두를 보여줌
const dummyTodosByDate = {
  "2026-05-04": [
    { id: 1, text: "프론트 보충자료 읽기", category: "공부", completed: true },
    { id: 2, text: "FriendDetailPage 주석 달기", category: "공부", completed: false },
  ],
  "2026-05-06": [
    { id: 3, text: "친구 페이지 과제 제출", category: "동아리", completed: true },
  ],
  "2026-05-10": [
    { id: 4, text: "React 복습하기", category: "공부", completed: false },
    { id: 5, text: "동아리 회의", category: "동아리", completed: false },
    { id: 6, text: "산책하기", category: "일상", completed: true },
  ],
};

// 날짜별 남은 투두 개수
// 캘린더에서 각 날짜 칸에 "남은 개수" 표시할 때 사용
const dummyRemainingByDate = {
  "2026-05-04": { hasTodo: true, remaining: 1 },
  "2026-05-06": { hasTodo: true, remaining: 0 },
  "2026-05-10": { hasTodo: true, remaining: 2 },
};

// FriendDetailPage: 친구 한 명의 상세 정보를 보여주는 페이지
// FriendList에서 친구 클릭 -> navigate로 이동하면서 friend 데이터를 같이 넘겨줌
// 넘겨받은 데이터가 없으면 dummyFriend로 대체
function FriendDetailPage() {
  const navigate = useNavigate();

  // location.state: FriendList에서 navigate할 때 같이 넘긴 friend 데이터
  // 직접 URL로 접근하면 state가 없으므로 null 처리
  const location = useLocation();
  const passedFriend = location.state?.friend ?? null;

  // friend: 넘겨받은 친구 데이터, 없으면 더미 데이터 사용
  // savedSongs: 친구가 저장한 노래 목록
  const [friend] = useState(passedFriend ?? dummyFriend);
  const [savedSongs] = useState(dummySavedSongs);

  // selectedDate: 캘린더에서 현재 선택된 날짜 -> 이 날짜의 투두를 오른쪽에 보여줌
  // viewDate: 현재 캘린더에 표시 중인 월 (월 이동 시 업데이트)
  const [selectedDate, setSelectedDate] = useState(new Date("2026-05-04"));
  const [viewDate, setViewDate] = useState(new Date("2026-05-04"));

  const [todosByDate] = useState(dummyTodosByDate);
  const [remainingByDate] = useState(dummyRemainingByDate);

  // latestSong: savedSongs 배열의 첫 번째 곡 (가장 최근 저장한 곡)
  // savedSongs가 비어있으면 null -> "저장한 곡이 없습니다" 표시
  const latestSong = useMemo(() => {
    if (!Array.isArray(savedSongs) || savedSongs.length === 0) return null;
    return savedSongs[0];
  }, [savedSongs]);

  // todos: 선택된 날짜(selectedDate)에 해당하는 투두 목록
  // selectedDate가 바뀔 때마다 toDateKey로 날짜를 변환 -> todosByDate에서 조회
  // 해당 날짜에 투두가 없으면 빈 배열 반환 -> "등록된 투두가 없습니다" 표시
  const todos = useMemo(() => {
    const key = toDateKey(selectedDate);
    return todosByDate[key] ?? [];
  }, [selectedDate, todosByDate]);

  return (
    <div className="friend-detail-page">
      <div className="friend-detail-page__inner">
        <div className="friend-detail-page__top">
          {/* 뒤로가기 버튼: 클릭하면 navigate(-1) -> 이전 페이지(친구 목록)로 돌아감 */}
          <button
            type="button"
            className="friend-detail-page__back"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
          >
            ‹
          </button>

          <div className="friend-detail-page__profile">
            <div className="friend-detail-page__avatar" aria-hidden="true">
              {/* profileImage가 있으면 이미지, 없으면 기본 SVG 아이콘 표시 */}
              {friend?.profileImage ? (
                <img
                  src={friend.profileImage}
                  alt="profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <UserIcon />
              )}
            </div>

            <div className="friend-detail-page__profile-info">
              <div className="friend-detail-page__name-line">
                <span className="friend-detail-page__name">
                  {friend?.name || " "}
                </span>
              </div>
              {/* bio가 없으면 "한 줄 소개" 표시 */}
              <div className="friend-detail-page__bio">
                {friend?.bio || "한 줄 소개"}
              </div>
            </div>
          </div>

          <div className="friend-detail-page__songs-inline">
            {/* latestSong이 있으면 곡 정보 표시, 없으면 안내 문구 표시 */}
            {latestSong ? (
              <div className="friend-detail-page__song-inline-item">
                <div className="friend-detail-page__song-inline-cover">
                  {/* 앨범 이미지가 있으면 표시, 없으면 아무것도 안 보임 */}
                  {latestSong?.imageUrl ? (
                    <img
                      src={latestSong.imageUrl}
                      alt={latestSong.title || "album"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  ) : null}
                </div>

                <div className="friend-detail-page__song-inline-info">
                  <div className="friend-detail-page__song-inline-title">
                    {latestSong?.title || "제목 없음"}
                  </div>
                  <div className="friend-detail-page__song-inline-artist">
                    {latestSong?.artist || "아티스트 정보 없음"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="friend-detail-page__songs-inline-empty">
                저장한 곡이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="friend-detail-page__grid">
          <div className="friend-detail-page__calendar">
            {/* FriendCalendar에 날짜 데이터를 넘겨줌
                onDateChange: 날짜 클릭 시 -> selectedDate 업데이트 -> todos 재계산 -> 오른쪽 투두 목록 바뀜
                onMonthChange: 월 이동 시 -> viewDate 업데이트 */}
            <FriendCalendar
              initialDate={selectedDate}
              onDateChange={(date) => date && setSelectedDate(date)}
              onMonthChange={(date) => {
                if (!date) return;
                setViewDate(date);
              }}
              todosByDate={todosByDate}
              remainingByDate={remainingByDate}
            />
          </div>

          <div className="friend-detail-page__todo">
            {/* FriendTodo에 selectedDate 기준으로 조회한 todos를 넘겨줌
                캘린더에서 날짜를 바꾸면 todos가 바뀌고 -> 여기 목록도 바뀜 */}
            <FriendTodo
              title="To do List"
              todos={todos}
              categories={Categories}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// UserIcon: 프로필 이미지가 없을 때 보여주는 기본 SVG 아이콘
function UserIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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

export default FriendDetailPage;