import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'
import "../styles/Calendar.css"
import React, { useState } from 'react';

const toDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

export default function CustomCalendar({
    initialDate = new Date(),
    onDateChange,
    onMonthChange,
    remainingByDate = {}, // 서버에서 받은 { "YYYY-MM-DD": { hasTodo, remaining } }
}) {
    const [selectedDate, setSelectedDate] = useState(initialDate);

    const handledDateChange = (value) => {
        const next = value instanceof Date ? value : value?.[0];
        setSelectedDate(next);
        onDateChange?.(next);
    };

    // 데이터가 없는 날짜(표시 X)와 remaining이 0인 날짜(★)를 구분
    const getDayMeta = (date) => {
        const day = remainingByDate[toDateKey(date)];
        const hasTodos = day?.hasTodo === true;
        const remaining = day?.remaining ?? 0;
        return { hasTodos, remaining, allDone: hasTodos && remaining === 0 };
    };

    return (
        <div className="calendar-container">
            <Calendar
                onChange={handledDateChange}
                onActiveStartDateChange={({ activeStartDate }) => onMonthChange?.(activeStartDate)}
                value={selectedDate}
                calendarType='gregory'
                view='month'
                prev2Label={null}
                next2Label={null}
                showNeighboringMonth={true}
                formatDay={(locale, date) => String(date.getDate())}
                tileContent={({ date, view }) => {
                    if (view !== 'month') return null;
                    const { hasTodos, remaining, allDone } = getDayMeta(date);
                    if (!hasTodos) return null;

                    return (
                        <div className="tile-meta">
                            {allDone ? "★" : remaining}
                        </div>
                    );
                }}
                tileClassName={({ date, view }) => {
                    if (view !== 'month') return "";
                    const { hasTodos, allDone } = getDayMeta(date);
                    if (!hasTodos) return "";
                    return allDone ? "tile-done" : "tile-has";
                }}
            />
        </div>
    );
}
