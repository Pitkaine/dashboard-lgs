import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <AdminSidebar />
      <div className="lg:pl-64">
        <main className="p-4 pt-16 lg:p-8 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
