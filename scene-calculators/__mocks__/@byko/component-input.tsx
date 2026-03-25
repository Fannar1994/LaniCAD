// Mock for @byko/component-input

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps) {
  return (
    <input
      {...props}
      style={{
        padding: "0.5rem",
        fontSize: "1rem",
        border: "1px solid #ccc",
        borderRadius: "4px",
        width: "100%",
        ...props.style,
      }}
    />
  );
}
