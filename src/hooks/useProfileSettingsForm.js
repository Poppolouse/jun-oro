import { useState, useMemo } from "react";

/**
 * Manages Profile Settings form state, validation, and submission.
 * @param {object} options
 * @param {object} options.initialUser - Initial user values (id, name, username, email).
 * @param {function} options.onSave - Async save function receiving { id, name, username, email }.
 * @returns {object} Form state and handlers
 */
export default function useProfileSettingsForm({ initialUser, onSave }) {
  const initialValues = useMemo(
    () => ({
      id: initialUser?.id,
      name: initialUser?.name || initialUser?.username || "",
      username: initialUser?.username || "",
      email: initialUser?.email || "",
    }),
    [initialUser],
  );

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const validateEmail = (email) => {
    // Simple email pattern validation
    return /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
  };

  const validate = () => {
    const nextErrors = {};
    if (!values.name || values.name.trim().length < 2) {
      nextErrors.name = "İsim en az 2 karakter olmalı";
    }
    if (!values.username || values.username.trim().length < 3) {
      nextErrors.username = "Kullanıcı adı en az 3 karakter";
    }
    if (!values.email || !validateEmail(values.email)) {
      nextErrors.email = "Geçerli bir email girin";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setSubmitResult(null);
  };

  const submit = async () => {
    setSubmitResult(null);
    if (!validate()) return { success: false, error: "validation" };
    setIsSubmitting(true);
    try {
      const payload = {
        id: values.id,
        name: values.name.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
      };
      const res = await onSave(payload);
      setSubmitResult(res?.success ? { type: "success" } : { type: "error", message: res?.error?.message || res?.error || "Kaydetme hatası" });
      return res;
    } catch (err) {
      setSubmitResult({ type: "error", message: err.message });
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    submitResult,
    handleChange,
    reset,
    submit,
  };
}

