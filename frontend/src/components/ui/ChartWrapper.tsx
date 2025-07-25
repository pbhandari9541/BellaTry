/**
 * ChartWrapper component for rendering charts (line, bar, candlestick, etc.).
 * - Enhanced to show data structure and prepare for charting library integration.
 * - Uses only semantic color classes from the project color system.
 */
import React from 'react';

export type ChartWrapperProps = {
  title?: string;
  data: any;
  type: 'line' | 'bar' | 'area' | 'candlestick';
  options?: any;
  className?: string;
};

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  data,
  type,
  options,
  className = '',
}) => {
  const renderChartContent = () => {
    if (!data) {
      return <span>No data available</span>;
    }

    // For now, show a structured representation of the data
    if (type === 'candlestick' && Array.isArray(data)) {
      return (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Candlestick Data Preview:</div>
          <div className="max-h-32 overflow-y-auto">
            {data.slice(0, 5).map((item: any, index: number) => (
              <div key={index} className="text-xs p-1 bg-surface rounded">
                {item.date || item.time}: O:{item.open} H:{item.high} L:{item.low} C:{item.close}
              </div>
            ))}
            {data.length > 5 && (
              <div className="text-xs text-muted-foreground">... and {data.length - 5} more data points</div>
            )}
          </div>
        </div>
      );
    }

    if (type === 'line' && Array.isArray(data)) {
      return (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Line Chart Data Preview:</div>
          <div className="max-h-32 overflow-y-auto">
            {data.slice(0, 5).map((item: any, index: number) => (
              <div key={index} className="text-xs p-1 bg-surface rounded">
                {item.date || item.time}: {item.value || item.price}
              </div>
            ))}
            {data.length > 5 && (
              <div className="text-xs text-muted-foreground">... and {data.length - 5} more data points</div>
            )}
          </div>
        </div>
      );
    }

    if (type === 'bar' && Array.isArray(data)) {
      return (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Bar Chart Data Preview:</div>
          <div className="max-h-32 overflow-y-auto">
            {data.slice(0, 5).map((item: any, index: number) => (
              <div key={index} className="text-xs p-1 bg-surface rounded">
                {item.label || item.name}: {item.value}
              </div>
            ))}
            {data.length > 5 && (
              <div className="text-xs text-muted-foreground">... and {data.length - 5} more data points</div>
            )}
          </div>
        </div>
      );
    }

    // Fallback for other data types
    return (
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Data Structure:</div>
        <pre className="text-xs bg-surface p-2 rounded overflow-x-auto">
          {JSON.stringify(data, null, 2).slice(0, 200)}
          {JSON.stringify(data, null, 2).length > 200 && '...'}
        </pre>
      </div>
    );
  };

  return (
    <div className={`bg-card-background border border-border rounded-lg p-4 ${className}`}>
      {title && <h3 className="text-primary-text font-semibold text-lg mb-3">{title}</h3>}
      <div className="w-full h-48 flex items-center justify-center text-muted-foreground bg-component rounded p-4">
        <div className="w-full h-full flex flex-col">
          <div className="text-sm font-medium mb-2">Chart Type: {type}</div>
          {renderChartContent()}
          <div className="text-xs text-muted-foreground mt-2">
            Chart rendering will be integrated with a charting library (e.g., Chart.js, Recharts)
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartWrapper; 