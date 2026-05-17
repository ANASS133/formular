import { supabase, SUPABASE_STORAGE_BUCKET, SUPABASE_TABLE, PROMO_STORAGE_KEY, PROMO_RPC } from "./supabase-client.js";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE_BYTES = 25 * 1024 * 1024;
const BEREICH_PREFIX = "ausbildung als";
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "jpg", "jpeg", "png"]);

let formHandlerInitialized = false;

export function initFormHandler() {
  if (formHandlerInitialized) return;

  const form = document.getElementById("candidate-form");
  if (!form) {
    console.error("Form handler could not find #candidate-form.");
    return;
  }

  formHandlerInitialized = true;

  const fileInput = document.getElementById("documents");
  const submitButton = form.querySelector(".submit-button");
  const statusMessage = document.getElementById("status-message");
  const languageChoiceCards = Array.from(form.querySelectorAll(".choice-card"));
  const languageInputs = Array.from(form.querySelectorAll('input[name="languageLevel"]'));
  const languageProof = document.getElementById("language-proof");
  const whatsappInput = document.getElementById("whatsapp");

  let supabaseInitError = null;
  let isSubmitting = false;

  if (typeof window !== "undefined" && !Array.isArray(window.__formFiles)) {
    window.__formFiles = [];
  }

  try {
    if (!supabase) {
      throw new Error("Supabase client is not available on this page.");
    }
  } catch (error) {
    supabaseInitError = error;
    console.error("Supabase initialization failed", error);
  }

  function getElement(id) {
    return document.getElementById(id);
  }

  function setFieldError(element, message) {
    if (element) element.setCustomValidity(message);
  }

  function clearFieldError(element) {
    if (element) element.setCustomValidity("");
  }

  function getSelectedLanguageLevel() {
    const selected = form.querySelector('input[name="languageLevel"]:checked');
    return selected ? selected.value : "";
  }

  function getSelectedPack() {
    return (
      getElement("bewerbungen")?.value?.trim() ||
      getElement("selected_pack")?.value?.trim() ||
      ""
    );
  }

  function getBereichValue() {
    const suffix = getElement("bereichSuffix")?.value?.trim();
    return suffix ? `${BEREICH_PREFIX} ${suffix}` : "";
  }

  function updateLanguageProof(value, animate = false) {
    if (!languageProof) return;
    languageProof.textContent = value ? `Selected: ${value}` : "";
    languageProof.classList.toggle("is-visible", Boolean(value));
    if (animate && value) {
      languageProof.classList.remove("is-animating");
      void languageProof.offsetWidth;
      languageProof.classList.add("is-animating");
    }
  }

  function syncLanguageChoices() {
    languageChoiceCards.forEach((card) => {
      const input = card.querySelector('input[name="languageLevel"]');
      const isSelected = Boolean(input && input.checked);
      card.classList.toggle("is-selected", isSelected);
      if (!isSelected) card.classList.remove("is-animating");
    });
    updateLanguageProof(getSelectedLanguageLevel());
  }

  function selectLanguageChoice(input) {
    if (!input) return;
    input.checked = true;
    languageInputs.forEach(clearFieldError);
    syncLanguageChoices();
    languageChoiceCards.forEach((card) => {
      const cardInput = card.querySelector('input[name="languageLevel"]');
      if (cardInput === input) card.classList.add("is-animating");
    });
    updateLanguageProof(input.value, true);
  }

  function validateName(value) {
    if (!value || value.trim().length < 3) {
      return "الاسم الكامل مطلوب، 3 أحرف على الأقل.";
    }
    return "";
  }

  function validateEmail(value) {
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return "البريد الإلكتروني غير صالح.";
    }
    return "";
  }

  function validateWhatsApp(value) {
    const cleaned = value.replace(/[\s\-()]/g, "");
    if (!cleaned || !/^\+?\d{8,15}$/.test(cleaned)) {
      return "رقم واتساب غير صالح.";
    }
    return "";
  }

  function validateField(field, validatorFn) {
    const error = validatorFn(field?.value || "");
    setFieldError(field, error);
    return !error;
  }

  function validateRequiredFields() {
    const requiredFields = Array.from(form.querySelectorAll("[required]"));
    let valid = true;

    requiredFields.forEach((field) => {
      if (field.type === "radio") {
        const checked = form.querySelector(`input[name="${field.name}"]:checked`);
        if (!checked) valid = false;
        return;
      }

      if (!String(field.value || "").trim()) {
        valid = false;
      }
    });

    return valid;
  }

  function validateFiles(files) {
    const errors = [];
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    if (files.length === 0) {
      errors.push("المرجو رفع وثيقة واحدة على الأقل.");
    }

    files.forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      if (!ALLOWED_EXTENSIONS.has(ext)) {
        errors.push(`الملف ${file.name} غير مقبول. الأنواع المسموحة: PDF, DOC, DOCX, JPG, PNG.`);
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`الملف ${file.name} يتجاوز الحد الأقصى 10MB.`);
      }
    });

    if (totalSize > MAX_TOTAL_SIZE_BYTES) {
      errors.push("مجموع حجم الملفات يتجاوز 25MB.");
    }

    return errors;
  }

  function humanizeSupabaseError(error) {
    if (!error) return "وقع خطأ غير معروف.";

    const message = error.message || "";
    const status = error.status || error.statusCode;

    if (message.includes("row-level security") || message.includes("policy")) {
      return "رفض الصلاحيات من Supabase. خاصك تفعّل RLS policies للجدول والـ Storage bucket.";
    }
    if (message.includes("Bucket not found") || message.includes("bucket")) {
      return `Bucket باسم "${SUPABASE_STORAGE_BUCKET}" غير موجود أو الاسم غير مطابق.`;
    }
    if (message.includes("JWT") || message.includes("token")) {
      return "مفتاح Supabase anon/publishable غير صالح.";
    }
    if (status === 413 || message.includes("payload too large")) {
      return "حجم الملف كبير بزاف على إعدادات Supabase Storage.";
    }
    if (error.code === "23505" || message.includes("duplicate key")) {
      return "هذه الاستمارة مسجلة من قبل.";
    }
    if (error.code === "PGRST204" || message.includes("Could not find")) {
      return "واحد من أعمدة جدول applications غير موجود. تأكد من أسماء الأعمدة.";
    }

    return message || "وقع خطأ غير معروف.";
  }

  function formatWhatsApp(value) {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("212")) {
      let formatted = "+212";
      if (digits.length > 3) formatted += " " + digits.slice(3, 5);
      if (digits.length > 5) formatted += " " + digits.slice(5, 8);
      if (digits.length > 8) formatted += " " + digits.slice(8, 10);
      if (digits.length > 10) formatted += " " + digits.slice(10, 12);
      return formatted;
    }
    return "+" + digits;
  }

  function safePathSegment(value) {
    return String(value || "application")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "application";
  }

  function randomId() {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function buildStoragePath(file, index) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "file";
    const pack = safePathSegment(getSelectedPack());
    const today = new Date().toISOString().slice(0, 10);
    const originalName = safePathSegment(file.name.replace(/\.[^.]+$/, ""));
    return `${pack}/${today}/${Date.now()}-${index}-${randomId()}-${originalName}.${ext}`;
  }

  async function uploadFileToSupabase(file, index) {
    const path = buildStoragePath(file, index);
    const { data, error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(path, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (error) throw error;
    return data.path;
  }

  function setSubmitting(value) {
    isSubmitting = value;
    if (!submitButton) return;
    submitButton.disabled = value;
    submitButton.textContent = value ? "جاري الإرسال..." : "إرسال الاستمارة";
  }

  function showStatus(message, type) {
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
  }

  function resetFormState() {
    if (fileInput) fileInput.value = "";
    if (typeof window !== "undefined") {
      window.__formFiles = [];
    }
  }

  async function handleSubmission() {
    if (isSubmitting) return;

    if (supabaseInitError) {
      showStatus(`Supabase غير جاهز: ${supabaseInitError.message}`, "error");
      return;
    }

    const selectedPack = getSelectedPack();
    const nameValid = validateField(getElement("fullName"), validateName);
    const emailValid = validateField(getElement("email"), validateEmail);
    const whatsappValid = whatsappInput
      ? validateField(whatsappInput, validateWhatsApp)
      : true;

    if (!selectedPack) {
      showStatus("خاصك تختار الباقة قبل إرسال الاستمارة.", "error");
      return;
    }

    if (!validateRequiredFields() || !nameValid || !emailValid || !whatsappValid) {
      showStatus("المرجو ملء جميع الحقول المطلوبة بشكل صحيح.", "error");
      return;
    }

    const files = Array.isArray(window.__formFiles)
      ? window.__formFiles
      : Array.from(fileInput?.files || []);
    const fileErrors = validateFiles(files);
    if (fileErrors.length > 0) {
      showStatus(fileErrors.join(" "), "error");
      return;
    }

    // ── Promo code from localStorage (read once, use for both insert + RPC) ──
    const promoCode = localStorage.getItem(PROMO_STORAGE_KEY);

    const payload = {
      pack: selectedPack,
      code: promoCode || null,
      full_name: getElement("fullName").value.trim(),
      email: getElement("email").value.trim(),
      whatsapp: whatsappInput ? whatsappInput.value.trim() : "",
      bank: getElement("bank").value.trim(),
      language_level: getSelectedLanguageLevel(),
      field: getBereichValue(),
    };

    setSubmitting(true);

    try {
      const uploadedDocuments = [];
      let uploadError = null;

      for (let index = 0; index < files.length; index += 1) {
        showStatus(`جاري رفع الملف ${index + 1} من ${files.length}...`, "loading");
        try {
          uploadedDocuments.push(await uploadFileToSupabase(files[index], index));
        } catch (error) {
          uploadError = error;
          console.error("Supabase storage upload failed", {
            code: error?.code,
            status: error?.status,
            message: error?.message,
          });
          break;
        }
      }

      showStatus("جاري حفظ المعلومات...", "loading");

      const { error: dbError } = await supabase
        .from(SUPABASE_TABLE)
        .insert([
          {
            ...payload,
            documents: uploadedDocuments,
          },
        ]);

      if (dbError) throw dbError;

      // ── Promo Code Increment (non-blocking) ────────────────────
      if (promoCode) {
        try {
          const { error: promoError } = await supabase.rpc(PROMO_RPC, {
            promo_code: promoCode,
          });
          if (promoError) {
            console.error("Promo increment failed:", promoError);
          } else {
            localStorage.removeItem(PROMO_STORAGE_KEY);
          }
        } catch (promoErr) {
          console.error("Promo increment error:", promoErr);
        }
      }

      if (uploadError) {
        showStatus(
          `تم حفظ المعلومات، ولكن فشل رفع بعض الملفات: ${humanizeSupabaseError(uploadError)}`,
          "error",
        );
        return;
      }

      resetFormState();
      showStatus("تم الإرسال بنجاح.", "success");
      window.dispatchEvent(new CustomEvent("formSubmissionSuccess"));
    } catch (error) {
      console.error("Supabase save failed", {
        code: error?.code,
        status: error?.status,
        message: error?.message,
      });
      showStatus(`فشل الإرسال: ${humanizeSupabaseError(error)}`, "error");
    } finally {
      setSubmitting(false);
    }
  }

  form.addEventListener("change", (event) => {
    if (event.target === fileInput) {
      window.__formFiles = Array.from(fileInput.files || []);
      return;
    }

    if (event.target instanceof HTMLInputElement && event.target.name === "languageLevel") {
      selectLanguageChoice(event.target);
      return;
    }

    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
      clearFieldError(event.target);
    }

    syncLanguageChoices();
  });

  form.addEventListener("input", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
      clearFieldError(event.target);
    }
  });

  getElement("fullName")?.addEventListener("blur", function () {
    validateField(this, validateName);
  });

  getElement("email")?.addEventListener("blur", function () {
    validateField(this, validateEmail);
  });

  whatsappInput?.addEventListener("blur", function () {
    validateField(this, validateWhatsApp);
  });

  whatsappInput?.addEventListener("input", function () {
    const cursorPosition = this.selectionStart || this.value.length;
    const oldLength = this.value.length;
    const formatted = formatWhatsApp(this.value);
    this.value = formatted;
    const nextPosition = Math.max(0, cursorPosition + formatted.length - oldLength);
    this.setSelectionRange(nextPosition, nextPosition);
  });

  languageChoiceCards.forEach((card) => {
    card.addEventListener("click", () => {
      selectLanguageChoice(card.querySelector('input[name="languageLevel"]'));
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await handleSubmission();
  });

  syncLanguageChoices();
}