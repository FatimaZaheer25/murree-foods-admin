import RequireAuth from "../../../shared/components/auth/RequireAuth";
import AdminShell from "./_components/AdminShell";
// Admin panel login check (RequireAuth) ke peeche hai: server par page bante hi nahi, login ka pata
// browser mein chalta hai. Is liye Next ka "instant navigation" check yahan kuch parakh nahi sakta aur
// "dropped from rendering" ka error deta hai. Band (behaviour nahi badalta). Layout ka false sirf layout
// ko chhorta hai: har admin page mein bhi "export const instant = false" zaroori hai (nayee page mein bhi)
export const instant = false;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}