import { Sparkles, Check, ShieldCheck, MessageCircle } from "lucide-react";
import CustomSelect from "./CustomSelect";

export function PacksSection({ selectedPack, setSelectedPack }) {
  return (
    <section className="pricing-section">
      <h2 className="section-title">
        <Sparkles size={22} className="section-icon" />
        اختار الباقة المناسبة ليك
      </h2>
      <div className="packs">
        {/* Silver Pack */}
        <div
          className={`pack silver reveal reveal-left${selectedPack === "500 Bewerbung" ? " pack-selected" : ""}`}
          onClick={() => setSelectedPack("500 Bewerbung")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") setSelectedPack("500 Bewerbung"); }}
        >
          {selectedPack === "500 Bewerbung" && (
            <div className="pack-check">
              <Check size={18} strokeWidth={3} />
            </div>
          )}
          <div className="pack-header">
            <h3>500 bewerbung</h3>
            <span className="pack-tag">Silver</span>
          </div>
          <div className="pack-price">
            <strong>200</strong>
            <span className="currency">درهم</span>
          </div>
          <ul className="pack-features">
            <li>500 طلب</li>
            <li>تصحيح السيرة الذاتية</li>
            <li><strong>anschreiben خاص بكل شركة</strong></li>
            <li>ماكطيحوش ف spam</li>
            <li>اخر العروض من جميع المواقع الالمانية</li>
          </ul>
          <button
            type="button"
            className="cta-btn"
            onClick={(e) => { e.stopPropagation(); setSelectedPack("500 Bewerbung"); }}
          >
            تسجيل
          </button>
        </div>

        {/* Gold Pack */}
        <div
          className={`pack gold popular reveal reveal-right${selectedPack === "1000 Bewerbung" ? " pack-selected" : ""}`}
          onClick={() => setSelectedPack("1000 Bewerbung")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") setSelectedPack("1000 Bewerbung"); }}
        >
          <div className="popular-ribbon">
            <span>
              <Sparkles size={12} />
              BEST SELLER
            </span>
          </div>
          {selectedPack === "1000 Bewerbung" && (
            <div className="pack-check">
              <Check size={18} strokeWidth={3} />
            </div>
          )}
          <div className="pack-header">
            <h3>1000 bewerbung</h3>
            <span className="pack-tag">Gold</span>
          </div>
          <div className="pack-price">
            <strong>400</strong>
            <span className="currency">درهم</span>
            <span className="strike">500</span>
          </div>
          <ul className="pack-features">
            <li>1000 طلب</li>
            <li>تصحيح السيرة الذاتية</li>
            <li><strong>anschreiben خاص بكل شركة</strong></li>
            <li>دعم مخصص</li>
            <li>ماكطيحوش ف spam</li>
            <li>اخر العروض من جميع المواقع الالمانية</li>
          </ul>
          <button
            type="button"
            className="cta-btn accent"
            onClick={(e) => { e.stopPropagation(); setSelectedPack("1000 Bewerbung"); }}
          >
            تسجيل
          </button>
        </div>
      </div>

      {/* Trust badges */}
      <div className="trust-badges reveal reveal-up">
        <div className="trust-badge-item">
          <ShieldCheck size={14} />
          <span>بيانات آمنة</span>
        </div>
        <div className="trust-badge-item">
          <Check size={14} />
          <span>نتائج مضمونة</span>
        </div>
        <div className="trust-badge-item">
          <MessageCircle size={14} />
          <span>دعم عبر الواتساب</span>
        </div>
      </div>
    </section>
  );
}

export function FormSection({
  selectedPack,
  currentStep,
  setCurrentStep,
  uploadFiles,
  setUploadFiles,
  uploadTotalSize,
  setUploadTotalSize,
  formRef,
}) {
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

          {/* Progress bar */}
          <div className="progress-bar">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`progress-step${step === currentStep ? " active" : ""}${step < currentStep ? " done" : ""}`}
              />
            ))}
          </div>
          <div className="step-counter">
            الخطوة {currentStep} من 3
          </div>

          <form id="candidate-form" className="candidate-form" noValidate>
            {/* Step 1: Personal Info */}
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

            {/* Step 2: Language & Field */}
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

            {/* Step 3: Documents + Submit */}
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
                  className="file-input"
                  type="file"
                  id="documents"
                  name="documents"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []);
                    setUploadFiles(selected);
                    setUploadTotalSize(selected.reduce((sum, f) => sum + f.size, 0));
                    window.__formFiles = selected;
                  }}
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
                    const dt = e.dataTransfer;
                    if (dt && dt.files && dt.files.length) {
                      const selected = Array.from(dt.files);
                      setUploadFiles(selected);
                      setUploadTotalSize(selected.reduce((sum, f) => sum + f.size, 0));
                      window.__formFiles = selected;
                    }
                  }}
                >
                  <span className="upload-badge">الوثائق</span>
                  <strong>{uploadFiles.length ? "الملفات المختارة" : "اختر الملفات"}</strong>
                  <span className="upload-copy">
                    {uploadFiles.length
                      ? uploadFiles.length + " ملف(ات) مختارة"
                      : "اضغط لاختيار الملفات أو اسحبها إلى هذه المساحة."}
                  </span>
                  <span className="upload-button">اختيار الملفات</span>
                </label>

                <small>
                  الأنواع المقبولة: PDF و DOC و DOCX و JPG و PNG. الحد الأقصى 10
                  MB لكل ملف و 25 MB للمجموع.
                </small>
              </div>

              {/* File list */}
              <div className="file-list" id="file-list" aria-live="polite">
                {uploadFiles.map((file, i) => {
                  const ext = file.name.split(".").pop()?.toLowerCase() || "";
                  const isImg = ["jpg","jpeg","png","gif","webp","bmp","svg"].includes(ext);
                  const icon = ["pdf"].includes(ext) ? "PDF" : ["doc","docx"].includes(ext) ? "DOC" : isImg ? "IMG" : ext.toUpperCase().slice(0, 3);
                  return (
                    <div key={i} className="file-item">
                      <div className="file-icon">{icon}</div>
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                      </div>
                      <button
                        type="button"
                        className="file-remove"
                        aria-label="إزالة الملف"
                        onClick={() => {
                          const next = uploadFiles.filter((_, j) => j !== i);
                          setUploadFiles(next);
                          setUploadTotalSize(next.reduce((sum, f) => sum + f.size, 0));
                          window.__formFiles = next;
                          const fi = document.getElementById("documents");
                          if (fi) fi.value = "";
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              {uploadFiles.length > 0 && (
                <div className="total-size-bar" id="total-size-bar">
                  <div className="total-size-label">
                    <span id="total-size-text">{(uploadTotalSize / (1024 * 1024)).toFixed(1)} MB / 25 MB</span>
                    <span id="total-size-pct">{Math.round(Math.min((uploadTotalSize / (25 * 1024 * 1024)) * 100, 100))}%</span>
                  </div>
                  <div className="total-size-track">
                    <div
                      className={`total-size-fill${Math.min((uploadTotalSize / (25 * 1024 * 1024)) * 100, 100) > 90 ? " danger" : Math.min((uploadTotalSize / (25 * 1024 * 1024)) * 100, 100) > 70 ? " warning" : ""}`}
                      id="total-size-fill"
                      style={{ width: Math.min((uploadTotalSize / (25 * 1024 * 1024)) * 100, 100) + "%" }}
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
