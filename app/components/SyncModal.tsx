'use client';

interface SyncModalProps {
  sheetUrl: string;
  onChange: (url: string) => void;
  onClose: () => void;
}

/** Where the Apps Script endpoint is entered. Everything else depends on it. */
export default function SyncModal({ sheetUrl, onChange, onClose }: SyncModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="ক্লাউড সিঙ্ক সেটিংস"
    >
      <div className="overlay absolute inset-0" onClick={onClose} />
      <div className="surface-panel max-w-md w-full p-6 relative z-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="t-title text-lg">Cloud Sync Settings</h3>
          <button onClick={onClose} className="control control--quiet p-2" aria-label="বন্ধ করুন">
            ✕
          </button>
        </div>
        <p className="t-caption measure mb-4">
          আপনার গুগল শিটের Apps Script Web App URL টি এখানে ইনপুট দিন। এর ফলে আপনার প্রগ্রেস এবং
          নোটসমূহ সরাসরি গুগল শিটে রিয়েলটাইমে অটো-সেভ হবে এবং অ্যাপ ওপেন করার সময় সেখান থেকে লোড হবে।
        </p>
        <div className="flex flex-col gap-2 mb-4">
          <label htmlFor="sheet-url-input" className="t-label">
            Google Apps Script URL
          </label>
          <input
            id="sheet-url-input"
            type="text"
            value={sheetUrl}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="surface-well t-mono w-full text-xs p-3"
          />
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="control control--primary py-2.5 px-6 text-xs">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
