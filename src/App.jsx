import { useEffect } from "react";
import "./styles.css";

export default function App() {
  useEffect(() => {
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
  }, []);

  return (
    <div dir="rtl" lang="ar">
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <img
              className="header-logo"
              src="./von.png"
              alt="Von Marokko nach Deutschland"
            />
            <span className="logo-text">نحو ألمانيا</span>
          </div>
          <nav className="header-nav">
            <a href="#contact" className="nav-link">ابدأ الآن</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-card">
          <div className="hero-badge">
            <span className="badge-icon">🇩🇪</span>
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

            <div className="features">
              <div className="feature-item">
                <div className="feature-icon">✨</div>
                <div className="feature-text">
                  <strong>تصحيح مجاني</strong>
                  <span>ديال السيرة الذاتية والملف كامل</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📝</div>
                <div className="feature-text">
                  <strong>نموذج Anschreiben</strong>
                  <span>مناسب للبروفايل ديالك</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <div className="feature-text">
                  <strong>اختيار الشركات</strong>
                  <span>المناسبة بشكل مركز</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🚀</div>
                <div className="feature-text">
                  <strong>إرسال منظم ومكثف</strong>
                  <span>ديال الطلبات باسمك</span>
                </div>
              </div>
            </div>
          </div>

          <div className="packs">
            <div className="pack">
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
                <li>نموذج Anschreiben</li>
              </ul>
            </div>

            <div className="pack popular">
              <div className="popular-badge">
                <span>الأكثر طلباً</span>
              </div>
              <div className="pack-header">
                <h3>1000 bewerbung</h3>
                <span className="pack-tag">مميز</span>
              </div>
              <div className="pack-price">
                <span className="currency">درهم</span>
                <strong>400</strong>
              </div>
              <ul className="pack-features">
                <li>1000 طلب</li>
                <li>تصحيح السيرة الذاتية</li>
                <li>نموذج Anschreiben</li>
                <li>دعم مخصص</li>
              </ul>
            </div>
          </div>

          <div className="guarantee">
            <div className="guarantee-icon">🛡️</div>
            <div className="guarantee-text">
              <strong>ضمان الرضا</strong>
              <span>إلا ما كان حتى تفاعل أولي، كنزيدو دفعة إضافية مركزة فابور.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="form-section" id="contact">
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

            <form id="candidate-form" className="candidate-form" noValidate>
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
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  placeholder="+212 600000000"
                  required
                />
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

              <label className="field">
                <span>عدد الطلبات</span>
                <select
                  id="bewerbungen"
                  name="bewerbungen"
                  required
                  defaultValue=""
                >
                  <option value="">اختر العدد</option>
                  <option value="500 Bewerbung">500 Bewerbung</option>
                  <option value="1000 Bewerbung">1000 Bewerbung</option>
                </select>
              </label>

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

              <p
                className="status-message"
                id="status-message"
                aria-live="polite"
              />

              <button type="submit" className="submit-button">
                إرسال الاستمارة
              </button>
            </form>
          </section>
        </main>
      </section>
    </div>
  );
}
