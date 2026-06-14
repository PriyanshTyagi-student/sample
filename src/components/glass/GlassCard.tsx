"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

export interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  animated?: boolean;
}

export function GlassCard({
  children,
  className = "",
  hover = false,
  onClick,
  animated = true,
}: GlassCardProps) {
  const Wrapper = animated ? motion.div : "div";
  const wrapperProps = animated
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: "easeOut" },
        whileHover: hover ? { y: -2 } : {},
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      onClick={onClick}
      className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-2xl transition-all duration-300 ${
        hover ? "hover:bg-white/8 hover:border-white/20 cursor-pointer" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </Wrapper>
  );
}
