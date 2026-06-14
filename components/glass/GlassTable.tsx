'use client';

import React from 'react';

interface GlassTableColumn {
  key: string;
  label?: string;
  header?: string;
  width?: string;
  render?: (value: any, row?: Record<string, any>) => React.ReactNode;
}

interface GlassTableProps {
  columns: Array<GlassTableColumn>;
  data: Array<Record<string, any>>;
  renderCell?: (key: string, value: any, row: Record<string, any>) => React.ReactNode;
}

export const GlassTable: React.FC<GlassTableProps> = ({ columns, data, renderCell }) => {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4 text-left text-sm font-semibold text-white/80"
                style={{ width: col.width }}
              >
                {col.label || col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm text-white/80">
                  {col.render
                    ? col.render(row[col.key], row)
                    : renderCell
                    ? renderCell(col.key, row[col.key], row)
                    : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
