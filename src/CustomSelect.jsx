import React, { useState, useRef, useEffect, useCallback } from 'react';
import './CustomSelect.css';

const CustomSelect = ({ name, options, placeholder, required, defaultValue, onChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue || '');
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const selectRef = useRef(null);
  const triggerRef = useRef(null);

  const selectedOption = options.find(o => o.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  /* Close on outside click */
  const handleOutsideClick = useCallback((e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('touchstart', handleOutsideClick);
      };
    }
  }, [open, handleOutsideClick]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        containerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  /* Watch hidden select for error class (applied by script.js validation) */
  useEffect(() => {
    const el = selectRef.current;
    if (!el) return;
    const observer = new MutationObserver(() => {
      setHasError(el.classList.contains('error'));
    });
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    /* Initial check */
    setHasError(el.classList.contains('error'));
    return () => observer.disconnect();
  }, []);

  /* Scroll focused option into view */
  useEffect(() => {
    if (!open || focusedIdx < 0 || !listRef.current) return;
    const el = listRef.current.children[focusedIdx];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [focusedIdx, open]);

  const selectOption = (value) => {
    setSelectedValue(value);
    setOpen(false);
    setFocusedIdx(-1);
    if (selectRef.current) {
      selectRef.current.value = value;
      /* Dispatch change event so form listeners (script.js) pick it up */
      selectRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (onChange) onChange(value);
  };

  const handleTriggerKey = (e) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        setOpen(true);
        setFocusedIdx(options.findIndex(o => o.value === selectedValue));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setOpen(true);
        setFocusedIdx(options.findIndex(o => o.value === selectedValue));
        break;
      default:
        break;
    }
  };

  const handleListKey = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIdx(prev => Math.min(prev + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIdx(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIdx >= 0) selectOption(options[focusedIdx].value);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        containerRef.current?.focus();
        break;
      default:
        break;
    }
  };

  return (
    <div className="custom-select" ref={containerRef}>
      {/* Hidden native select for form submission */}
      <select
        ref={selectRef}
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue || ''}
        style={{ display: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        className={`custom-select-trigger${open ? ' is-open' : ''}${!selectedValue ? ' is-placeholder' : ''}${hasError ? ' error' : ''}`}
        onClick={() => setOpen(!open)}
        onKeyDown={handleTriggerKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${name}-label`}
      >
        <span>{displayText}</span>
        <svg
          className={`custom-select-chevron${open ? ' is-open' : ''}`}
          width="12" height="8" viewBox="0 0 12 8"
          aria-hidden="true"
        >
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="custom-select-dropdown" role="listbox" ref={listRef}>
          {options.map((opt, i) => (
            <div
              key={opt.value}
              role="option"
              aria-selected={opt.value === selectedValue}
              className={`custom-select-option${opt.value === selectedValue ? ' is-selected' : ''}${i === focusedIdx ? ' is-focused' : ''}`}
              onClick={() => selectOption(opt.value)}
              onMouseEnter={() => setFocusedIdx(i)}
            >
              <span>{opt.label}</span>
              {opt.value === selectedValue && (
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="custom-select-check">
                  <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" fill="none"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
