import { useEffect, useState, useRef, useCallback } from "react";
import {
  Globe, Sparkles, FileText, Target, Rocket, ShieldCheck,
  Sun, Moon, Check, ChevronDown, Star, MessageCircle,
  MessageSquare, HelpCircle
} from "lucide-react";
import "./styles.css";

/* ── FAQ data ── */
const FAQ_ITEMS = [
  {
    q: "كيفاش كاتخدم الخدمة بالضبط؟",
    a: "من بعد ما تختار الباقة وتملي الاستمارة، فريقنا كيصحح الـ CV والـ Anschreiben ديالك، كيختار الشركات المناسبة لبروفايلك، وكيرسل الطلبات باسمك بشكل منظم. كامل الخدمة عن بعد وعبر الواتساب.",
  },
  {
    q: "فين كترسلو الطلبات؟ فأي مدن ف ألمانيا؟",
    a: "كنرسلو الطلبات ف جميع الولايات الألمانية حسب المجال ديالك. كنركزو على المدن والمناطق اللي كاين فيها طلب كبير على التخصص ديالك.",
  },
  {
    q: "شحال كاتاخد العملية من البداية حتى الإرسال؟",
    a: "من اللحظة اللي كاتصيفط لينا الوثائق كاملة، العملية كاتاخد من 3 إلى 7 أيام عمل باش نجهزو كلشي ونبداو فالإرسال.",
  },
  {
    q: "واش مضمون نوصل لشي مقابلة ولا عقد؟",
    a: "حنا كنضمنو ليك أنو غادي توصلك ردود وتفاعلات من الشركات. إلا ما وصل حتى تفاعل أولي، كنزيدو نرسلو دفعة إضافية مركزة فابور.",
  },
  {
    q: "شنو الوثائق اللي خاصني نصيفط؟",
    a: "السيرة الذاتية (CV) باللغة الألمانية، الشواهد والدبلومات، وشهادات العمل والخبرة إلا كانو عندك. يعني أي وثيقة تقدر تعزز الطلب ديالك.",
  },
];

/* ── Testimonial data ── */
const TESTIMONIALS = [
  {
    text: "خدمة رائعة! تصحيح الـ CV كان احترافي ووصلاتني بزاف ديال الردود من شركات ف ميونيخ وبرلين. أنصح بها بشدة.",
    author: "محمد",
    city: "الدار البيضاء",
  },
  {
    text: "المعاملة كانت مزيانة والتنظيم دياولهم عجبني. الفريق تابع معايا خطوة بخطوة حتى تأكد بلي كاين تفاعل.",
    author: "فاطمة",
    city: "مراكش",
  },
  {
    text: "خدمتهم نقية وصافي. أنا شخصياً وصلت لمقابلة ف أسبوعين من مور ما بداو الإرسال. شكراً ليكم.",
    author: "يوسف",
    city: "طنجة",
  },
];

export default function App() {
  const [selectedPack, setSelectedPack] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [lightMode, setLightMode] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [featureVisible, setFeatureVisible] = useState([]);

  const formRef = useRef(null);
  const featureRefs = useRef([]);

  /* ── Light mode toggle (dark is default) ── */
  useEffect(() => {
    const saved = localStorage.getItem("lightMode");
    if (saved === "true") {
      setLightMode(true);
      document.documentElement.classList.add("light");
    }
  }, []);

  useEffect(() => {
    if (lightMode) {
      document.documentElement.classList.add("light");
      localStorage.setItem("lightMode", "true");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("lightMode", "false");
    }
  }, [lightMode]);

  /* ── Simulate initial load for skeleton ── */
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(t);
  }, []);

  /* ── Auto-scroll to form on pack select ── */
  useEffect(() => {
    if (selectedPack && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [selectedPack]);

  /* ── Staggered feature animation ── */
  useEffect(() => {
    if (!loaded) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.fidx);
            setFeatureVisible((prev) => {
              if (prev.includes(idx)) return prev;
              return [...prev, idx];
            });
          }
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -40px 0px" }
    );

    const els = document.querySelectorAll(".feature-item");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loaded]);

  /* ── Download results handler ── */
  const downloadResults = useCallback(() => {
    const data = {
      pack: selectedPack,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bewerbung-details.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedPack]);

  /* ── Success close ── */
  const closeSuccess = useCallback(() => {
    setSubmitted(false);
    setSelectedPack(null);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ── Listen for form submit success from public/script.js ── */
  useEffect(() => {
    const handler = () => setSubmitted(true);
    window.addEventListener("formSubmissionSuccess", handler);
    return () => window.removeEventListener("formSubmissionSuccess", handler);
  }, []);

  /* ── Firebase scripts (lazy: only load when form section mounts) ── */
  useEffect(() => {
    if (!selectedPack) return;

    const scriptSources = [
      "https://www.gstatic.com/firebasejs/12.7.0/firebase-app-compat.js",
      "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore-compat.js",
      "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage-compat.js",
      "/script.js",
    ];

    const addedScripts = scriptSources.map((src) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      document.body.appendChild(script);
      return script;
    });

    return () => {
      addedScripts.forEach((script) => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [selectedPack]);

  /* ── Render ── */
  return (
    <div dir="rtl" lang="ar">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <img
                className="header-logo"
                src="./von.png"
                alt="Von Marokko nach Deutschland"
              />
              <span className="logo-text">نحو ألمانيا</span>
            </div>
            <button
              className="dark-toggle"
              onClick={() => setLightMode((l) => !l)}
              aria-label={lightMode ? "الوضع الليلي" : "الوضع النهاري"}
              title={lightMode ? "الوضع الليلي" : "الوضع النهاري"}
            >
              {lightMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
          <nav className="header-nav">
            <a href="#contact" className="nav-link">ابدأ الآن</a>
          </nav>
        </div>
      </header>

      {/* ── Success Overlay ── */}
      {submitted && (
        <div className="success-overlay" onClick={closeSuccess}>
          <div className="success-card" onClick={(e) => e.stopPropagation()}>
            <div className="success-check">
              <Check size={36} strokeWidth={3} />
            </div>
            <h3>تم بنجاح</h3>
            <p>
              توصلنا بالاستمارة ديالك. غادي نبداو الخدمة ونتواصلو معاك عبر
              الواتساب ف أقرب وقت.
            </p>
            <button className="submit-button" onClick={closeSuccess}>
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-card">
          {!loaded ? (
            /* Skeleton loader */
            <div>
              <div className="skeleton skeleton-badge" />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" style={{ width: "85%" }} />
              <div className="skeleton skeleton-text" style={{ width: "60%", marginBottom: 28 }} />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton skeleton-feature" />
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginTop: 20,
                }}
              >
                <div className="skeleton skeleton-pack" />
                <div className="skeleton skeleton-pack" />
              </div>
            </div>
          ) : (
            <>
              <div className="hero-badge">
                <Globe className="badge-icon" size={22} />
                <span className="badge-text">عرض خاص لحاملي B1 / B2</span>
              </div>

              <div className="hero-content">
                <h1 className="hero-title">
                  <span className="highlight">اش بان لك</span>
                  <br />
                  تمشي المانيا ب 400 درهم
                </h1>

                <p className="subtitle">
                  خدمة موجهة للناس اللي عندهم{" "}
                   <strong>B1 أو B2 فالألمانية</strong>
                  وكيقلبو على تكوين مهني وفرص مناسبة فألمانيا.
                </p>

                {/* Stat bar */}
                <div className="stats-bar">
                  <div className="stat-item">
                    <Check size={16} />
                    <span>
                      <strong>+500</strong> مرشح تمت مساعدتهم
                    </span>
                  </div>
                  <div className="stat-item">
                    <Star size={16} />
                    <span>
                      <strong>%98</strong> نسبة الرضا
                    </span>
                  </div>
                  <div className="stat-item">
                    <Rocket size={16} />
                    <span>
                      <strong>+100,000</strong> طلب تم إرسالهم
                    </span>
                  </div>
                </div>
              </div>

              <div className="features">
                {[
                  {
                    Icon: Sparkles,
                    title: "تصحيح مجاني",
                    desc: "ديال السيرة الذاتية والملف كامل",
                  },
                  {
                    Icon: FileText,
                    title: "anschreiben خاص بكل شركة",
                    desc: "مناسب للبروفايل ديالك",
                  },
                  {
                    Icon: Target,
                    title: "اختيار الشركات",
                    desc: "المناسبة بشكل مركز",
                  },
                  {
                    Icon: Rocket,
                    title: "إرسال منظم ومكثف",
                    desc: "ديال الطلبات باسمك",
                  },
                  {
                    Icon: ShieldCheck,
                    title: "ضمان الرضا",
                    desc: "إلا ما كان حتى تفاعل أولي، كنزيدو دفعة إضافية مركزة فابور.",
                  },
                ].map(({ Icon, title, desc }, i) => (
                  <div
                    key={i}
                    className={`feature-item${featureVisible.includes(i) ? " visible" : ""}`}
                    data-fidx={i}
                    style={{ transitionDelay: featureVisible.includes(i) ? `${i * 0.1}s` : "0s" }}
                  >
                    <div className="feature-icon">
                      <Icon size={24} />
                    </div>
                    <div className="feature-text">
                      <strong>{title}</strong>
                      <span>{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Packs */}
          <div className="packs">
            <div
              className={`pack${selectedPack === "500 Bewerbung" ? " pack-selected" : ""}`}
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
                <span className="pack-tag">اقتصادي</span>
              </div>
              <div className="pack-price">
                <span className="currency">درهم</span>
                <strong>200</strong>
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
                اختر الباقة
              </button>
            </div>

            <div
              className={`pack popular${selectedPack === "1000 Bewerbung" ? " pack-selected" : ""}`}
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
                <span className="pack-tag">مميز</span>
              </div>
              <div className="pack-price">
                <span className="currency">درهم</span>
                <strong>400</strong>
                <span className="strike">200</span>
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
                اختر الباقة المميزة
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="trust-badges">
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
        </div>
      </section>

      {/* ── Form Section ── */}
      <section
        ref={formRef}
        className={`form-section${selectedPack ? " expanded" : ""}`}
        id="contact"
      >
        <main className="page-shell">
          <section className="form-panel">
            <div className="panel-copy">
              <p className="eyebrow">الحجز</p>
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

                <label className="field">
                  <span>رقم واتساب</span>
                  <div className="whatsapp-shell">
                    <span className="whatsapp-prefix">
                    <Globe size={14} />
                    +212
                  </span>
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

                <label className="field">
                  <span>البنك</span>
                  <select id="bank" name="bank" required defaultValue="">
                    <option value="">اختر البنك</option>
                    <option value="البنك الشعبي">البنك الشعبي</option>
                    <option value="CIH">CIH</option>
                    <option value="كاش بلوس">كاش بلوس</option>
                  </select>
                </label>

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
                  />

                  <label
                    className="upload-box"
                    htmlFor="documents"
                    id="upload-box"
                    tabIndex={0}
                  >
                    <span className="upload-badge">الوثائق</span>
                    <strong>اختر الملفات</strong>
                    <span className="upload-copy">
                      اضغط لاختيار الملفات أو اسحبها إلى هذه المساحة.
                    </span>
                    <span className="upload-button">اختيار الملفات</span>
                  </label>

                  <small>
                    الأنواع المقبولة: PDF و DOC و DOCX و JPG و PNG. الحد الأقصى 10
                    MB لكل ملف و 25 MB للمجموع.
                  </small>
                </div>

                <div className="file-list" id="file-list" aria-live="polite" />
                <div className="total-size-bar" id="total-size-bar" style={{ display: "none" }}>
                  <div className="total-size-label">
                    <span id="total-size-text">0 MB / 25 MB</span>
                    <span id="total-size-pct">0%</span>
                  </div>
                  <div className="total-size-track">
                    <div className="total-size-fill" id="total-size-fill" style={{ width: "0%" }} />
                  </div>
                </div>

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

      {/* ── Testimonials ── */}
      <section className="testimonials-section">
        <h2 className="section-title">
          <MessageSquare size={22} className="section-icon" />
          آراء بعض المستفيدين
        </h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--color-warning)" strokeWidth={1} />
                ))}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <p className="testimonial-author">{t.author}</p>
              <p className="testimonial-city">{t.city}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ Accordion ── */}
      <section className="faq-section">
        <h2 className="section-title">
          <HelpCircle size={22} className="section-icon" />
          الأسئلة الشائعة
        </h2>
        <div className="faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="faq-item">
              <button
                type="button"
                className="faq-question"
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={18}
                  className={`faq-arrow${faqOpen === i ? " open" : ""}`}
                />
              </button>
              <div className={`faq-answer${faqOpen === i ? " open" : ""}`}>
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      {/* ── Floating WhatsApp Button ── */}
      <a
        href="https://wa.me/212699771759"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="تواصل معنا عبر الواتساب"
        title="تواصل معنا عبر الواتساب"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </a>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} نحو ألمانيا — Von Marokko nach Deutschland</p>
        <p>جميع الحقوق محفوظة</p>
        <a
          href="https://wa.me/212699771759"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-whatsapp"
        >
          <MessageCircle size={18} />
          <span>تواصل معنا عبر الواتساب</span>
        </a>
        <br />
        <small>نحو ألمانيا — خدمة موجهة للحاصلين على ديبلوم اللغة الالمانية</small>
      </footer>
    </div>
  );
}
