// Form validation ke qaide, ek jagah. Checkout, Login aur Rider forms yahin se lete hain
export const MIN_PASSWORD_LENGTH = 8; // backend ke barabar

// you@email.com
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

// 0300-1234567 ya 03001234567 (spaces chhor kar)
export const isPhone = (value: string) => /^03\d{2}-?\d{7}$/.test(value.replace(/\s/g, ""));

// 12345-1234567-1
export const isCnic = (value: string) => /^\d{5}-\d{7}-\d$/.test(value.trim());
