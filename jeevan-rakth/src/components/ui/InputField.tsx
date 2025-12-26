interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  id?: string;
  name?: string;
}

export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  id,
  name,
}: InputFieldProps) {
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`px-3 py-2 border rounded focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      />
      {error && (
        <span
          id={`${inputId}-error`}
          className="text-sm text-red-500"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}
