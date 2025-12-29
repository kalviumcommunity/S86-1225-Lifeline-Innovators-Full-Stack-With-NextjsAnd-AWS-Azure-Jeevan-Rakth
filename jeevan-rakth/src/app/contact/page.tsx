"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/ui/FormInput";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    console.log("Contact Form Submitted:", data);

    // Simulate async submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    alert("Message Sent Successfully!");
    reset(); // Clear form after successful submission
  };

  return (
    <main className="p-6 flex flex-col items-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Contact Us</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Have questions? We&apos;d love to hear from you. Send us a message and
        we&apos;ll respond as soon as possible.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-8 border border-gray-200 rounded-lg shadow-lg"
      >
        <FormInput
          label="Name"
          name="name"
          register={register}
          error={errors.name?.message}
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          register={register}
          error={errors.email?.message}
        />

        <div className="mb-3">
          <label htmlFor="message" className="block mb-1 font-medium">
            Message
          </label>
          <textarea
            id="message"
            {...register("message")}
            aria-invalid={errors.message ? "true" : "false"}
            rows={5}
            className={`w-full border p-2 rounded resize-none ${
              errors.message ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Type your message here..."
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1" role="alert">
              {errors.message.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white px-4 py-2 mt-2 rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? "Sending..." : "Submit"}
        </button>
      </form>
    </main>
  );
}
