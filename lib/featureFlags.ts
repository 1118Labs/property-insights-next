const rawFlags =
  process.env.NEXT_PUBLIC_FEATURE_FLAGS?.split(",").map((f) => f.trim()) ??
  null;

const devDefaults = ["beta_quote_v2", "show_wizard", "auth_enabled"];

function getDefaultEnabled() {
  return process.env.NODE_ENV === "production" ? [] : devDefaults;
}

export function isFeatureEnabled(flag: string): boolean {
  if (!rawFlags || rawFlags.length === 0) {
    return getDefaultEnabled().includes(flag);
  }
  return rawFlags.some((f) => f.toLowerCase() === flag.toLowerCase());
}

export function isAuthEnabled() {
  return isFeatureEnabled("auth_enabled");
}

export function isWizardEnabled() {
  return isFeatureEnabled("show_wizard");
}

export function isQuoteV2Enabled() {
  return isFeatureEnabled("beta_quote_v2");
}

export function isDemoModeEnabled() {
  return isFeatureEnabled("demo_mode");
}

export function isMarketingSiteEnabled() {
  return isFeatureEnabled("marketing_site");
}

export function isOnboardingHintsEnabled() {
  return isFeatureEnabled("onboarding_hints");
}
