import CustomSelect from "./CustomSelect";

export default function Form({
  formRef,
  selectedPack,
  currentStep,
  setCurrentStep,
  uploadFiles,
  setUploadFiles,
  uploadTotalSize,
  setUploadTotalSize,
}) {
  const maxTotalSize = 25 * 1024 * 1024;
  const uploadPercent = Math.min((uploadTotalSize / maxTotalSize) * 100, 100);
  const uploadFillClass =
    uploadPercent > 90
      ? "total-size-fill danger"
      : uploadPercent > 70
        ? "total-size-fill warning"
        : "total-size-fill";

  const syncSelectedFiles = (files) => {
    const selected = Array.from(files || []);
    setUploadFiles(selected);
    setUploadTotalSize(selected.reduce((total, file) => total + file.size, 0));
    if (typeof window !== "undefined") {
      window.__formFiles = selected;
    }
  };

  const removeSelectedFile = (indexToRemove) => {
    const nextFiles = uploadFiles.filter((_, index) => index !== indexToRemove);
    syncSelectedFiles(nextFiles);
    const fileInput = document.getElementById("documents");
    if (fileInput) fileInput.value = "";
  };

  return (
    <section
      ref={formRef}
      className={`form-section${selectedPack ? " expanded" : ""}`}
      id="contact"
    >
      <main className="page-shell">
        <section className="form-panel">
          <div className="panel-copy">
            <h2>عمّر الاستمارة وخلي فريقنا يتكلف بالباقي</h2>
            <p className="intro">
              دخل معلوماتك، اختار الباقة المناسبة، ورفع الوثائق ديالك باش نبداو
              الخدمة بشكل منظم وسريع.
            </p>
          </div>

          <div className="progress-bar">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`progress-step${step === currentStep ? " active" : ""}${step < currentStep ? " done" : ""}`}
              />
            ))}
          </div>
          <div className="step-counter">الخطوة {currentStep} من 3</div>

          <form id="candidate-form" className="candidate-form" noValidate>
            <div className={`wizard-step${currentStep === 1 ? " active" : ""}`}>
              <label className="field">
                <span>الاسم الكامل</span>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="أدخل الاسم الكامل"
                  required
                />
              </label>
              <br />

              <label className="field">
                <span>البريد الإلكتروني</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  required
                />
              </label>
              <br />

              <label className="field">
                <span>رقم واتساب</span>
                <div className="whatsapp-shell">
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    placeholder="6XX XXX XXX"
                    required
                    dir="ltr"
                  />
                </div>
              </label>
              <br />

              <label className="field" id="bank-label">
                <span>البنك</span>
                <CustomSelect
                  name="bank"
                  placeholder="اختر البنك"
                  required
                  defaultValue=""
                  options={[
                    { value: "البنك الشعبي", label: "البنك الشعبي" },
                    { value: "CIH", label: "CIH" },
                    { value: "كاش بلوس", label: "كاش بلوس" },
                  ]}
                />
              </label>
              <br />

              <div className="wizard-nav">
                <button
                  type="button"
                  className="wizard-next"
                  onClick={() => setCurrentStep(2)}
                >
                  التالي
                </button>
              </div>
            </div>

            <div className={`wizard-step${currentStep === 2 ? " active" : ""}`}>
              <fieldset className="field">
                <legend>هل لديك مستوى B1 أو B2؟</legend>
                <div className="option-grid">
                  <label className="choice-card">
                    <input
                      type="radio"
                      name="languageLevel"
                      value="B1"
                      required
                    />
                    <span>B1</span>
                  </label>
                  <label className="choice-card">
                    <input
                      type="radio"
                      name="languageLevel"
                      value="B2"
                      required
                    />
                    <span>B2</span>
                  </label>
                </div>
                <p
                  className="language-proof"
                  id="language-proof"
                  aria-live="polite"
                />
              </fieldset>

              <label className="field">
                <span>المجال</span>
                <div className="prefix-shell">
                  <span className="prefix-label">ausbildung als</span>
                  <input
                    type="text"
                    id="bereichSuffix"
                    name="bereichSuffix"
                    placeholder="مثال: pflege, it, logistik"
                    required
                  />
                </div>
                <small>البداية ثابتة ولا يمكن تغييرها.</small>
              </label>

              <div className="wizard-nav">
                <button
                  type="button"
                  className="wizard-prev"
                  onClick={() => setCurrentStep(1)}
                >
                  السابق
                </button>
                <button
                  type="button"
                  className="wizard-next"
                  onClick={() => setCurrentStep(3)}
                >
                  التالي
                </button>
              </div>
            </div>

            <div className={`wizard-step${currentStep === 3 ? " active" : ""}`}>
              <input
                type="hidden"
                id="bewerbungen"
                name="bewerbungen"
                value={selectedPack || ""}
              />

              <div className="field field-upload">
                <span>رفع الوثائق</span>

                <input
                  type="file"
                  id="documents"
                  name="documents"
                  className="file-input"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => syncSelectedFiles(e.target.files)}
                />

                <label
                  className="upload-box"
                  htmlFor="documents"
                  id="upload-box"
                  tabIndex={0}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("is-dragover");
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove("is-dragover");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("is-dragover");
                    syncSelectedFiles(e.dataTransfer.files);
                  }}
                >
                  <span className="upload-badge">الوثائق</span>
                  <strong>
                    {uploadFiles.length ? "الملفات المختارة" : "اختر الملفات"}
                  </strong>
                  <span className="upload-copy">
                    {uploadFiles.length
                      ? `${uploadFiles.length} ملف(ات) مختارة`
                      : "اضغط لاختيار الملفات أو اسحبها إلى هذه المساحة"}
                  </span>
                  <span className="upload-button">اختيار الملفات</span>
                </label>

                <small>
                  الأنواع المقبولة: PDF و DOC و DOCX و JPG و PNG. الحد الأقصى
                  10MB لكل ملف و 25MB للمجموع.
                </small>
              </div>

              <div className="file-list" id="file-list" aria-live="polite">
                {uploadFiles.map((file, index) => {
                  const ext = file.name.split(".").pop()?.toLowerCase() || "";
                  const icon =
                    ext === "pdf"
                      ? "PDF"
                      : ["doc", "docx"].includes(ext)
                        ? "DOC"
                        : ["jpg", "jpeg", "png"].includes(ext)
                          ? "IMG"
                          : ext.toUpperCase().slice(0, 3);

                  return (
                    <div key={`${file.name}-${file.size}-${index}`} className="file-item">
                      <div className="file-icon">{icon}</div>
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>
                      <button
                        type="button"
                        className="file-remove"
                        aria-label="Remove file"
                        onClick={() => removeSelectedFile(index)}
                      >
                        x
                      </button>
                    </div>
                  );
                })}
              </div>

              {uploadFiles.length > 0 && (
                <div className="total-size-bar" id="total-size-bar">
                  <div className="total-size-label">
                    <span>
                      {(uploadTotalSize / (1024 * 1024)).toFixed(1)} MB / 25 MB
                    </span>
                    <span>{Math.round(uploadPercent)}%</span>
                  </div>
                  <div className="total-size-track">
                    <div
                      className={uploadFillClass}
                      style={{ width: `${uploadPercent}%` }}
                    />
                  </div>
                </div>
              )}

              <p
                className="status-message"
                id="status-message"
                aria-live="polite"
              />

              <div className="wizard-nav">
                <button
                  type="button"
                  className="wizard-prev"
                  onClick={() => setCurrentStep(2)}
                >
                  السابق
                </button>
                <button type="submit" className="submit-button">
                  إرسال الاستمارة
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </section>
  );
}
