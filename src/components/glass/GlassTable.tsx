"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

export interface GlassTableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface GlassTableProps<T> {
  columns: GlassTableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  selectedRows?: Set<string | number>;
  onSelectRow?: (rowId: string | number, selected: boolean) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function GlassTable<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  selectedRows,
  onSelectRow,
  loading,
  emptyMessage = "No data available",
}: GlassTableProps<T>) {
  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl p-6">
        <div className="flex justify-center">
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl p-12">
        <div className="flex justify-center">
          <div className="text-slate-400">{emptyMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 bg-white/5">
        <div className="flex gap-4">
          {onSelectRow && (
            <input
              type="checkbox"
              className="w-4 h-4 rounded bg-white/10 border-white/20 text-blue-500 cursor-pointer"
              onChange={(e) => {
                data.forEach((row) => onSelectRow(row.id, e.target.checked));
              }}
            />
          )}
          {columns.map((column) => (
            <div
              key={String(column.key)}
              className="flex-1 text-sm font-medium text-slate-300"
              style={{ width: column.width }}
            >
              {column.label}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {data.map((row, index) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onRowClick?.(row)}
            className={`
              px-6 py-4 flex gap-4 items-center
              hover:bg-white/5 transition-colors duration-200
              ${onRowClick ? "cursor-pointer" : ""}
            `}
          >
            {onSelectRow && (
              <input
                type="checkbox"
                className="w-4 h-4 rounded bg-white/10 border-white/20 text-blue-500 cursor-pointer"
                checked={selectedRows?.has(row.id) || false}
                onChange={(e) => onSelectRow(row.id, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {columns.map((column) => (
              <div
                key={String(column.key)}
                className="flex-1 text-sm text-slate-300"
                style={{ width: column.width }}
              >
                {column.render ? column.render(row[column.key], row) : String(row[column.key])}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
