import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useHeaderComponent } from "../hooks/useHeaderComponent";
import SiteFooter from "../components/SiteFooter";
import ElementSelector from "../components/Tutorial/ElementSelector";
import TutorialAdmin from "../components/Tutorial/TutorialAdmin";
import {
    AdminIntegrations,
    ProfileSettings,
    AdminNotifications,
    AuditLogsSection,
    TrafficLogsSection,
    ApiKeysSection,
    ChangelogSection,
    R2StorageSection,
    SecuritySettings,
    NotificationTrackingSection,
} from "../components/Settings";
import AdminUsers from "../components/Settings/AdminUsers";
import UserModal from "../components/Settings/UserModal";
import AdminSidebar from "../components/Settings/AdminSidebar";
import useSettingsData from "../hooks/useSettingsData";

function SettingsPage() {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [adminActiveTab, setAdminActiveTab] = useState("users");

    const HeaderComponent = useHeaderComponent();
    const settings = useSettingsData();

    const users = useMemo(() => settings?.users || [], [settings?.users]);
    const pendingUsers = useMemo(
        () => settings?.pendingUsers || [],
        [settings?.pendingUsers],
    );
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);

    const [isAdminSidebarExpanded, setIsAdminSidebarExpanded] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState({
        management: true,
        analytics: true,
        integrations: true,
    });

    const [profileImage, setProfileImage] = useState(user?.profileImage || null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            settings.loadUsers();
            settings.loadNotificationHistory();
        }
    }, [isAdmin, settings.loadUsers, settings.loadNotificationHistory]);

    const tabs = [
        { id: "profile", name: "Profil", icon: "👤" },
        { id: "preferences", name: "Tercihler", icon: "⚙️" },
        { id: "notifications", name: "Bildirimler", icon: "🔔" },
        { id: "privacy", name: "Gizlilik", icon: "🔒" },
        ...(isAdmin ? [{ id: "admin", name: "Admin Panel", icon: "👑" }] : []),
    ];

    const adminNavGroups = [
        {
            id: "management",
            name: "Yönetim",
            icon: "🛠️",
            items: [
                { id: "users", name: "Kullanıcı Yönetimi", icon: "👥" },
                { id: "notifications", name: "Bildirim Yönetimi", icon: "📢" },
                { id: "tracking", name: "Bildirim Takip", icon: "📊" },
                { id: "tutorials", name: "Tutorial Yönetimi", icon: "❓" },
                { id: "changelog", name: "Changelog Yönetimi", icon: "📋" },
            ],
        },
        {
            id: "analytics",
            name: "Analitik & Loglar",
            icon: "📈",
            items: [
                { id: "traffic", name: "Trafik Logları", icon: "🚦" },
                { id: "audit-logs", name: "Admin Denetim Günlüğü", icon: "🛡️" },
            ],
        },
        {
            id: "integrations",
            name: "Entegrasyonlar",
            icon: "🔌",
            items: [
                { id: "api-keys", name: "API Anahtar Yönetimi", icon: "🔑" },
                { id: "api", name: "API Merkezi", icon: "🔌" },
                { id: "r2-storage", name: "R2 Depolama Yönetimi", icon: "☁️" },
            ],
        },
    ];

    const handleEditUser = (userToEdit) => {
        const editableUser = {
            id: userToEdit.id,
            username: userToEdit.username || "",
            email: userToEdit.email || "",
            password: "",
            role: userToEdit.role || "user",
            status: userToEdit.status || "offline",
            avatar: userToEdit.profileImage || "",
            profile: {
                firstName: userToEdit.name ? userToEdit.name.split(" ")[0] : "",
                lastName: userToEdit.name ? userToEdit.name.split(" ").slice(1).join(" ") : "",
                bio: userToEdit.bio || "",
                profileImage: userToEdit.profileImage || null,
            },
            createdAt: userToEdit.createdAt ? new Date(userToEdit.createdAt).toISOString().split("T")[0] : "",
            lastLogin: userToEdit.lastActive ? new Date(userToEdit.lastActive).toLocaleDateString("tr-TR") : "Henüz giriş yapmadı",
        };
        setSelectedUser(editableUser);
        setShowUserModal(true);
    };

    const handleAddNewUser = () => {
        const newUserTemplate = {
            id: null,
            username: "",
            email: "",
            password: "",
            role: "user",
            status: "offline",
            avatar: "",
            profile: { firstName: "", lastName: "", bio: "", profileImage: null },
            createdAt: new Date().toISOString().split("T")[0],
            lastLogin: "Henüz giriş yapmadı",
        };
        setSelectedUser(newUserTemplate);
        setShowUserModal(true);
    };

    const handleSaveSelectedUser = async () => {
        if (!selectedUser) return;
        try {
            const res = await settings.saveUser(selectedUser);
            if (res && res.success) {
                settings.loadUsers();
                alert(selectedUser.id ? "Kullanıcı başarıyla güncellendi!" : "Kullanıcı başarıyla oluşturuldu!");
                setShowUserModal(false);
                setSelectedUser(null);
            } else {
                alert(res?.error?.message || "Kullanıcı kaydedilirken hata oluştu");
            }
        } catch (err) {
            alert("Beklenmeyen bir hata oluştu");
        }
    };

    const handleDeleteUser = async (userId) => {
        const userToDelete = users.find((u) => u.id === userId);
        if (userToDelete && userToDelete.role === "admin") {
            alert("Admin hesapları güvenlik nedeniyle silinemez!");
            return;
        }
        if (!window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;
        try {
            const res = await settings.deleteUser(userId);
            if (res && res.success) {
                settings.loadUsers();
                alert("Kullanıcı başarıyla silindi");
            } else {
                alert(res?.error?.message || "Kullanıcı silinirken hata oluştu");
            }
        } catch (err) {
            alert("Kullanıcı silinirken beklenmeyen bir hata oluştu");
        }
    };

    const toggleCategory = (categoryId) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    const handleAvatarUpload = async (formData) => {
        console.log("Avatar upload initiated.", formData);
    };

    const handleDeleteAvatar = async () => {
        console.log("Avatar delete initiated.");
    };

    const renderAdminPanel = () => (
        <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                👑 Admin Panel
            </h3>
            {adminActiveTab === "users" && (
                <AdminUsers
                    users={users}
                    pendingUsers={pendingUsers}
                    onApproveUser={settings.approveUser}
                    onRejectUser={settings.rejectUser}
                    onEditUser={handleEditUser}
                    onAddNewUser={handleAddNewUser}
                    onDeleteUser={handleDeleteUser}
                />
            )}
            {adminActiveTab === "notifications" && <AdminNotifications />}
            {adminActiveTab === "audit-logs" && <AuditLogsSection />}
            {adminActiveTab === "tracking" && <NotificationTrackingSection />}
            {adminActiveTab === "traffic" && <TrafficLogsSection />}
            {adminActiveTab === "api" && <AdminIntegrations />}
            {adminActiveTab === "api-keys" && <ApiKeysSection />}
            {adminActiveTab === "tutorials" && <TutorialAdmin embedded />}
            {adminActiveTab === "changelog" && <ChangelogSection />}
            {adminActiveTab === "r2-storage" && <R2StorageSection />}
        </div>
    );

    if (activeTab === "admin" && isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
                <HeaderComponent />
                <main className="flex-1 p-6">
                    <div className="max-w-[108rem] mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Ayarlar</h1>
                            <p className="text-gray-400">Hesap ayarlarınızı ve tercihlerinizi yönetin</p>
                        </div>
                        <div className="flex gap-6">
                            <AdminSidebar
                                adminNavGroups={adminNavGroups}
                                adminActiveTab={adminActiveTab}
                                setAdminActiveTab={setAdminActiveTab}
                                isAdminSidebarExpanded={isAdminSidebarExpanded}
                                toggleSidebar={() => setIsAdminSidebarExpanded((prev) => !prev)}
                                expandedCategories={expandedCategories}
                                toggleCategory={toggleCategory}
                            />
                            <div className="flex-1">{renderAdminPanel()}</div>
                        </div>
                    </div>
                </main>
                <SiteFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
            <HeaderComponent />
            <main className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Ayarlar</h1>
                        <p className="text-gray-400">Hesap ayarlarınızı ve tercihlerinizi yönetin</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="w-64 bg-gray-800/50 rounded-xl p-4">
                            <nav className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${activeTab === tab.id
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                            }`}
                                    >
                                        <span className="text-lg">{tab.icon}</span>
                                        <span className="font-medium">{tab.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="flex-1">
                            {activeTab === "profile" && (
                                <ProfileSettings
                                    profileImage={profileImage}
                                    isUploading={isUploadingAvatar}
                                    onUpload={handleAvatarUpload}
                                    onDeleteAvatar={handleDeleteAvatar}
                                    initialUser={user}
                                    onSaveProfile={async (payload) =>
                                        settings.saveUser({
                                            id: user?.id,
                                            name: payload.name,
                                            username: payload.username,
                                            email: payload.email,
                                            role: user?.role,
                                        })
                                    }
                                />
                            )}
                            {activeTab === "preferences" && (
                                <div className="bg-gray-800/50 rounded-xl p-6 text-center py-12">
                                    <div className="text-6xl mb-4">⚙️</div>
                                    <h4 className="text-2xl font-bold text-white mb-2">Çok Yakında!</h4>
                                    <p className="text-gray-400">Kişisel tercihlerinizi yönetebileceğiniz panel geliştiriliyor.</p>
                                </div>
                            )}
                            {activeTab === "notifications" && (
                                <div className="bg-gray-800/50 rounded-xl p-6 text-center py-12">
                                    <div className="text-6xl mb-4">🔔</div>
                                    <h4 className="text-2xl font-bold text-white mb-2">Çok Yakında!</h4>
                                    <p className="text-gray-400">Bildirim tercihlerinizi özelleştirebileceğiniz panel hazırlanıyor.</p>
                                </div>
                            )}
                            {activeTab === "privacy" && (
                                <SecuritySettings
                                    userId={user?.id}
                                    onUpdatePassword={async ({ id, password }) =>
                                        settings.saveUser({ id, password })
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>
            {showUserModal && selectedUser && (
                <UserModal
                    user={selectedUser}
                    onChange={setSelectedUser}
                    onSave={handleSaveSelectedUser}
                    onCancel={() => {
                        setShowUserModal(false);
                        setSelectedUser(null);
                    }}
                />
            )}
            <SiteFooter />
            <ElementSelector />
        </div>
    );
}

export default SettingsPage;
