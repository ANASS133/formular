const firebaseConfig = {
  apiKey: "AIzaSyD3xQalpdCJZK2GNCYRP8noiY5ei6oOtFw",
  authDomain: "clients-9d7fe.firebaseapp.com",
  projectId: "clients-9d7fe",
  storageBucket: "clients-9d7fe.firebasestorage.app",
  messagingSenderId: "489647859812",
  appId: "1:489647859812:web:6f0f06a20beef2ea6a9771",
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE_BYTES = 25 * 1024 * 1024;
const BEREICH_PREFIX = "ausbildung als";
const STORAGE_UPLOAD_TIMEOUT_MS = 120_000;
const STORAGE_DOWNLOAD_URL_TIMEOUT_MS = 30_000;

const form = document.getElementById("candidate-form");
const fileInput = document.getElementById("documents");
const fileList = document.getElementById("file-list");
const uploadBox = document.getElementById("upload-box");
const uploadCopy = uploadBox ? uploadBox.querySelector(".upload-copy") : null;
const uploadTitle = uploadBox ? uploadBox.querySelector("strong") : null;
const submitButton = form ? form.querySelector(".submit-button") : null;
const statusMessage = document.getElementById("status-message");
const languageChoiceCards = Array.from(form ? form.querySelectorAll(".choice-card") : []);
const languageInputs = Array.from(form ? form.querySelectorAll('input[name="languageLevel"]') : []);
const languageProof = document.getElementById("language-proof");
const whatsappInput = document.getElementById("whatsapp");
const totalSizeBar = document.getElementById("total-size-bar");
const totalSizeText = document.getElementById("total-size-text");
const totalSizePct = document.getElementById("total-size-pct");
const totalSizeFill = document.getElementById("total-size-fill");

let selectedFiles = [];
let firebaseInitError = null;
let db = null;
let storageServices = [];

/* ── File type helpers ── */
function getFileExtension(name) {
  const lastDot = name.lastIndexOf(".");
  return lastDot > -1 ? name.slice(lastDot + 1).toLowerCase() : "";
}

function isImageFile(name) {
  const ext = getFileExtension(name);
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext);
}

function getFileCategoryIcon(name) {
  const ext = getFileExtension(name);
  if (["pdf"].includes(ext)) return "PDF";
  if (["doc", "docx"].includes(ext)) return "DOC";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "IMG";
  return ext.toUpperCase().slice(0, 3);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

/* ── Total size bar ── */
function updateTotalSizeBar() {
  if (!totalSizeBar) return;
  const totalBytes = selectedFiles.reduce((sum, f) => sum + f.size, 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
  const pct = Math.min(Math.round((totalBytes / MAX_TOTAL_SIZE_BYTES) * 100), 100);

  if (totalSizeText) totalSizeText.textContent = totalMB + " MB / 25 MB";
  if (totalSizePct) totalSizePct.textContent = pct + "%";
  if (totalSizeFill) {
    totalSizeFill.style.width = pct + "%";
    totalSizeFill.classList.remove("warning", "danger");
    if (pct > 90) totalSizeFill.classList.add("danger");
    else if (pct > 70) totalSizeFill.classList.add("warning");
  }

  totalSizeBar.style.display = selectedFiles.length ? "block" : "none";
}

/* ── File list rendering ── */
function renderFiles() {
  if (!fileList) return;

  fileList.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const item = document.createElement("div");
    item.className = "file-item";

    const icon = document.createElement("div");
    const isImg = isImageFile(file.name);

    if (isImg) {
      const img = document.createElement("img");
      img.className = "file-preview-img";
      img.alt = file.name;
      img.src = URL.createObjectURL(file);
      icon.appendChild(img);
    } else {
      icon.className = "file-icon";
      icon.textContent = getFileCategoryIcon(file.name);
    }

    const info = document.createElement("div");
    info.className = "file-info";

    const name = document.createElement("span");
    name.className = "file-name";
    name.textContent = file.name;

    const size = document.createElement("span");
    size.className = "file-size";
    size.textContent = formatFileSize(file.size);

    info.appendChild(name);
    info.appendChild(size);

    const remove = document.createElement("button");
    remove.className = "file-remove";
    remove.type = "button";
    remove.innerHTML = "✕";
    remove.title = "Remove file";
    remove.addEventListener("click", () => {
      selectedFiles.splice(index, 1);
      updateFileInput();
      renderFiles();
      updateTotalSizeBar();
    });

    item.appendChild(icon);
    item.appendChild(info);
    item.appendChild(remove);
    fileList.appendChild(item);
  });

  updateTotalSizeBar();
}

function updateFileInput() {
  const dt = new DataTransfer();
  selectedFiles.forEach((f) => dt.items.add(f));
  fileInput.files = dt.files;
  updateUploadLabel();
}

function updateUploadLabel() {
  if (!uploadCopy || !uploadTitle) return;
  if (selectedFiles.length === 0) {
    uploadTitle.textContent = "اختر الملفات";
    uploadCopy.textContent = "اضغط لاختيار الملفات أو اسحبها إلى هذه المساحة.";
  } else {
    uploadTitle.textContent = selectedFiles.length + " ملف(ات) مختارة";
    uploadCopy.textContent = "اضغط لإضافة المزيد أو اسحب ملفات جديدة.";
  }
}

/* ── WhatsApp auto-formatting ── */
function formatWhatsApp(raw) {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("212")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("00212")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length > 9) digits = digits.slice(0, 9);

  let formatted = "";
  if (digits.length <= 3) {
    formatted = digits;
  } else if (digits.length <= 6) {
    formatted = digits.slice(0, 3) + " " + digits.slice(3);
  } else {
    formatted = digits.slice(0, 3) + " " + digits.slice(3, 6) + " " + digits.slice(6);
  }

  return formatted;
}

/* ── Inline validation ── */
function showFieldError(element, message) {
  if (!element) return;
  element.classList.add("error");
  element.setCustomValidity(message);
}

function clearFieldError(element) {
  if (!element) return;
  element.classList.remove("error");
  element.setCustomValidity("");
}

function validateName(value) {
  if (!value || !value.trim()) return "الاسم الكامل مطلوب";
  if (value.trim().length < 3) return "الاسم قصير جداً";
  return "";
}

function validateEmail(value) {
  if (!value || !value.trim()) return "البريد الإلكتروني مطلوب";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value.trim())) return "البريد الإلكتروني غير صالح";
  return "";
}

function validateWhatsApp(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "رقم الواتساب مطلوب";
  if (digits.length < 8) return "رقم الواتساب غير مكتمل";
  return "";
}

function validateField(element, validator) {
  if (!element) return true;
  const msg = validator(element.value);
  if (msg) {
    showFieldError(element, msg);
    return false;
  }
  clearFieldError(element);
  return true;
}

/* ── Firebase setup ── */
function getStorageBucketCandidates(bucketName) {
  const normalized = String(bucketName || "").trim();
  const candidates = [];
  if (normalized) {
    candidates.push(normalized);
  }
  if (normalized.endsWith(".firebasestorage.app")) {
    candidates.push(normalized.replace(/\.firebasestorage\.app$/i, ".appspot.com"));
  }
  return Array.from(new Set(candidates.filter(Boolean)));
}

try {
  if (!window.firebase) {
    throw new Error("Firebase SDK is not available on this page.");
  }
  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(firebaseConfig);
  }
  db = window.firebase.firestore();
  storageServices = getStorageBucketCandidates(firebaseConfig.storageBucket).map((bucketName) =>
    window.firebase.app().storage("gs://" + bucketName)
  );
  if (!storageServices.length) {
    storageServices = [window.firebase.storage()];
  }
  storageServices.forEach((storageService) => {
    storageService.maxUploadRetryTime = 120_000;
    storageService.maxOperationRetryTime = 30_000;
  });
} catch (error) {
  firebaseInitError = error;
  console.error("Firebase initialization failed", error);
}

/* ── Language level ── */
function clearLanguageError() {
  languageInputs.forEach(clearFieldError);
}

function getSelectedLanguageLevel() {
  const selected = form.querySelector('input[name="languageLevel"]:checked');
  return selected ? selected.value : "";
}

function getBereichValue() {
  const suffix = document.getElementById("bereichSuffix").value.trim();
  return suffix ? BEREICH_PREFIX + " " + suffix : "";
}

function updateLanguageProof(value, animate) {
  if (!languageProof) return;
  languageProof.textContent = value ? "Selected: " + value : "";
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
  clearLanguageError();
  languageChoiceCards.forEach((card) => card.classList.remove("is-animating"));
  const card = input.closest(".choice-card");
  if (card) {
    card.classList.add("is-selected", "is-animating");
  }
  updateLanguageProof(getSelectedLanguageLevel(), true);
}

/* ── Status ── */
function showStatus(message, type) {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.className = "status-message";
  if (type) statusMessage.classList.add(type);
}

/* ── Submitting ── */
function setSubmitting(loading) {
  if (!submitButton) return;
  if (loading) {
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="submit-spinner"></span> جاري الإرسال...';
  } else {
    submitButton.disabled = false;
    submitButton.textContent = "إرسال الاستمارة";
  }
}

/* ── Firebase upload helpers ── */
function humanizeFirebaseError(error) {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  return JSON.stringify(error);
}

function createSubmissionId() {
  return "sub_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

async function uploadFileToFirebase(file, submissionId) {
  let lastError = null;
  for (const storageService of storageServices) {
    try {
      const storageRef = storageService.ref();
      const fileRef = storageRef.child("submissions/" + submissionId + "/" + file.name);
      const uploadTask = fileRef.put(file, { contentType: file.type });
      const snapshot = await Promise.race([
        new Promise((resolve) => {
          uploadTask.on("state_changed", null, resolve, () => resolve(uploadTask.snapshot));
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Upload timed out after " + STORAGE_UPLOAD_TIMEOUT_MS / 1000 + "s")), STORAGE_UPLOAD_TIMEOUT_MS)
        ),
      ]);
      const url = await Promise.race([
        fileRef.getDownloadURL(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Download URL timed out")), STORAGE_DOWNLOAD_URL_TIMEOUT_MS)
        ),
      ]);
      return { name: file.name, url, bucket: storageService.ref().bucket };
    } catch (error) {
      lastError = error;
      console.warn("Firebase upload attempt failed, trying next bucket...", error);
    }
  }
  throw lastError || new Error("All Firebase storage buckets failed");
}

/* ── Form submission ── */
function validateRequiredFields() {
  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
  const whatsapp = document.getElementById("whatsapp");
  const bank = document.getElementById("bank");
  const bereichSuffix = document.getElementById("bereichSuffix");

  let valid = true;

  if (!validateName(fullName.value)) {
    showFieldError(fullName, validateName(fullName.value) || "الاسم الكامل مطلوب");
    valid = false;
  }
  if (!validateEmail(email.value)) {
    showFieldError(email, validateEmail(email.value) || "البريد الإلكتروني مطلوب");
    valid = false;
  }
  if (!validateWhatsApp(whatsapp.value)) {
    showFieldError(whatsapp, validateWhatsApp(whatsapp.value) || "رقم الواتساب مطلوب");
    valid = false;
  }
  if (!bank.value) {
    showFieldError(bank, "البنك مطلوب");
    valid = false;
  }
  if (!getSelectedLanguageLevel()) {
    languageInputs.forEach((inp) => showFieldError(inp, "اختر مستوى اللغة"));
    valid = false;
  } else {
    clearLanguageError();
  }
  if (!bereichSuffix.value.trim()) {
    showFieldError(bereichSuffix, "المجال مطلوب");
    valid = false;
  }

  return valid;
}

async function handleSubmission() {
  if (firebaseInitError) {
    showStatus("Firebase initialization failed. " + humanizeFirebaseError(firebaseInitError), "error");
    return;
  }

  if (!validateRequiredFields()) {
    showStatus("المرجو إكمال جميع الحقول المطلوبة قبل الإرسال.", "error");
    return;
  }

  const files = selectedFiles;
  const submissionId = createSubmissionId();
  const payload = {
    submissionId,
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    whatsapp: document.getElementById("whatsapp").value.trim(),
    bank: document.getElementById("bank").value.trim(),
    languageLevel: getSelectedLanguageLevel(),
    bereich: getBereichValue(),
    bewerbungen: document.getElementById("bewerbungen").value.trim(),
  };

  setSubmitting(true);

  try {
    const uploadedDocuments = [];
    let uploadError = null;

    for (let index = 0; index < files.length; index += 1) {
      showStatus("Uploading file " + (index + 1) + " of " + files.length + "...", "loading");
      try {
        uploadedDocuments.push(await uploadFileToFirebase(files[index], submissionId));
      } catch (error) {
        uploadError = {
          code: error ? error.code || "unknown" : "unknown",
          message: error ? error.message || "Unknown Firebase upload error" : "Unknown error",
        };
        break;
      }
    }

    showStatus("Saving...", "loading");

    const docRef = await db.collection("applications").add({
      ...payload,
      documents: uploadedDocuments,
      createdAt: new Date(),
      uploadStatus: uploadError ? "files-failed" : "completed",
      uploadError,
    });

    resetFormState();

    if (uploadError) {
      showStatus(
        "Saved form data to Firebase. File upload failed: " + humanizeFirebaseError(uploadError) + " Record ID: " + docRef.id,
        "error"
      );
      return;
    }

    showStatus(".تم الحفظ بنجاح", "success");

    /* Dispatch success event for React overlay */
    window.dispatchEvent(new CustomEvent("formSubmissionSuccess"));
  } catch (error) {
    console.error("Firebase save failed", {
      code: error ? error.code : undefined,
      message: error ? error.message : undefined,
      serverResponse: error ? error.serverResponse : undefined,
      stack: error ? error.stack : undefined,
    });
    showStatus("Firebase save failed. " + humanizeFirebaseError(error), "error");
  } finally {
    setSubmitting(false);
  }
}

function resetFormState() {
  selectedFiles = [];
  if (fileInput) fileInput.value = "";
  renderFiles();
  updateTotalSizeBar();
}

/* ── File input ── */
function setFiles(fileListObj) {
  selectedFiles = [];
  for (let i = 0; i < fileListObj.length; i += 1) {
    selectedFiles.push(fileListObj[i]);
  }
  renderFiles();
}

/* ── Event Listeners ── */
form.addEventListener("change", function (event) {
  if (event.target === fileInput) return;
  if (event.target instanceof HTMLInputElement && event.target.name === "languageLevel") {
    clearLanguageError();
    syncLanguageChoices();
    return;
  }
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
    clearFieldError(event.target);
  }
  syncLanguageChoices();
});

form.addEventListener("input", function (event) {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
    clearFieldError(event.target);
  }
});

/* Inline validation on blur */
if (document.getElementById("fullName")) {
  document.getElementById("fullName").addEventListener("blur", function () {
    validateField(this, validateName);
  });
}
if (document.getElementById("email")) {
  document.getElementById("email").addEventListener("blur", function () {
    validateField(this, validateEmail);
  });
}
if (whatsappInput) {
  whatsappInput.addEventListener("blur", function () {
    validateField(this, validateWhatsApp);
  });
  /* Auto-format WhatsApp on input */
  whatsappInput.addEventListener("input", function (e) {
    const cursorPos = this.selectionStart;
    const oldLen = this.value.length;
    const formatted = formatWhatsApp(this.value);
    this.value = formatted;
    const newLen = formatted.length;
    const diff = newLen - oldLen;
    this.setSelectionRange(cursorPos + diff, cursorPos + diff);
  });
}

fileInput.addEventListener("change", function () {
  setFiles(fileInput.files);
});

uploadBox.addEventListener("keydown", function (event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  fileInput.click();
});

languageChoiceCards.forEach(function (card) {
  card.addEventListener("click", function () {
    selectLanguageChoice(card.querySelector('input[name="languageLevel"]'));
  });
});

languageInputs.forEach(function (input) {
  input.addEventListener("change", function () {
    selectLanguageChoice(input);
  });
});

/* Drag-and-drop with enhanced visual feedback */
uploadBox.addEventListener("dragover", function (event) {
  event.preventDefault();
  uploadBox.classList.add("is-dragover");
});

uploadBox.addEventListener("dragleave", function () {
  uploadBox.classList.remove("is-dragover");
});

uploadBox.addEventListener("drop", function (event) {
  event.preventDefault();
  uploadBox.classList.remove("is-dragover");
  if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
    setFiles(event.dataTransfer.files);
  }
});

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  await handleSubmission();
});

/* Init */
syncLanguageChoices();
renderFiles();
