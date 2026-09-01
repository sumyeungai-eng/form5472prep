"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent
} from "react";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  contactDictionary,
  contactSubjectOptions,
  feedbackCategoryOptions,
  type ContactDictionaryKey,
  type ContactErrorCode,
  type ContactKind
} from "@/lib/contact/contactDictionary";

const MESSAGE_MAX_LENGTH = 5000;

type ContactFormProps = {
  kind: ContactKind;
  className?: string;
};

type ContactHandlerResponse =
  | { ok: true }
  | { ok: false; error: ContactErrorCode };

type SubmissionStatus = {
  tone: "success" | "error";
  message: string;
};

const errorMessageKeys: Record<ContactErrorCode, ContactDictionaryKey> = {
  method: "errorMethod",
  invalid: "errorInvalid",
  spam: "errorSpam",
  rate_limited: "errorRateLimited",
  send_failed: "errorSendFailed"
};

const errorCodes: ReadonlySet<string> = new Set([
  "method",
  "invalid",
  "spam",
  "rate_limited",
  "send_failed"
]);

function isContactHandlerResponse(value: unknown): value is ContactHandlerResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as { ok?: unknown; error?: unknown };

  if (response.ok === true) {
    return true;
  }

  return response.ok === false && typeof response.error === "string" && errorCodes.has(response.error);
}

export function ContactForm({ className = "", kind }: ContactFormProps) {
  const { lang } = useI18n();
  const formRef = useRef<HTMLFormElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const nameId = useId();
  const emailId = useId();
  const subjectId = useId();
  const messageId = useId();
  const honeypotId = useId();
  const counterId = `${messageId}-counter`;
  const statusId = `${messageId}-status`;

  const options = useMemo(
    () => (kind === "feedback" ? feedbackCategoryOptions : contactSubjectOptions),
    [kind]
  );

  const firstSubject = options[0]?.value ?? "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<string>(firstSubject);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [renderedAt, setRenderedAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmissionStatus | null>(null);

  useEffect(() => {
    setRenderedAt(String(Date.now()));
  }, []);

  useEffect(() => {
    setSubject(firstSubject);
  }, [firstSubject]);

  const copy = (key: ContactDictionaryKey) => contactDictionary[key][lang];

  const focusStatus = () => {
    window.setTimeout(() => {
      statusRef.current?.focus();
    }, 0);
  };

  const setCompletedStatus = (nextStatus: SubmissionStatus) => {
    setStatus(nextStatus);
    focusStatus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = formRef.current;

    if (!form) {
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/contact-handler.php", {
        method: "POST",
        body: new FormData(form)
      });

      let payload: unknown = null;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (isContactHandlerResponse(payload)) {
        if (payload.ok) {
          setName("");
          setEmail("");
          setSubject(firstSubject);
          setMessage("");
          setWebsite("");
          setRenderedAt(String(Date.now()));
          setCompletedStatus({ tone: "success", message: copy("successMessage") });
          return;
        }

        setCompletedStatus({
          tone: "error",
          message: copy(errorMessageKeys[payload.error])
        });
        return;
      }

      setCompletedStatus({ tone: "error", message: copy("errorGeneric") });
    } catch {
      setCompletedStatus({ tone: "error", message: copy("errorGeneric") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} className={`space-y-5 ${className}`} onSubmit={handleSubmit}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="rendered_at" value={renderedAt} />

      <div>
        <label htmlFor={nameId} className="block text-sm font-semibold text-navy-900">
          {copy("nameLabel")}
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          value={name}
          maxLength={200}
          autoComplete="name"
          className="form-input mt-2 w-full"
          placeholder={copy("namePlaceholder")}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor={emailId} className="block text-sm font-semibold text-navy-900">
          {copy("emailLabel")}
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          value={email}
          autoComplete="email"
          className="form-input mt-2 w-full"
          placeholder={copy("emailPlaceholder")}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor={subjectId} className="block text-sm font-semibold text-navy-900">
          {copy(kind === "feedback" ? "feedbackSubjectLabel" : "contactSubjectLabel")}
        </label>
        <select
          id={subjectId}
          name="subject"
          value={subject}
          className="form-select mt-2 w-full"
          onChange={(event) => setSubject(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {copy(option.labelKey)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={messageId} className="block text-sm font-semibold text-navy-900">
          {copy("messageLabel")}
        </label>
        <textarea
          id={messageId}
          name="message"
          value={message}
          required
          maxLength={MESSAGE_MAX_LENGTH}
          rows={7}
          aria-describedby={counterId}
          className="form-input mt-2 w-full resize-y"
          placeholder={copy("messagePlaceholder")}
          onChange={(event) => setMessage(event.target.value)}
        />
        <p id={counterId} className="mt-2 text-xs font-medium text-warm-600">
          {copy("characterCounterLabel")}: {message.length} / {MESSAGE_MAX_LENGTH}
        </p>
      </div>

      <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={honeypotId}>{copy("honeypotLabel")}</label>
        <input
          id={honeypotId}
          name="website"
          type="text"
          value={website}
          tabIndex={-1}
          autoComplete="off"
          className="form-input"
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {status ? (
        <div
          id={statusId}
          ref={statusRef}
          tabIndex={-1}
          role={status.tone === "error" ? "alert" : "status"}
          aria-live={status.tone === "error" ? "assertive" : "polite"}
          className={`rounded-md border px-4 py-3 text-sm font-semibold outline-none ${
            status.tone === "success"
              ? "border-teal-400 bg-teal-50 text-teal-700"
              : "border-gold-200 bg-gold-100 text-navy-900"
          }`}
        >
          {status.message}
        </div>
      ) : null}

      <button type="submit" className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? copy("sendingLabel") : copy("submitLabel")}
      </button>
    </form>
  );
}
