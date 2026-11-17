import "../styles/Todo.css";
import TodoModal from "./TodoModal";
import React, { useEffect, useMemo, useState } from "react";
import { get, post, put, del, patch } from "../Api";
import config from "../config";

// 카테고리별 색상 (서버 응답에는 색상이 없으므로 이름 기준으로 매핑)
const CATEGORY_COLORS = {
    공부: '#E5F8F1',
    운동: '#FFC8BE',
    일상: '#FFC8BE',
    동아리: '#B6DAFF',
};
const FALLBACK_COLORS = ['#E5F8F1', '#FFC8BE', '#B6DAFF', '#FFF2B6', '#E3D7FF'];

const getCategoryStyle = (name, index = 0) => ({
    backgroundColor: CATEGORY_COLORS[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    color: '#333',
});

const toDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const Todo = ({ selectedDate, todos = [], onCompleteChanged }) => {
    const dateKey = toDateKey(selectedDate);

    const [serverCategories, setServerCategories] = useState([]); // 서버에서 받은 카테고리 목록
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달이 열렸는지 여부
    const [editingTodo, setEditingTodo] = useState(null); // 지금 수정 중인 할 일 정보 (새로 만들 때는 null)
    const [pendingIds, setPendingIds] = useState(() => new Set()); // 완료 상태 변경 요청 중인 Todo

    // 카테고리 조회
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await get(config.CATEGORIES.GET);
                setServerCategories(Array.isArray(response?.result) ? response.result : []);
            } catch (error) {
                console.error("카테고리 조회 실패:", error);
            }
        };

        fetchCategories();
    }, []);

    // { 카테고리명: 스타일 } 형태로 변환
    const categoryStyles = useMemo(
        () =>
            Object.fromEntries(
                serverCategories.map((c, i) => [c.categoryName, getCategoryStyle(c.categoryName, i)])
            ),
        [serverCategories]
    );

    const categoryNames = useMemo(
        () => serverCategories.map((c) => c.categoryName),
        [serverCategories]
    );

    const openModal = () => { // [+] 버튼 눌렀을 때 (새로 만들기)
        setEditingTodo(null);
        setIsModalOpen(true);
    };

    const openEditModal = (todo) => { // 이미 있는 할 일을 클릭했을 때 (수정하기)
        setEditingTodo(todo);
        setIsModalOpen(true);
    };

    // 체크박스 클릭 시 서버에 완료 상태 변경 요청 → 성공하면 Todo 목록과 캘린더 재조회
    const TodoCompleted = async (todo) => {
        if (pendingIds.has(todo.id)) return;
        setPendingIds((prev) => new Set(prev).add(todo.id));

        try {
            await patch(config.TODOS.TOGGLE_COMPLETE(todo.id, dateKey), {
                completed: !todo.completed,
            });
            onCompleteChanged?.();
        } catch (error) {
            // 실패 시 로컬 상태를 바꾸지 않으므로 완료된 것처럼 보이지 않음
            console.error("완료 상태 변경 실패:", error);
            alert("완료 상태를 변경하지 못했습니다.");
        } finally {
            setPendingIds((prev) => {
                const next = new Set(prev);
                next.delete(todo.id);
                return next;
            });
        }
    };

    // 저장 버튼: 수정 모드면 PUT, 새로 만들기면 POST → 성공하면 Todo 목록과 캘린더 재조회
    const handledSaveTodo = async ({ text, category }) => {
        const body = {
            categoryName: category,
            description: text,
            routineEnabled: false, // 루틴은 아직 서버 형식(week 단일값)과 맞지 않아 일반 Todo로만 저장
        };

        try {
            if (editingTodo) {
                await put(config.TODOS.UPDATE(editingTodo.id), body);
            } else {
                await post(config.TODOS.CREATE, body, { params: { date: dateKey } });
            }
            setIsModalOpen(false);
            onCompleteChanged?.();
        } catch (error) {
            console.error("Todo 저장 실패:", error);
            alert(error.response?.data?.message || "할 일을 저장하지 못했습니다.");
        }
    };

    // 삭제 버튼: 선택한 날짜 기준으로 삭제 → 성공하면 재조회
    const handledDeleteTodo = async () => {
        if (!editingTodo) return;

        try {
            await del(config.TODOS.DELETE(editingTodo.id, dateKey));
            setIsModalOpen(false);
            onCompleteChanged?.();
        } catch (error) {
            console.error("Todo 삭제 실패:", error);
            alert(error.response?.data?.message || "할 일을 삭제하지 못했습니다.");
        }
    };

    return (
        <div className="todo-container">
            <div className="todo-header">
                <div className="todo-title">To do List</div>
                <button className="todo-add" onClick={openModal}>+</button>
            </div>
            <div className="todo-list">
                {todos.map((t) => (
                    <div
                        key={t.id}
                        className={`todo-item ${t.completed ? 'done' : ''}`}
                        onClick={() => openEditModal(t)}
                    >
                        <button
                            className={`checkbox ${t.completed ? 'checked' : ''}`}
                            disabled={pendingIds.has(t.id)}
                            onClick={(e) => {
                                e.stopPropagation(); // 수정 모달이 함께 열리지 않도록
                                TodoCompleted(t);
                            }}
                        >
                        </button>
                        <div className="todo-text">{t.text}</div>
                        <div
                            className="todo-category"
                            style={categoryStyles[t.category] ?? getCategoryStyle(t.category)}
                        >
                            {t.category}
                        </div>
                    </div>
                ))}
            </div>
            <TodoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handledSaveTodo}
                onDelete={handledDeleteTodo}
                initialTodo={editingTodo}
                categories={categoryNames}
            />
        </div>
    );
};

export default Todo;
