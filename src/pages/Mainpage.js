import "../styles/MainPage.css";
import Todo from "../components/Todo";
import React, { useEffect, useState } from "react";
import CustomCalendar from "../components/Calendar";
import { get } from "../Api";
import config from "../config";

const toDateKey = (date) => { // 날짜 객체를 "YYYY-MM-DD" 문자열로 바꾸는 함수
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const MainPage = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date()); // 선택된 날짜
  const [viewDate, setViewDate] = useState(() => new Date()); // 캘린더에 보이는 월
  const [todos, setTodos] = useState([]); // 선택한 날짜의 Todo 목록 (서버 데이터)
  const [remainingByDate, setRemainingByDate] = useState({}); // { "2026-11-07": { hasTodo, remaining } }
  const [refreshKey, setRefreshKey] = useState(0); // 완료 상태 변경 후 재조회용

  const dateKey = toDateKey(selectedDate);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  // 날짜별 Todo 조회
  useEffect(() => {
    let active = true;

    const fetchTodos = async () => {
      try {
        const response = await get(config.TODOS.LIST, { date: dateKey });
        const list = Array.isArray(response?.result) ? response.result : [];
        if (!active) return;
        setTodos(
          list.map((todo) => ({
            id: todo.todoId,
            text: todo.description,
            category: todo.categoryName,
            completed: todo.completed,
          }))
        );
      } catch (error) {
        console.error("Todo 목록 조회 실패:", error);
        if (active) setTodos([]);
      }
    };

    fetchTodos();
    return () => {
      active = false;
    };
  }, [dateKey, refreshKey]);

  // 월별 캘린더 조회
  useEffect(() => {
    let active = true;

    const fetchCalendar = async () => {
      try {
        const response = await get(config.CALENDAR.GET, { year, month });
        const days = Array.isArray(response?.result?.days) ? response.result.days : [];
        if (!active) return;
        setRemainingByDate(
          Object.fromEntries(
            days.map((day) => [day.date, { hasTodo: day.hasTodo, remaining: day.remaining }])
          )
        );
      } catch (error) {
        console.error("캘린더 조회 실패:", error);
        if (active) setRemainingByDate({});
      }
    };

    fetchCalendar();
    return () => {
      active = false;
    };
  }, [year, month, refreshKey]);

  return (
    <div className="mainpage-container">
      <CustomCalendar
        initialDate={selectedDate}
        onDateChange={(date) => date && setSelectedDate(date)}
        onMonthChange={(date) => date && setViewDate(date)}
        remainingByDate={remainingByDate}
      />
      <Todo
        selectedDate={selectedDate}
        todos={todos}
        setTodos={setTodos}
        onCompleteChanged={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
};

export default MainPage;
