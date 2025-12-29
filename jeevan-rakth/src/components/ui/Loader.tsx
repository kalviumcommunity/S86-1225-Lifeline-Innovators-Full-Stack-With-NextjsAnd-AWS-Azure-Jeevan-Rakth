/**
 * Spinner Component - Circular Loading Indicator
 *
 * Used for blocking UI operations or inline loading states
 * Includes accessibility attributes for screen readers
 */
interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "gray";
  label?: string;
}

export function Spinner({
  size = "md",
  color = "primary",
  label = "Loading...",
}: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
  };

  const colorClasses = {
    primary: "border-blue-600 border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-gray-600 border-t-transparent",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin rounded-full`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * LoadingOverlay Component - Full Screen Loading State
 *
 * Used for page transitions or major data loading operations
 * Blocks entire UI with semi-transparent overlay
 */
interface LoadingOverlayProps {
  message?: string;
  isVisible: boolean;
}

export function LoadingOverlay({
  message = "Loading...",
  isVisible,
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-xl">
        <Spinner size="xl" color="primary" label={message} />
        <p className="text-lg font-medium text-gray-900">{message}</p>
      </div>
    </div>
  );
}

/**
 * ProgressBar Component - Linear Progress Indicator
 *
 * Used for file uploads, multi-step forms, or any measurable progress
 * Shows percentage completion
 */
interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  variant?: "default" | "success" | "warning" | "error";
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  variant = "default",
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const variantColors = {
    default: "bg-blue-600",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    error: "bg-red-600",
  };

  return (
    <div
      className="w-full"
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || "Progress"}
    >
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-600">
              {clampedProgress}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-300 ease-in-out ${variantColors[variant]}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

/**
 * InlineLoader Component - Small Inline Loading State
 *
 * Used for button loading states or inline content loading
 * Non-blocking, shows user can continue interacting with page
 */
interface InlineLoaderProps {
  text?: string;
  size?: "sm" | "md";
}

export function InlineLoader({
  text = "Loading...",
  size = "sm",
}: InlineLoaderProps) {
  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <Spinner size={size} color="primary" label={text} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}

/**
 * ButtonLoader Component - Button with Loading State
 *
 * Replaces button content with spinner when loading
 * Prevents double-clicks during async operations
 */
interface ButtonLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  className?: string;
}

export function ButtonLoader({
  isLoading,
  children,
  loadingText = "Loading...",
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}: ButtonLoaderProps) {
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" color="white" label={loadingText} />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * SkeletonLoader Component - Content Placeholder
 *
 * Shows placeholder while content is loading
 * Provides visual feedback that content is coming
 */
interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
}

export function SkeletonLoader({
  lines = 3,
  className = "",
}: SkeletonLoaderProps) {
  const widths = [95, 80, 90, 85, 92];
  return (
    <div
      className={`animate-pulse space-y-3 ${className}`}
      role="status"
      aria-label="Loading content"
    >
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 rounded bg-gray-200"
          style={{ width: `${widths[index % widths.length]}%` }}
        />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}
