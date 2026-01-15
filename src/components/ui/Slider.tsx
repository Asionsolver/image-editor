import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: React.ReactNode;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueDisplay, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {(label || valueDisplay) && (
          <div className="flex justify-between items-center text-sm font-medium text-gray-700">
            {label && <span>{label}</span>}
            {valueDisplay && (
              <span className="text-gray-500">{valueDisplay}</span>
            )}
          </div>
        )}
        <input
          type="range"
          ref={ref}
          className={cn(
            "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
