import React, { useState } from 'react';
import { Umbrella, Plus, Check, X, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { LeaveRequest, UserRoleMode, Language } from '../types';
import { translations } from '../i18n/translations';

interface LeaveScreenProps {
  requests: LeaveRequest[];
  roleMode: UserRoleMode;
  onRequestLeave: (data: Partial<LeaveRequest>) => Promise<void>;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  lang?: Language;
}

export const LeaveScreen: React.FC<LeaveScreenProps> = ({
  requests,
  roleMode,
  onRequestLeave,
  onUpdateStatus,
  lang = 'en'
}) => {
  const t = translations[lang];
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<'Annual' | 'Sick' | 'Casual' | 'Emergency'>('Annual');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [days, setDays] = useState('1');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRequestLeave({
      type,
      startDate,
      endDate,
      days: Number(days),
      reason
    });
    setReason('');
    setShowModal(false);
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Check className="w-3 h-3" />
            {t.approvedStatus}
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            <X className="w-3 h-3" />
            {t.rejectedStatus}
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            {t.pendingStatus}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-5 pb-24 max-w-6xl mx-auto w-full">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.leaveRequestsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.leaveRequestsSub}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.applyBtn}</span>
        </button>
      </div>

      {/* Leave Balances Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-3xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-center sm:text-left">
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">14</div>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
            {t.annualLeft}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-center sm:text-left">
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">8</div>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
            {t.sickLeft}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 text-center sm:text-left">
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">3</div>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
            {t.casualLeft}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {requests.map(req => (
            <div
              key={req.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                  <Umbrella className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {req.employeeName}
                    </h3>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                      {req.type}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {req.days} {lang === 'km' ? 'ថ្ងៃ' : 'days'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {req.startDate} → {req.endDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    "{req.reason}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700">
                {getStatusBadge(req.status)}

                {roleMode === 'admin' && req.status === 'pending' && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => onUpdateStatus(req.id, 'approved')}
                      className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1 px-3 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.approveBtn}</span>
                    </button>
                    <button
                      onClick={() => onUpdateStatus(req.id, 'rejected')}
                      className="p-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold flex items-center gap-1 px-3 shadow-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t.rejectBtn}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              {t.noLeaveRequests}
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.applyForLeave}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.leaveType}
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Annual">{t.annualLeave}</option>
                  <option value="Sick">{t.sickLeave}</option>
                  <option value="Casual">{t.casualLeave}</option>
                  <option value="Emergency">{t.emergencyLeave}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t.startDate}
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t.endDate}
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.numberOfDays}
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={days}
                  onChange={e => setDays(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.reasonForTimeOff} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder={t.reasonPlaceholder}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20"
                >
                  {t.submitApplication}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
