import React from "react";

function Button({ children, variant }) {
  const buttonClass =
    variant === "outlined"
      ? `text-[#635BFF] border-2 border-[#635BFF] hover:bg-[#635BFF] hover:text-white`
      : ` border-none text-white bg-[#635BFF] hover:bg-[#8983fa]`;
  return (
    <button
      className={`pl-28 pr-28 pb-3 pt-3 rounded-full font-semibold ${buttonClass}`}
    >
      {children}
    </button>
  );
}

export default Button;
