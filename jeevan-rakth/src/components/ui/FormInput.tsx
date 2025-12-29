import { UseFormRegister, FieldValues } from "react-hook-form";

interface FormInputProps {
  label: string;
  type?: string;
  register: UseFormRegister<FieldValues>;
  name: string;
  error?: string;
}

export default function FormInput({
  label,
  type = "text",
  register,
  name,
  error,
}: FormInputProps) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="block mb-1 font-medium">
        {label}
      </label>
      <input
        id={name}
        type={type}
        {...register(name)}
        aria-invalid={error ? "true" : "false"}
        className={`w-full border p-2 rounded ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
