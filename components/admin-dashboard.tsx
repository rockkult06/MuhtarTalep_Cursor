import { useState } from "react"
import { UserManagement } from "@/components/user-management"
import { PageManagement } from "@/components/page-management"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("user-management")

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Paneli</h2>
      <div className="flex mb-4">
        <button
          onClick={() => setActiveTab("user-management")}
          className={`p-2 mr-2 ${activeTab === "user-management" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Kullanıcı Yönetimi
        </button>
        <button
          onClick={() => setActiveTab("page-management")}
          className={`p-2 ${activeTab === "page-management" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Sayfa Yönetimi
        </button>
      </div>
      {activeTab === "user-management" && <UserManagement />}
      {activeTab === "page-management" && <PageManagement />}
    </div>
  )
} 