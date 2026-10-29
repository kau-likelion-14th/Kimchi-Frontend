import React, { useMemo } from "react";

import "../../styles/Todo.css";
import "../../styles/FriendTodo.css";

// 친구 상세 페이지에서 보여줄 임시 투두 데이터
const dummyTodos = [
  { id: 1, text: "프론트 보충자료 읽기", category: "공부", completed: true },
  { id: 2, text: "FriendTodo 구현하기", category: "공부", completed: false },
  { id: 3, text: "동아리 회의", category: "동아리", completed: false },
];

// 카테고리별 배경색/글자색 설정
// todo-category에 style로 직접 적용됨
const dummyCategories = {
  공부: { backgroundColor: "#E5F8F1", color: "#333" },
  일상: { backgroundColor: "#FFC8BE", color: "#333" },
  동아리: { backgroundColor: "#B6DAFF", color: "#333" },
};

// FriendTodo: 친구 상세 페이지에서 그 친구의 투두 목록을 보여주는 컴포넌트
// title: 투두 리스트 제목 (기본값 "To do List")
const FriendTodo = ({ title = "To do List" }) => {
  const todos = dummyTodos;
  const categories = dummyCategories;

  // counts: 전체 투두 개수와 완료된 투두 개수를 계산
  // todos가 바뀔 때만 다시 계산됨
  // 현재는 화면에 표시하진 않지만 추후 진행률 표시 등에 활용 가능
  const counts = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.completed).length; // completed가 true인 것만 셈
    return { total, done };
  }, [todos]);

  return (
    <div className="friend-todo">
      <div className="todo-container">
        <div className="todo-header">
          {/* 부모에서 넘겨준 title을 표시, 기본값은 "To do List" */}
          <div className="todo-title">{title}</div>
        </div>

        <div className="todo-list">
          {/* 투두가 없으면 안내 문구 표시, 있으면 map()으로 순회하며 하나씩 렌더링 */}
          {todos.length === 0 ? (
            <div className="friend-todo__empty">등록된 투두가 없습니다.</div>
          ) : (
            todos.map((t) => (
              // completed가 true면 "done" 클래스 추가 → CSS에서 취소선 등 완료 스타일 적용
              <div key={t.id} className={`todo-item ${t.completed ? "done" : ""}`}>
                {/* completed 여부에 따라 체크박스 스타일이 달라짐 */}
                <div className={`checkbox ${t.completed ? "checked" : ""}`} />
                <div className="todo-text">{t.text}</div>
                {/* 카테고리 이름으로 dummyCategories에서 색상을 찾아 인라인 스타일로 적용
                    해당 카테고리가 없으면 undefined -> 기본 스타일 유지 */}
                <div
                  className="todo-category"
                  style={categories[t.category] ?? undefined}
                >
                  {t.category}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendTodo;