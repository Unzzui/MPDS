import React, { useState } from 'react';

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  hasWorkout: boolean;
  workoutType?: string;
  isToday: boolean;
}

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mock workout data
  const workoutData: { [key: string]: string } = {
    '2024-01-15': 'Push',
    '2024-01-17': 'Pull',
    '2024-01-19': 'Legs',
    '2024-01-22': 'Push',
    '2024-01-24': 'Pull',
    '2024-01-26': 'Legs',
  };

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateString = currentDate.toISOString().split('T')[0];
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const hasWorkout = workoutData[dateString] !== undefined;
      
      days.push({
        date: dateString,
        day: currentDate.getDate(),
        isCurrentMonth,
        hasWorkout,
        workoutType: workoutData[dateString],
        isToday
      });
    }
    
    return days;
  };

  const getMonthName = (date: Date): string => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getWorkoutColor = (workoutType: string): string => {
    switch (workoutType.toLowerCase()) {
      case 'push':
        return 'bg-red-500';
      case 'pull':
        return 'bg-blue-500';
      case 'legs':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">Calendario</h1>
        <p className="text-xl text-gray-300">Visualiza tu plan de entrenamiento</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={previousMonth}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-2xl font-bold text-orange-500 capitalize">
            {getMonthName(currentDate)}
          </h2>
          
          <button
            onClick={nextMonth}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-gray-400 font-semibold py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => setSelectedDate(new Date(day.date))}
              className={`
                min-h-[80px] p-2 border border-gray-600 rounded-lg cursor-pointer transition-colors
                ${day.isCurrentMonth ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 text-gray-500'}
                ${day.isToday ? 'border-orange-500 bg-orange-500 bg-opacity-20' : ''}
                ${selectedDate?.toDateString() === new Date(day.date).toDateString() ? 'border-orange-500' : ''}
              `}
            >
              <div className="text-sm font-semibold mb-1">{day.day}</div>
              
              {day.hasWorkout && day.workoutType && (
                <div className={`text-xs text-white px-2 py-1 rounded ${getWorkoutColor(day.workoutType)}`}>
                  {day.workoutType}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-600">
          <h3 className="text-lg font-bold text-orange-500 mb-3">Leyenda</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-300 text-sm">Push</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-300 text-sm">Pull</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-300 text-sm">Legs</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-gray-300 text-sm">Hoy</span>
            </div>
          </div>
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="mt-6 pt-4 border-t border-gray-600">
            <h3 className="text-lg font-bold text-orange-500 mb-3">
              {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {workoutData[selectedDate.toISOString().split('T')[0]] ? (
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-300 mb-2">
                  <strong>Entrenamiento:</strong> {workoutData[selectedDate.toISOString().split('T')[0]]}
                </p>
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                  Registrar Entrenamiento
                </button>
              </div>
            ) : (
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-300">Día de descanso</p>
                <button className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm mt-2">
                  Agregar Entrenamiento
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage; 