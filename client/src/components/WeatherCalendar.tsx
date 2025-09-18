import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Cloud, Sun, CloudRain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'work' | 'personal' | 'important';
  time?: string;
}

interface Weather {
  date: Date;
  condition: 'sunny' | 'cloudy' | 'rainy';
  temperature: number;
}

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  onRangeSelect?: (startDate: Date, endDate: Date | null) => void;
  events?: Event[];
  weather?: Weather[];
  className?: string;
}

const WeatherCalendar: React.FC<CalendarProps> = ({
  onDateSelect,
  onRangeSelect,
  events = [],
  weather = [],
  className
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [isSelectingRange, setIsSelectingRange] = useState(false);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  // Get weather for a specific date
  const getWeatherForDate = (date: Date) => {
    return weather.find(w => isSameDay(w.date, date));
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (isSelectingRange) {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Start new range
        setRangeStart(date);
        setRangeEnd(null);
      } else {
        // Complete range
        const endDate = date < rangeStart ? rangeStart : date;
        const startDate = date < rangeStart ? date : rangeStart;
        setRangeStart(startDate);
        setRangeEnd(endDate);
        onRangeSelect?.(startDate, endDate);
      }
    } else {
      setSelectedDate(date);
      onDateSelect?.(date);
    }
  };

  // Handle date hover for range preview
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const handleDateHover = (date: Date) => {
    if (isSelectingRange && rangeStart && !rangeEnd) {
      setHoverDate(date);
    }
  };

  const handleDateLeave = () => {
    setHoverDate(null);
  };

  // Check if date is in selected range or hover preview
  const isInRange = (date: Date) => {
    if (!rangeStart) return false;
    if (rangeEnd) {
      return date >= rangeStart && date <= rangeEnd;
    }
    // Show preview range on hover
    if (hoverDate && isSelectingRange) {
      const start = rangeStart < hoverDate ? rangeStart : hoverDate;
      const end = rangeStart < hoverDate ? hoverDate : rangeStart;
      return date >= start && date <= end;
    }
    return isSameDay(date, rangeStart);
  };

  // Check if date is range start or end
  const isRangeEdge = (date: Date) => {
    if (rangeStart && isSameDay(date, rangeStart)) return 'start';
    if (rangeEnd && isSameDay(date, rangeEnd)) return 'end';
    if (hoverDate && isSelectingRange && rangeStart && !rangeEnd && isSameDay(date, hoverDate)) return 'hover-end';
    return false;
  };

  const WeatherIcon = ({ condition }: { condition: 'sunny' | 'cloudy' | 'rainy' }) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-3 h-3 text-weather-sunny" />;
      case 'cloudy':
        return <Cloud className="w-3 h-3 text-weather-cloudy" />;
      case 'rainy':
        return <CloudRain className="w-3 h-3 text-weather-rainy" />;
    }
  };

  const EventDot = ({ type }: { type: 'work' | 'personal' | 'important' }) => {
    const colorClass = {
      work: 'bg-event-work',
      personal: 'bg-event-personal',
      important: 'bg-event-important'
    }[type];
    
    return <div className={cn("w-1.5 h-1.5 rounded-full", colorClass)} />;
  };

  return (
    <Card className={cn("p-6 bg-gradient-card shadow-calendar", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsSelectingRange(!isSelectingRange);
                if (isSelectingRange) {
                  setRangeStart(null);
                  setRangeEnd(null);
                  setHoverDate(null);
                }
              }}
              className={cn(
                "text-xs transition-smooth",
                isSelectingRange && "bg-primary text-primary-foreground shadow-selected"
              )}
            >
              {isSelectingRange ? '📅 Range Mode' : '📅 Select Range'}
            </Button>
            {(rangeStart || rangeEnd) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRangeStart(null);
                  setRangeEnd(null);
                  setIsSelectingRange(false);
                  setHoverDate(null);
                }}
                className="text-xs hover:bg-destructive hover:text-destructive-foreground"
              >
                Clear Range
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setCurrentMonth(new Date());
              setSelectedDate(new Date());
            }}
            className="text-sm px-3 py-1"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isDayToday = isToday(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const inRange = isInRange(date);
          const rangeEdge = isRangeEdge(date);
          const dayEvents = getEventsForDate(date);
          const dayWeather = getWeatherForDate(date);
          const isHoverPreview = isSelectingRange && rangeStart && !rangeEnd && hoverDate;

          return (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => handleDateHover(date)}
              onMouseLeave={handleDateLeave}
              className={cn(
                "relative h-20 p-1 cursor-pointer rounded-lg transition-smooth border",
                "hover:bg-calendar-hover hover:scale-105 hover:shadow-card-subtle",
                !isCurrentMonth && "text-calendar-other-month",
                isDayToday && "ring-2 ring-calendar-today",
                isSelected && !isSelectingRange && "bg-gradient-selected text-calendar-selected-foreground shadow-selected",
                inRange && "bg-calendar-range",
                rangeEdge === 'start' && "bg-gradient-selected text-calendar-selected-foreground shadow-selected ring-2 ring-primary",
                rangeEdge === 'end' && "bg-gradient-selected text-calendar-selected-foreground shadow-selected ring-2 ring-primary", 
                rangeEdge === 'hover-end' && "bg-primary/20 ring-2 ring-primary/50",
                isHoverPreview && inRange && "bg-primary/10",
                isCurrentMonth ? "border-border" : "border-transparent",
                isSelectingRange && "hover:ring-2 hover:ring-primary/30"
              )}
            >
              {/* Date number */}
              <div className="flex items-start justify-between">
                <span className={cn(
                  "text-sm font-medium",
                  isDayToday && "font-bold",
                  !isCurrentMonth && "opacity-50"
                )}>
                  {format(date, 'd')}
                </span>
                
                {/* Weather icon */}
                {dayWeather && isCurrentMonth && (
                  <div className="flex items-center space-x-1">
                    <WeatherIcon condition={dayWeather.condition} />
                    <span className="text-xs text-muted-foreground">
                      {dayWeather.temperature}°
                    </span>
                  </div>
                )}
              </div>

              {/* Events */}
              {dayEvents.length > 0 && isCurrentMonth && (
                <div className="absolute bottom-1 left-1 right-1">
                  {dayEvents.slice(0, 2).map((event, index) => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs truncate mb-0.5 px-1 py-0.5 rounded flex items-center space-x-1",
                        "bg-white/80 backdrop-blur-sm shadow-sm animate-fade-in"
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <EventDot type={event.type} />
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Range selection instructions */}
      {isSelectingRange && (
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg animate-slide-up">
          <p className="text-sm text-primary font-medium mb-1">
            📅 Range Selection Mode Active
          </p>
          <p className="text-xs text-muted-foreground">
            {!rangeStart 
              ? "Click on a date to start selecting your range" 
              : !rangeEnd 
                ? "Click on another date to complete your range selection"
                : "Range selected! Click 'Clear Range' to start over"
            }
          </p>
        </div>
      )}

      {/* Selected range info */}
      {rangeStart && rangeEnd && (
        <div className="mt-4 p-4 bg-gradient-hover border border-primary/20 rounded-lg animate-slide-up">
          <p className="text-sm text-foreground font-medium mb-1">
            ✅ Selected Date Range
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-primary">
              {format(rangeStart, 'MMM d')} - {format(rangeEnd, 'MMM d, yyyy')}
            </span>
            <span className="ml-2 text-xs">
              ({Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
            </span>
          </p>
        </div>
      )}
    </Card>
  );
};

export default WeatherCalendar;