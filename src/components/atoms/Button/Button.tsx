'use client'
import React from "react";
import styles from "./Button.module.scss";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  type?: "button" | "submit";
  isLoading?: boolean;
  "aria-label"?: string;
}

export const Button = ({
  onClick,
  disabled = false,
  variant = "primary",
  children,
  type = "button",
  isLoading = false,
  "aria-label": ariaLabel
}: ButtonProps) => {
  const className = `${styles.button} ${styles[variant]} ${disabled || isLoading ? (variant === "primary" ? styles.disabledPrimary : styles.disabledSecondary) : ""}`;
  
  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled || isLoading}
      type={type}
      aria-busy={isLoading}
      aria-label={ariaLabel}
    >
      {isLoading ? (
        <>
          <AiOutlineLoading3Quarters className={styles.loadingIcon} aria-hidden="true" />
          <span className={styles.srOnly}>Ładowanie...</span>
        </>
      ) : children}
    </button>
  );
};
