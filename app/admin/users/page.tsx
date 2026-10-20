// app/admin/users/page.tsx
import { redirect } from "next/navigation";

export default function AdminUsersRedirectPage() {
  redirect("/super-admin/users");
}
