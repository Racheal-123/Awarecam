import React from 'react';

// Lightweight slider wrapper to avoid @radix-ui/react-slider dependency
// API-compatible enough for our current usage: value, min, max, step, onValueChange

export function Slider({
  value = [0],
  min = 0,
  max = 100,
  step = 1,
  onValueChange = () => {},
  className = '',
  defaultValue = [0],
  'aria-label': ariaLabel = 'slider',
  ...props
}) {
  const [currentValue, setCurrentValue] = React.useState(
    Array.isArray(defaultValue) ? defaultValue[0] : (Array.isArray(value) ? value[0] : value || 0)
  );

  const handleChange = (e) => {
    const v = Number(e.target.value);
    setCurrentValue(v);
    onValueChange([v]);
  };

  const displayValue = Array.isArray(value) ? value[0] : (value !== undefined ? value : currentValue);

  return (
    <div className={`w-full flex items-center gap-2 ${className}`}>
      <input
        type="range"
        aria-label={ariaLabel}
        min={min}
        max={max}
        step={step}
        value={displayValue}
        onChange={handleChange}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:bg-slate-700"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(displayValue / max) * 100}%, #e2e8f0 ${(displayValue / max) * 100}%, #e2e8f0 100%)`
        }}
        {...props}
      />
    </div>
  );
}

// Default export for compatibility
export default Slider;