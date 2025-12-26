interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  ariaLabel?: string;
}

export default function Button({
  label,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
  ariaLabel,
}: ButtonProps) {
  const styles = {
    primary:
      "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-blue-300 disabled:cursor-not-allowed",
    secondary:
      "bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed",
    danger:
      "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none disabled:bg-red-300 disabled:cursor-not-allowed",
  };

  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${styles[variant]} transition-colors`}
      aria-label={ariaLabel || label}
    >
      {label}
    </button>
  );
}
