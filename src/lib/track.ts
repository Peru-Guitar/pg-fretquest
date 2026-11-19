type Params = Record<string, string | number | boolean>;
type Tagger = (...args: unknown[]) => void;

/**
 * Sends one event to Google Analytics (to count it) and to Microsoft Clarity (to filter recordings by it).
 * Both scripts only load in production, so locally this does nothing.
 */
export const track = (name: string, params: Params = {}) => {
  if (typeof window === "undefined") return;
  const { gtag, clarity } = window as unknown as { gtag?: Tagger; clarity?: Tagger };
  gtag?.("event", name, params);
  clarity?.("event", name);
};
