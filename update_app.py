import codecs

with codecs.open('src/App.jsx', 'r', 'utf-8') as f:
    content = f.read()

# 1. Imports
import_find = '''import "./styles.css";
import CustomSelect from "./CustomSelect";
import { initFormHandler } from "./formHandler.js";'''

import_replace = '''import "./styles.css";
import CustomSelect from "./CustomSelect";
import { createClient } from "@supabase/supabase-js";

// Supabase Configuration
const SUPABASE_URL = "https://vaaoosziexlywonrfbvf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_6A9kpLoCUCYWBF8F0x6CfQ_p6np_N97";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const SUPABASE_STORAGE_BUCKET = "applications";
const SUPABASE_TABLE = "applications";'''

content = content.replace(import_find, import_replace)

# 2. State
state_find = '''  const [uploadTotalSize, setUploadTotalSize] = useState(0);

  const formRef = useRef(null);'''

state_replace = '''  const [uploadTotalSize, setUploadTotalSize] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ text: "", type: "" });

  const formRef = useRef(null);'''

content = content.replace(state_find, state_replace)

# 3. Effect -> HandleSubmit
effect_find = '''  /* ── Form handler (binds upload logic after form mounts) ── */
  useEffect(() => {
    if (!selectedPack) return;
    initFormHandler();
  }, [selectedPack]);'''

effect_replace = '''  const handleNextStep = (targetStep, currentStepNumber) => {
    const currentStepEl = document.querySelectorAll('.wizard-step')[currentStepNumber - 1];
    if (currentStepEl) {
      const inputs = currentStepEl.querySelectorAll('input, select');
      for (let input of inputs) {
        if (!input.checkValidity()) {
          input.reportValidity();
          return;
        }
      }
    }
    setCurrentStep(targetStep);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPack) return;

    setIsSubmitting(true);
    setSubmitMessage({ text: "المرجو الانتظار...", type: "info" });

    try {
      const fullName = document.getElementById('fullName')?.value || "";
      const email = document.getElementById('email')?.value || "";
      const whatsapp = document.getElementById('whatsapp')?.value || "";
      const bank = document.querySelector('input[name="bank"]')?.value || document.querySelector('select[name="bank"]')?.value || "";
      const languageLevel = document.querySelector('input[name="languageLevel"]:checked')?.value || "";
      const field = document.getElementById('bereichSuffix')?.value || "";
      const files = uploadFiles;

      let totalSize = 0;
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > 10 * 1024 * 1024) throw new Error("الملف " + files[i].name + " يتجاوز الحد الأقصى 10MB.");
        totalSize += files[i].size;
      }
      if (totalSize > 25 * 1024 * 1024) throw new Error("مجموع حجم الملفات يتجاوز 25MB.");

      let uploadedDocs = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = Date.now() + '_' + Math.random().toString(36).substring(7) + '.' + fileExt;
        
        const { data, error } = await supabaseClient.storage.from(SUPABASE_STORAGE_BUCKET).upload(fileName, file);
        if (error) throw error;
        uploadedDocs.push(data.path);
      }

      const { error: dbError } = await supabaseClient.from(SUPABASE_TABLE).insert([{
        pack: selectedPack, full_name: fullName, email: email, whatsapp: whatsapp, bank: bank,
        language_level: languageLevel, field: field, documents: uploadedDocs
      }]);

      if (dbError) throw dbError;

      setSubmitMessage({ text: "تم الإرسال بنجاح!", type: "success" });
      setSubmitted(true);
      
      document.getElementById('candidate-form').reset();
      setUploadFiles([]);
      setUploadTotalSize(0);
      
      setTimeout(() => {
        setSubmitMessage({ text: "", type: "" });
        setCurrentStep(1);
        setSelectedPack(null);
      }, 3000);

    } catch (error) {
      console.error(error);
      setSubmitMessage({ text: "حدث خطأ: " + error.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };'''

content = content.replace(effect_find, effect_replace)

# 4. Replace form element
content = content.replace('<form id="candidate-form" className="candidate-form" noValidate>', '<form id="candidate-form" className="candidate-form" noValidate onSubmit={handleSubmit}>')

# 5. Replace buttons
content = content.replace('''<button
                    type="button"
                    className="wizard-next"
                    onClick={() => setCurrentStep(2)}
                  >
                    التالي
                  </button>''', '''<button
                    type="button"
                    className="wizard-next"
                    onClick={() => handleNextStep(2, 1)}
                  >
                    التالي
                  </button>''')

content = content.replace('''<button
                    type="button"
                    className="wizard-next"
                    onClick={() => setCurrentStep(3)}
                  >
                    التالي
                  </button>''', '''<button
                    type="button"
                    className="wizard-next"
                    onClick={() => handleNextStep(3, 2)}
                  >
                    التالي
                  </button>''')

content = content.replace('''<button type="submit" className="submit-button">
                    إرسال الاستمارة
                  </button>''', '''<button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? "جاري الإرسال..." : "إرسال الاستمارة"}
                  </button>''')

# 6. Add submitMessage div
message_div = '''                <div className="wizard-nav">
                  <button
                    type="button"
                    className="wizard-prev"
                    onClick={() => setCurrentStep(2)}
                  >
                    السابق
                  </button>
                  <button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? "جاري الإرسال..." : "إرسال الاستمارة"}
                  </button>
                </div>

                {submitMessage.text && (
                  <div style={{
                    marginTop: '15px', fontWeight: 'bold', textAlign: 'center',
                    borderRadius: 'var(--radius-sm)', padding: '10px',
                    color: submitMessage.type === 'error' ? 'var(--color-danger)' : (submitMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-text)'),
                    background: submitMessage.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : (submitMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'var(--color-surface)')
                  }}>
                    {submitMessage.text}
                  </div>
                )}'''

# We already replaced the submit button above. But let's replace the whole wizard-nav block for step 3.
# Let's undo the submit button replacement and do the whole block.
# Actually I'll just write it back first then use python replace for the block.

with codecs.open('src/App.jsx', 'w', 'utf-8') as f:
    f.write(content)
