import React from 'react';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';

import { cn } from '../../lib/utils';
import { Button, buttonVariants } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

// Make CalendarProps compatible with React.ComponentPropsWithRef
export type CalendarProps = React.ComponentPropsWithRef<typeof DayPicker>;

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, classNames, showOutsideDays = true, ...props }, ref) => {
    return (
      <DayPicker
        ref={ref} // Forward the ref to DayPicker
        showOutsideDays={showOutsideDays}
        className={cn('p-3', className)}
        classNames={{
          months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
          month: 'space-y-4',
          caption: 'flex justify-center pt-1 relative items-center',
          caption_label: 'text-sm font-medium',
          nav: 'space-x-1 flex items-center',
          nav_button: cn(
            buttonVariants({ variant: 'outline' }),
            'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
          ),
          nav_button_previous: 'absolute left-1',
          nav_button_next: 'absolute right-1',
          table: 'w-full border-collapse space-y-1',
          head_row: 'flex',
          head_cell:
            'text-slate-500 rounded-md w-9 font-normal text-[0.8rem] dark:text-slate-400',
          row: 'flex w-full mt-2',
          cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected])]:bg-slate-800',
          day: cn(
            buttonVariants({ variant: 'ghost' }),
            'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
          ),
          day_range_start: 'day-range-start',
          day_range_end: 'day-range-end',
          day_selected:
            'bg-slate-900 text-slate-50 hover:bg-slate-900 hover:text-slate-50 focus:bg-slate-900 focus:text-slate-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50 dark:hover:text-slate-900 dark:focus:bg-slate-50 dark:focus:text-slate-900',
          day_today: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50',
          day_outside: 'text-slate-500 opacity-50 dark:text-slate-400',
          day_disabled: 'text-slate-500 opacity-50 dark:text-slate-400',
          day_range_middle:
            'aria-selected:bg-slate-100 aria-selected:text-slate-900 dark:aria-selected:bg-slate-800 dark:aria-selected:text-slate-50',
          day_hidden: 'invisible',
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
    );
  },
);
Calendar.displayName = 'Calendar';

// --- DatePicker Component ---
interface DatePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  // Use a dedicated prop for button attributes
  buttonProps?: React.ComponentPropsWithoutRef<typeof Button>;
  // Use a dedicated prop for calendar attributes, omitting ref and other controlled props
  calendarProps?: Omit<CalendarProps, "mode" | "selected" | "onSelect" | "initialFocus" | "ref">;
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ value, onChange, placeholder, buttonProps, calendarProps, ...props }, ref) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={buttonProps?.variant || 'outline'}
            size={buttonProps?.size || 'default'}
            className={cn(
              'w-[280px] justify-start text-left font-normal',
              !value && 'text-slate-500', // Use slate-500 for consistency with existing code
              buttonProps?.className,
            )}
            disabled={buttonProps?.disabled}
            ref={ref} // Forward ref to the Button
            {...buttonProps} // Spread other button specific props
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'PPP') : (placeholder || 'Pick a date')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
            {...calendarProps} // Spread other calendar specific props
          />
        </PopoverContent>
      </Popover>
    );
  },
);
DatePicker.displayName = 'DatePicker';

export { Calendar, DatePicker };