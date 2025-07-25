/**
 * Reusable Table component for displaying tabular data (metrics, news, analysis, etc.)
 * - Uses only semantic color classes from the project color system.
 * - Responsive: horizontal scroll on mobile.
 * - Accepts columns and data as props.
 */
import React from 'react';

export type TableColumn = {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
};

export type TableProps = {
  columns: TableColumn[];
  data: any[];
  caption?: string;
  className?: string;
};

export const Table: React.FC<TableProps> = ({ columns, data, caption, className }) => (
  <div className={`overflow-x-auto w-full ${className || ''}`}>
    <table className="min-w-full bg-card-background border border-border rounded-lg">
      {caption && <caption className="text-muted-foreground text-sm p-2 text-left">{caption}</caption>}
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={`px-4 py-2 text-left text-primary-text font-semibold border-b border-border ${
                col.align ? `text-${col.align}` : ''
              }`}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center text-muted-foreground py-4">
              No data available.
            </td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr key={i} className="even:bg-component">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-2 text-foreground border-b border-border ${
                    col.align ? `text-${col.align}` : ''
                  }`}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default Table; 