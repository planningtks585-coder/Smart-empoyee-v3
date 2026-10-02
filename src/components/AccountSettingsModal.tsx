import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  KeyRound,
  Shield,
  Lock,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Users,
  Building,
  CreditCard,
  Pencil
} from 'lucide-react';
import { Language, UserRoleMode } from '../types';
import { translations } from '../i18n/translations';
import { updateProfileAPI, updatePasswordAPI, fetchAccountsAPI, updateAccountPasswordAPI } from '../api/client';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUpdateUser: (updatedUser: any) => void;
  lang?: Language;
  roleMode?: UserRoleMode;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  lang = 'en',
  roleMode = 'employee'
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'accounts'>('profile');

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || 'Cian');
  const [phone, setPhone] = useState(currentUser?.phone || '+855 12 888 999');
  const [email, setEmail] = useState(currentUser?.email || 'cian@marketinglandmark.com');
  const [department, setDepartment] = useState(currentUser?.employee?.department || 'Marketing');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Admin Team Accounts State
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountForPassword, setSelectedAccountForPassword] = useState<any | null>(null);
  const [adminNewPassword, setAdminNewPassword] = useState('');

  // UI status feedback
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state with currentUser when modal opens
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setDepartment(currentUser.employee?.department || 'Marketing');
    }
  }, [currentUser]);

  // Load accounts for admin tab
  useEffect(() => {
    if (activeTab === 'accounts' && roleMode === 'admin') {
      fetchAccountsAPI()
        .then(data => setAccounts(data.accounts || []))
        .catch(err => console.error(err));
    }
  }, [activeTab, roleMode]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await updateProfileAPI({
        userId: currentUser?.id,
        phone,
        name,
        email,
        department,
        role: currentUser?.role
      });

      const updated = {
        ...currentUser,
        name: res.user.name,
        phone: res.user.phone,
        email: res.user.email,
        employee: {
          ...currentUser.employee,
          name: res.user.name,
          phone: res.user.phone,
          email: res.user.email,
          department
        }
      };

      localStorage.setItem('auth_user', JSON.stringify(updated));
      onUpdateUser(updated);
      setSuccessMessage(t.profileUpdatedSuccess);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 4) {
      setErrorMessage(lang === 'km' ? 'ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៤ តួអក្សរ' : 'New password must be at least 4 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      await updatePasswordAPI({
        userId: currentUser?.id,
        phone: currentUser?.phone,
        currentPassword,
        newPassword
      });

      setSuccessMessage(t.passwordUpdatedSuccess);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountForPassword) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (adminNewPassword.length < 4) {
      setErrorMessage(lang === 'km' ? 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៤ តួអក្សរ' : 'Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    try {
      await updateAccountPasswordAPI(selectedAccountForPassword.id, adminNewPassword);
      setSuccessMessage(lang === 'km' ? `ពាក្យសម្ងាត់សម្រាប់ ${selectedAccountForPassword.name} ត្រូវបានផ្លាស់ប្តូរជោគជ័យ!` : `Password for ${selectedAccountForPassword.name} updated successfully!`);
      setSelectedAccountForPassword(null);
      setAdminNewPassword('');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update user password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.manageAccount}
              </h3>
              <p className="text-xs text-slate-400">
                {currentUser?.name} · {currentUser?.role === 'admin' ? 'Admin' : 'Staff'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="px-5 pt-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('profile');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t.profileTab}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('password');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{t.securityTab}</span>
          </button>

          {roleMode === 'admin' && (
            <button
              onClick={() => {
                setActiveTab('accounts');
                setErrorMessage(null);
              }}
              className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
                activeTab === 'accounts'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t.teamAccountsTab}</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Status Feedback Banners */}
          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: Profile Information */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Avatar Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                  {name.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {name || 'User'}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentUser?.role === 'admin'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                    }`}>
                      {currentUser?.role === 'admin' ? 'Admin' : 'Staff'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {currentUser?.employee?.employeeCode || 'EMP-1780778608260'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.fullName}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.phoneNumber}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.emailAddress}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.department}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all"
                >
                  {loading ? (lang === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving...') : t.saveProfileBtn}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Password & Security */}
          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.currentPassword}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.newPassword}
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    placeholder="Minimum 4 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.confirmPassword}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-slate-500 dark:text-slate-400">
                💡 {lang === 'km' ? 'ពាក្យសម្ងាត់ថ្មីនឹងត្រូវប្រើសម្រាប់ការចូលគណនីលើកក្រោយ' : 'Your new password will be required immediately for future logins.'}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all"
                >
                  {loading ? (lang === 'km' ? 'កំពុងផ្លាស់ប្តូរ...' : 'Updating...') : t.updatePasswordBtn}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Team Accounts (Admin Only) */}
          {activeTab === 'accounts' && roleMode === 'admin' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {lang === 'km' ? 'គ្រប់គ្រងពាក្យសម្ងាត់ និងតួនាទីគណនីបុគ្គលិកទាំងអស់' : 'Manage passwords and credentials for registered staff members'}
              </div>

              <div className="space-y-2">
                {accounts.map(acc => (
                  <div
                    key={acc.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {acc.name}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          acc.role === 'admin'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                        }`}>
                          {acc.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {acc.phone} · {acc.email}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedAccountForPassword(acc)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-colors shrink-0"
                    >
                      {lang === 'km' ? 'ប្តូរពាក្យសម្ងាត់' : 'Change Password'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Admin Change Password for Account Modal Sub-form */}
              {selectedAccountForPassword && (
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                      {lang === 'km' ? `កំណត់ពាក្យសម្ងាត់ថ្មីសម្រាប់ ${selectedAccountForPassword.name}` : `Set new password for ${selectedAccountForPassword.name}`}
                    </span>
                    <button
                      onClick={() => setSelectedAccountForPassword(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAdminResetPassword} className="flex gap-2">
                    <input
                      type="password"
                      required
                      placeholder="New password (min 4 chars)"
                      value={adminNewPassword}
                      onChange={e => setAdminNewPassword(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-xs"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700"
                    >
                      {lang === 'km' ? 'រក្សាទុក' : 'Save'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
