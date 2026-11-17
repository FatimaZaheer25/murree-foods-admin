// Dark mode: Root layout (server) aur ThemeToggle (client) dono yahan se lete hain.
// Is file mein "use client" nahi, is liye server ko asli text milta hai
export const THEME_STORAGE_KEY = "murreefoods-theme";

// <head> mein chalti hai, page dikhne se PEHLE: pehle browser ki yaad, warna system ki setting
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var r=document.documentElement;r.classList.toggle("dark",t==="dark");r.style.colorScheme=t}catch(e){}})()`;
