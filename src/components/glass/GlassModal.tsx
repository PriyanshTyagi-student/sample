"use client";

import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  size?: "sm" | "md" | "lg";
  closeButton?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function GlassModal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = "md",
  closeButton = true,
}: GlassModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`
                backdrop-blur-xl bg-white/5 border border-white/10
                rounded-2xl shadow-2xl overflow-hidden
                ${sizeClasses[size]}
                w-full
              `}
            >
              {/* Header */}
              {(title || closeButton) && (
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  {title && <h2 className="text-xl font-semibold text-white">{title}</h2>}
                  {closeButton && (
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 ml-auto"
                    >
                      <X className="w-5 h-5 text-slate-400 hover:text-white" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {children}
              </div>

              {/* Actions */}
              {actions && (
                <div className="border-t border-white/10 px-6 py-4 bg-white/5 flex gap-3 justify-end">
                  {actions}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
