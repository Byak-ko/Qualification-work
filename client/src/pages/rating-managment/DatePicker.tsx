import React, { useState, useEffect, useRef } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  label?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  placeholder = "Виберіть дату",
  className = "",
  minDate,
  maxDate,
  disabled = false,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(selected || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(selected);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedDate(selected);
  }, [selected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  const monthNames = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (minDate && newDate < minDate) return;
    if (maxDate && newDate > maxDate) return;
    
    setSelectedDate(newDate);
    onChange(newDate);
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      selectedDate &&
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(null);
    onChange(null);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    
    const calendar = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendar.push(
        <div key={`empty-${i}`} className="h-8 w-8"></div>
      );
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDisabled(day);
      calendar.push(
        <button
          key={day}
          onClick={() => !disabled && handleSelectDate(day)}
          disabled={disabled}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm
            ${isSelected(day) ? 'bg-blue-600 text-white' : ''}
            ${isToday(day) && !isSelected(day) ? 'border border-blue-500 text-blue-600' : ''}
            ${disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-100'}
          `}
        >
          {day}
        </button>
      );
    }
    
    return calendar;
  };

  const handleSetToday = () => {
    const today = new Date();
    if (
      (minDate && today < minDate) || 
      (maxDate && today > maxDate)
    ) {
      return;
    }
    setSelectedDate(today);
    setCurrentMonth(today);
    onChange(today);
    setIsOpen(false);
  };

  return (
    <div className="w-full" ref={calendarRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div 
          className={`relative cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CalendarIcon className="h-5 w-5 text-blue-500" />
          </div>
          <input
            type="text"
            readOnly
            disabled={disabled}
            placeholder={placeholder}
            value={formatDate(selectedDate)}
            className={`border border-gray-300 py-2 px-3 rounded-lg text-gray-900 bg-white transition duration-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-sm pl-10 pr-8 w-full ${className}`}
          />
          {selectedDate && !disabled && (
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={clearDate}
            >
              <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </div>
          )}
        </div>

        {isOpen && !disabled && (
          <div className="absolute mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-2">
            <div className="flex justify-between items-center mb-2">
              <button 
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="text-gray-800 font-medium">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              
              <button 
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-1">
              {days.map(day => (
                <div key={day} className="h-8 w-8 flex items-center justify-center text-xs text-gray-500 font-medium">
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>
            
            <div className="border-t mt-2 pt-2 flex justify-center">
              <button 
                onClick={handleSetToday}
                className="text-sm text-blue-600 hover:text-blue-800 py-1 px-2 rounded hover:bg-blue-50"
              >
                Сьогодні
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePicker;