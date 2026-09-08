import styles from "./Field.module.css";

// ── Field ────────────────────────────────────────────────────────────────────
export default function Field({
  label, name, value, onChange,
  placeholder, type = "text",
  textarea, select, options,
  half, quarter,
}) {
  const colClass = quarter ? styles.quarter : half ? styles.half : styles.full;

  return (
    <div className={`${styles.wrap} ${colClass}`}>
      <label className={styles.label}>{label}</label>

      {textarea ? (
        <textarea
          name={name} value={value} onChange={onChange}
          placeholder={placeholder} className={styles.textarea}
        />
      ) : select ? (
        <select name={name} value={value} onChange={onChange} className={styles.select}>
          <option value="">Select</option>
          {options.map((opt) => <option key={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type} name={name} value={value}
          onChange={onChange} placeholder={placeholder}
          className={styles.input}
        />
      )}
    </div>
  );
}

// ── RadioField ───────────────────────────────────────────────────────────────
export function RadioField({ label, name, value, options, onChange }) {
  return (
    <div className={`${styles.radioWrap}`}>
      <label className={styles.label}>{label}</label>
      <div className={styles.radioGroup}>
        {options.map((opt) => (
          <label key={opt} className={styles.radioLabel}>
            <input
              type="radio" name={name} value={opt}
              checked={value === opt} onChange={onChange}
              className={styles.radioInput}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}