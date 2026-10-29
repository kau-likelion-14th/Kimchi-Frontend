import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import React, { useState } from "react";
import "../../styles/Calendar.css";

// 날짜 객체를 "2026-05-04" 형태의 문자열로 변환
// dummyTodosByDate의 key가 이 형식이라 날짜 조회할 때 사용
const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// 날짜별 투두 목록 임시 데이터
// 실제 서비스에서는 API에서 받아올 예정
// key: 날짜 문자열, value: 그 날의 투두 배열
const dummyTodosByDate = {
  "2026-05-04": [
    { id: 1, title: "프론트 보충자료 읽기", completed: true },
    { id: 2, title: "FriendCalendar 주석 달기", completed: false },
  ],
  "2026-05-06": [
    { id: 3, title: "친구 페이지 과제 제출", completed: true },
  ],
  "2026-05-10": [
    { id: 4, title: "React 복습하기", completed: false },
    { id: 5, title: "props 정리하기", completed: false },
    { id: 6, title: "useState 정리하기", completed: true },
  ],
};

// FriendCalendar: 친구 상세 페이지에서 보여주는 캘린더 컴포넌트
// 날짜 칸에 투두 현황(남은 개수 or 완료 별★)을 표시함
export default function FriendCalendar() {

  // selectedDate: 현재 선택된 날짜
  // 날짜를 클릭하면 setSelectedDate로 값이 바뀌고 -> 캘린더에서 해당 날짜가 선택됨
  const [selectedDate, setSelectedDate] = useState(new Date());

  // handleDateChange: 캘린더에서 날짜를 클릭했을 때 실행
  // value가 Date 객체면 그대로, 배열이면 첫 번째 날짜를 꺼내서 selectedDate 업데이트
  const handleDateChange = (value) => {
    const next = value instanceof Date ? value : value?.[0];
    if (!next) return;
    setSelectedDate(next);
  };

  // getDayMeta: 특정 날짜의 투두 현황을 계산해서 반환
  // toDateKey로 날짜를 변환 -> dummyTodosByDate에서 해당 날짜 투두 조회
  // - 투두가 없으면 -> hasTodos: false
  // - 투두가 있으면 -> 미완료 개수(remaining) 계산
  //   - remaining이 0이면 allDone: true -> 캘린더에 ★ 표시
  //   - remaining이 있으면 -> 캘린더에 숫자로 표시
  const getDayMeta = (date) => {
    const key = toDateKey(date);
    const list = dummyTodosByDate[key] ?? [];
    if (list.length === 0) {
      return { hasTodos: false, remaining: 0, allDone: false };
    }
    const remaining = list.filter((todo) => !todo.completed).length;
    return {
      hasTodos: true,
      remaining,
      allDone: remaining === 0,
    };
  };

  return (
    <div className="calendar-container">
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        calendarType="gregory"
        view="month"
        prev2Label={null}
        next2Label={null}
        showNeighboringMonth={true}
        // 날짜 숫자만 표시 (요일 등 불필요한 텍스트 제거)
        formatDay={(locale, date) => String(date.getDate())}

        // tileContent: 각 날짜 칸 안에 추가로 보여줄 내용
        // getDayMeta로 해당 날짜 투두 현황 조회
        // - 투두 없으면 -> 아무것도 안 보임
        // - 모두 완료면 -> ★ 표시
        // - 미완료가 있으면 -> 남은 개수 숫자 표시
        tileContent={({ date, view }) => {
          if (view !== "month") return null;
          const { hasTodos, remaining, allDone } = getDayMeta(date);
          if (!hasTodos) return null;
          return <div className="tile-meta">{allDone ? "★" : remaining}</div>;
        }}

        // tileClassName: 각 날짜 칸에 CSS 클래스를 동적으로 적용
        // - 투두 없으면 -> 기본 스타일
        // - 모두 완료면 -> "tile-done" 클래스 (초록색 등 완료 스타일)
        // - 미완료가 있으면 -> "tile-has" 클래스 (강조 스타일)
        tileClassName={({ date, view }) => {
          if (view !== "month") return "";
          const { hasTodos, allDone } = getDayMeta(date);
          if (!hasTodos) return "";
          return allDone ? "tile-done" : "tile-has";
        }}
      />
    </div>
  );
}