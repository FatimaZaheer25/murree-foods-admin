import { Fraunces, Manrope } from "next/font/google";

// Teeno apps ke fonts (theme.css inhi variables se font-sans aur font-display banata hai).
// Har app ki root layout <html> par fontVariables lagati hai
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const fontVariables = `${fraunces.variable} ${manrope.variable}`;
