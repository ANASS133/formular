# coding: utf-8
import base64
import re

html_content = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نموذج التسجيل</title>
    <!-- Import Supabase -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <!-- Import Design -->
    <link rel="stylesheet" href="src/styles.css">
    <style>
        /* Extra styles specifically to make the standalone form work/look exactly like React App */
        body { 
            padding: 20px; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
        }
        .form-container { 
            width: 100%; 
            max-width: 600px; 
            background: var(--color-surface); 
            backdrop-filter: blur(20px); 
            border: 1px solid var(--color-border); 
            border-radius: var(--radius-xl); 
            padding: 40px; 
            box-shadow: var(--shadow-lg); 
        }
        .intro { text-align: center; color: var(--color-muted); font-size: 0.95rem; margin-bottom: 25px; line-height: 1.6;}
        .form-container h2 { text-align: center; margin-bottom: 15px; font-size: 1.6rem;}
        
        .progress-bar { display: flex; gap: 8px; margin-bottom: 24px; }
        .progress-step { flex: 1; height: 5px; border-radius: 3px; background: var(--color-surface-hover); transition: background 0.3s; }
        .progress-step.active { background: var(--color-primary); box-shadow: 0 0 8px var(--color-primary-glow); }
        .progress-step.done { background: var(--color-success); }
        
        .step-counter { text-align: center; color: var(--color-muted); font-size: 0.82rem; font-weight: 700; margin-bottom: 18px; }
        
        .wizard-step { display: none; }
        .wizard-step.active { display: block; animation: stepIn 350ms var(--ease-out) both; }
        
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .prefix-shell {
            display: flex; 
            align-items: stretch; 
            border: 1px solid var(--color-border); 
            border-radius: var(--radius-sm); 
            overflow: hidden; 
            background: var(--color-surface);
        }
        .prefix-shell input:focus { border: none !important; box-shadow: none !important;}
        .prefix-shell:focus-within { border-color: var(--color-primary-glow); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .prefix-label { 
            padding: 0 16px; 
            background: rgba(0,0,0,0.2); 
            display: flex; 
            align-items: center; 
            font-size: 0.85rem; 
            color: var(--color-muted);
        }
        .prefix-shell input { 
            border: none !important; 
            height: 50px; 
            flex: 1; 
            padding: 0 16px; 
            background: transparent; 
            outline: none; 
            color: var(--color-text);
        }

        /* --- Service Cards --- */
        #pack-selection {
            width: 100%;
        }
        /* Mobile fixes for packs */
        @media (max-width: 768px) {
            .packs {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>

<div class="form-container" id="main-container">
    <div style="text-align: center; margin-bottom: 30px;">
        <h2>عمّر الاستمارة وخلي فريقنا يتكلف بالباقي</h2>
        <p class="intro" id="intro-text">دخل معلوماتك، اختار الباقة المناسبة، ورفع الوثائق ديالك باش نبداو الخدمة بشكل منظم وسريع.</p>
    </div>

    <!-- Packs Selection (translated from App.jsx) -->
    <div id="pack-selection" style="display: block;">
        <div class="packs">
          <div class="pack silver" onclick="selectBewerbungPack('500 Bewerbung')">
            <div class="pack-header">
              <h3 class="pack-title">500 Bewerbung</h3>
              <div class="pack-price">250<span>dh</span></div>
            </div>
            <ul class="pack-features">
              <li>تصحيح السيرة الذاتية<span class="check-icon">✓</span></li>
              <li>تصحيح رسالة التحفيز<span class="check-icon">✓</span></li>
              <li>إرسال 500 طلب<span class="check-icon">✓</span></li>
              <li class="disabled">مرافقة للمقابلة<span class="cross-icon">✗</span></li>
            </ul>
            <button class="cta-btn silver-btn" style="width: 100%;">اختيار هذه الباقة</button>
          </div>

          <div class="pack gold popular" onclick="selectBewerbungPack('1000 Bewerbung')">
            <div class="popular-ribbon">الأكثر طلباً</div>
            <div class="pack-header">
              <h3 class="pack-title">1000 Bewerbung</h3>
              <div class="pack-price">350<span>dh</span></div>
            </div>
            <ul class="pack-features">
              <li>تصحيح السيرة الذاتية<span class="check-icon">✓</span></li>
              <li>تصحيح رسالة التحفيز<span class="check-icon">✓</span></li>
              <li>إرسال 1000 طلب<span class="check-icon">✓</span></li>
              <li>مرافقة للمقابلة<span class="check-icon">✓</span></li>
            </ul>
            <button class="cta-btn gold-btn" style="width: 100%;">اختيار هذه الباقة</button>
          </div>
        </div>
    </div>

    <!-- The actual Form -->
    <div id="form-wrapper" style="display: none;">
        <!-- Progress bar -->
        <div class="progress-bar">
        <div class="progress-step active" id="prog-1"></div>
        <div class="progress-step" id="prog-2"></div>
        <div class="progress-step" id="prog-3"></div>
    </div>
    <div class="step-counter" id="step-counter">الخطوة 1 من 3</div>

    <form id="applicationForm" class="candidate-form">
        <input type="hidden" id="selected_pack" value="">
        <!-- Step 1 -->
        <div class="wizard-step active" id="step-1">
            <label class="field">
                <span>الاسم الكامل</span>
                <input type="text" id="full_name" placeholder="أدخل الاسم الكامل" required>
            </label>

            <label class="field">
                <span>البريد الإلكتروني</span>
                <input type="email" id="email" placeholder="name@example.com" required>
            </label>

            <label class="field">
                <span>رقم واتساب</span>
                <div class="whatsapp-shell">
                    <input type="tel" id="whatsapp" placeholder="6XX XXX XXX" required dir="ltr">
                </div>
            </label>

            <label class="field" style="margin-bottom: 10px;">
                <span>البنك</span>
                <select id="bank" required>
                    <option value="">-- اختر البنك --</option>
                    <option value="CIH">CIH</option>
                    <option value="Chaabi">البنك الشعبي</option>
                    <option value="Attijari">التجاري وفا بنك</option>
                    <option value="Other">بنك آخر</option>
                </select>
            </label>

            <div class="wizard-nav">
                <button type="button" class="wizard-next" onclick="nextStep(2)">التالي</button>
            </div>
        </div>

        <!-- Step 2 -->
        <div class="wizard-step" id="step-2">
            <fieldset class="field" style="border: none; margin: 0; padding: 0;">
                <span style="font-size: 0.9rem; margin-bottom: 8px; display: block;">هل لديك مستوى B1 أو B2؟</span>
                <div class="option-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <label class="choice-card" style="display: flex; align-items: center; justify-content: center; height: 60px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; transition: 0.2s;">
                        <input type="radio" name="language_level" value="B1" required onchange="updateRadioStyles()" style="display: none;">
                        <span>B1</span>
                    </label>
                    <label class="choice-card" style="display: flex; align-items: center; justify-content: center; height: 60px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; transition: 0.2s;">
                        <input type="radio" name="language_level" value="B2" required onchange="updateRadioStyles()" style="display: none;">
                        <span>B2</span>
                    </label>
                </div>
            </fieldset>

            <label class="field" style="margin-top: 20px; margin-bottom: 10px;">
                <span>المجال</span>
                <div class="prefix-shell">
                    <span class="prefix-label">ausbildung als</span>
                    <input type="text" id="field" placeholder="مثال: pflege, it, logistik" required>
                </div>
                <small style="color: var(--color-muted); font-size: 0.8rem; margin-top: 4px;">البداية ثابتة ولا يمكن تغييرها.</small>
            </label>

            <div class="wizard-nav">
                <button type="button" class="wizard-prev" onclick="prevStep(1)">السابق</button>
                <button type="button" class="wizard-next" onclick="nextStep(3)">التالي</button>
            </div>
        </div>

        <!-- Step 3 -->
        <div class="wizard-step" id="step-3">
            <div class="field field-upload">
                <span>رفع الوثائق (Lebenslauf, Anschreiben, Zeugnisse...)</span>

                <input class="file-input" type="file" id="documents" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style="position: absolute; opacity: 0; width: 0; height: 0;">

                <label class="upload-box" for="documents" id="upload-box" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 35px 20px; border: 2px dashed var(--color-border-strong); background: var(--color-surface); border-radius: var(--radius-md); transition: 0.3s; cursor: pointer; margin-top: 8px;">
                    <span class="upload-badge" style="background: var(--color-primary-soft); color: var(--color-primary); padding: 4px 14px; border-radius: 999px; font-size: 0.75rem; font-weight: 800;">اختر الملفات</span>
                    <strong id="upload-title" style="margin-top: 15px; font-size: 1rem; color: var(--color-text);">اضغط لاختيار الملفات أو اسحبها إلى هذه المساحة</strong>
                    <span class="upload-copy" id="upload-desc" style="margin: 8px 0 15px; font-size: 0.85rem; color: var(--color-muted);">اختيار الملفات (PDF, DOCX...)</span>
                    <span class="upload-button" style="pointer-events: none; min-height: 40px; padding: 0 20px; font-size: 0.85rem;"></span>
                </label>

                <small style="color: var(--color-muted); font-size: 0.75rem; margin-top: 10px; display: block;">
                    الأنواع المقبولة: PDF، DOC، DOCX، JPG، PNG. الحد الأقصى 10MB لكل ملف و 25MB للمجموع.
                </small>
            </div>

            <div class="wizard-nav" style="margin-top: 30px;">
                <button type="button" class="wizard-prev" onclick="prevStep(2)">السابق</button>
                <button type="submit" class="submit-button" id="submitBtn" style="flex: 2; padding: 12px; font-size: 1.1rem; height: 48px;">إرسال الاستمارة</button>
            </div>
            
            <div id="message" style="margin-top: 15px; font-weight: bold; text-align: center; border-radius: var(--radius-sm); padding: 10px; display: none;"></div>
        </div>
    </form>
</div>

<script>
    // Pack Selection Logic
    function selectBewerbungPack(packName) {
        document.getElementById('selected_pack').value = packName;
        document.getElementById('pack-selection').style.display = 'none';
        document.getElementById('form-wrapper').style.display = 'block';
    }

    // Navigation Logic within Pure JS (like App.jsx)
    function nextStep(step) {
        // Validate current step
        const currentStepEl = document.getElementById(step-);
        const inputs = currentStepEl.querySelectorAll('input, select');
        for (let input of inputs) {
            if (!input.checkValidity()) {
                input.reportValidity();
                return;
            }
        }
        showStep(step);
    }

    function prevStep(step) {
        showStep(step);
    }

    function showStep(step) {
        document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
        document.getElementById(step-).classList.add('active');

        document.querySelectorAll('.progress-step').forEach((el, index) => {
            el.classList.remove('active', 'done');
            if (index + 1 === step) el.classList.add('active');
            if (index + 1 < step) el.classList.add('done');
        });

        document.getElementById('step-counter').innerText = الخطوة  من 3;
    }

    // Radio button styling exactly like the React App
    function updateRadioStyles() {
        document.querySelectorAll('.choice-card').forEach(card => {
            if (card.querySelector('input').checked) {
                card.style.borderColor = 'var(--color-primary-glow)';
                card.style.background = 'var(--color-primary-soft)';
                card.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            } else {
                card.style.borderColor = 'var(--color-border)';
                card.style.background = 'transparent';
                card.style.boxShadow = 'none';
            }
        });
    }

    // File Input UI Logic
    const fileInput = document.getElementById('documents');
    fileInput.addEventListener('change', (e) => {
        const title = document.getElementById('upload-title');
        const desc = document.getElementById('upload-desc');
        const filesCount = e.target.files.length;
        if (filesCount > 0) {
            title.innerText = "الملفات المختارة";
            desc.innerText = ${filesCount} ملف(ات) مختارة;
            document.getElementById('upload-box').style.borderColor = 'var(--color-primary)';
            document.getElementById('upload-box').style.background = 'var(--color-primary-soft)';
        } else {
            title.innerText = "اضغط لاختيار الملفات أو اسحبها إلى هذه المساحة";
            desc.innerText = "اختيار الملفات (PDF, DOCX...)";
            document.getElementById('upload-box').style.borderColor = 'var(--color-border-strong)';
            document.getElementById('upload-box').style.background = 'var(--color-surface)';
        }
    });

    // Supabase Configuration
    const SUPABASE_URL = "https://vaoooziexlywonrfbvf.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_6A9kpLoCUCYWBF8F0x6CfQ_p6np_N97";
    const SUPABASE_STORAGE_BUCKET = "applications";
    const SUPABASE_TABLE = "applications";

    // Initialize Supabase Client
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    document.getElementById('applicationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        const messageEl = document.getElementById('message');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري الإرسال...';
        messageEl.style.display = 'block';
        messageEl.style.color = 'var(--color-text)';
        messageEl.style.background = 'var(--color-surface)';
        messageEl.textContent = 'المرجو الانتظار...';

        try {
            // 1. Gather form data
            const fullName = document.getElementById('full_name').value;
            const email = document.getElementById('email').value;
            const whatsapp = document.getElementById('whatsapp').value;
            const bank = document.getElementById('bank').value;
            const languageLevel = document.querySelector('input[name="language_level"]:checked').value;
            const field = document.getElementById('field').value;
            const files = document.getElementById('documents').files;

            // 2. Validate file sizes (Max 10MB per file, 25MB total)
            let totalSize = 0;
            for (let i = 0; i < files.length; i++) {
                if (files[i].size > 10 * 1024 * 1024) throw new Error(الملف  يتجاوز الحد الأقصى 10MB.);
                totalSize += files[i].size;
            }
            if (totalSize > 25 * 1024 * 1024) throw new Error("مجموع حجم الملفات يتجاوز 25MB.");

            // 3. Upload files to Supabase Storage
            let uploadedDocs = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExt = file.name.split('.').pop();
                const fileName = ${Date.now()}_.;
                
                const { data, error } = await supabaseClient.storage.from(SUPABASE_STORAGE_BUCKET).upload(fileName, file);
                if (error) throw error;
                uploadedDocs.push(data.path);
            }

            // 4. Save Record to Supabase Database
            const selectedPack = document.getElementById('selected_pack').value;
            const { error: dbError } = await supabaseClient.from(SUPABASE_TABLE).insert([{
                pack: selectedPack, full_name: fullName, email: email, whatsapp: whatsapp, bank: bank,
                language_level: languageLevel, field: field, documents: uploadedDocs
            }]);

            if (dbError) throw dbError;

            // Success
            messageEl.style.color = 'var(--color-success)';
            messageEl.style.background = 'rgba(34, 197, 94, 0.1)';
            messageEl.textContent = 'تم الإرسال بنجاح!';
            document.getElementById('applicationForm').reset();
            updateRadioStyles();
            fileInput.dispatchEvent(new Event('change'));
            
            setTimeout(() => {
                showStep(1);
                messageEl.style.display = 'none';
            }, 3000);

        } catch (error) {
            console.error(error);
            messageEl.style.color = 'var(--color-danger)';
            messageEl.style.background = 'rgba(239, 68, 68, 0.1)';
            messageEl.textContent = 'حدث خطأ: ' + error.message;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'إرسال الاستمارة';
        }
    });

</script>
</body>
</html>
"""

with open('new.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Rewritten exactly to the standard form but with correctly placed Arabic strings")
