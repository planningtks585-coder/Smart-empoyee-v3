import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Plus,
  Phone,
  User,
  Calendar,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  X,
  Search,
  Filter
} from 'lucide-react';
import { Deal, Language } from '../types';
import { translations } from '../i18n/translations';

interface SalesScreenProps {
  deals: Deal[];
  lang: Language;
  onCreateDeal: (deal: Partial<Deal>) => Promise<void>;
  onUpdateStage: (dealId: string, stage: Deal['stage']) => Promise<void>;
}

export const SalesScreen: React.FC<SalesScreenProps> = ({
  deals,
  lang,
  onCreateDeal,
  onUpdateStage
}) => {
  const t = translations[lang];
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+855 ');
  const [value, setValue] = useState('10000');
  const [stage, setStage] = useState<Deal['stage']>('lead');
  const [assignedRep, setAssignedRep] = useState('Cian');
  const [expectedCloseDate, setExpectedCloseDate] = useState('2026-11-15');
  const [notes, setNotes] = useState('');

  // Calculations
  const totalWon = deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.value, 0);
  const pipelineValue = deals.filter(d => d.stage !== 'lost').reduce((sum, d) => sum + d.value, 0);
  const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;
  const wonCount = deals.filter(d => d.stage === 'won').length;
  const winRate = deals.length > 0 ? Math.round((wonCount / deals.length) * 100) : 0;

  const stages: Array<{ id: Deal['stage']; label: string; color: string }> = [
    { id: 'lead', label: t.stageLead, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    { id: 'contacted', label: t.stageContacted, color: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
    { id: 'proposal', label: t.stageProposal, color: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
    { id: 'negotiation', label: t.stageNegotiation, color: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
    { id: 'won', label: t.stageWon, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
    { id: 'lost', label: t.stageLost, color: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
  ];

  const filteredDeals = deals.filter(d =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !client) return;
    await onCreateDeal({
      title,
      client,
      contactPerson,
      phone,
      value: Number(value),
      stage,
      assignedRep,
      expectedCloseDate,
      notes
    });
    setTitle('');
    setClient('');
    setShowNewModal(false);
  };

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-6 py-4 pb-24 max-w-7xl mx-auto w-full">
      {/* Header and New Deal Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.salesPipeline}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.salesSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              {t.kanbanView}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              {t.listView}
            </button>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newDeal}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Closed Won Revenue */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{t.totalWon}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            ${totalWon.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{wonCount} {t.dealsClosed}</span>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{t.pipelineValue}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            ${pipelineValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {t.totalOpportunity}
          </div>
        </div>

        {/* Active Deals */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{t.activeDeals}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {activeDeals}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {t.inProgressStages}
          </div>
        </div>

        {/* Win Rate */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{t.winRate}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {winRate}%
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            {t.highConversion}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={t.searchDeals}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto pb-4">
          {stages.map((stg) => {
            const stageDeals = filteredDeals.filter(d => d.stage === stg.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div
                key={stg.id}
                className="bg-slate-100/70 dark:bg-slate-800/40 rounded-3xl p-3 border border-slate-200/60 dark:border-slate-800 min-w-[220px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{stg.label}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">${stageTotal.toLocaleString()}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2.5">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-6 text-[11px] text-slate-400 italic">{t.noDeals}</div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:border-blue-300 transition-colors"
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {deal.title}
                        </div>
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                          {deal.client}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                          <span className="text-xs font-extrabold font-mono text-slate-900 dark:text-white">
                            ${deal.value.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">{deal.assignedRep}</span>
                        </div>

                        {/* Quick Progression Actions */}
                        <div className="mt-2.5 flex items-center justify-between text-[10px] pt-1">
                          {deal.stage !== 'won' && deal.stage !== 'lost' && (
                            <button
                              onClick={() => {
                                const currentIndex = stages.findIndex(s => s.id === deal.stage);
                                if (currentIndex < stages.length - 2) {
                                  onUpdateStage(deal.id, stages[currentIndex + 1].id);
                                }
                              }}
                              className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5"
                            >
                              <span>{t.nextStage}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          {deal.stage !== 'won' && (
                            <button
                              onClick={() => onUpdateStage(deal.id, 'won')}
                              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                            >
                              {t.markWon}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                <tr>
                  <th className="px-4 py-3">{lang === 'km' ? 'កិច្ចសន្យា & អតិថិជន' : 'Deal & Client'}</th>
                  <th className="px-4 py-3">{lang === 'km' ? 'តម្លៃ' : 'Value'}</th>
                  <th className="px-4 py-3">{lang === 'km' ? 'ដំណាក់កាល' : 'Stage'}</th>
                  <th className="px-4 py-3">{lang === 'km' ? 'អ្នកទំនាក់ទំនង' : 'Contact'}</th>
                  <th className="px-4 py-3">{lang === 'km' ? 'អ្នកទទួលបន្ទុក' : 'Rep'}</th>
                  <th className="px-4 py-3 text-right">{lang === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{deal.title}</div>
                      <div className="text-[11px] text-blue-600 dark:text-blue-400">{deal.client}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      ${deal.value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        deal.stage === 'won' ? 'bg-emerald-50 text-emerald-600' :
                        deal.stage === 'lost' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <div>{deal.contactPerson}</div>
                      <div className="font-mono text-[10px]">{deal.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {deal.assignedRep}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {deal.stage !== 'won' && (
                        <button
                          onClick={() => onUpdateStage(deal.id, 'won')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                        >
                          {t.markWon}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Deal Creation Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.newDeal}</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t.dealTitle}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SEO & Content Marketing Retainer"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t.clientAccount}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Angkor Tech Solutions"
                  value={client}
                  onChange={e => setClient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {t.contactPerson}
                  </label>
                  <input
                    type="text"
                    placeholder="Sokha Rith"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {t.phoneContact}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {t.dealValue}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {t.pipelineStage}
                  </label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="lead">{t.stageLead}</option>
                    <option value="contacted">{t.stageContacted}</option>
                    <option value="proposal">{t.stageProposal}</option>
                    <option value="negotiation">{t.stageNegotiation}</option>
                    <option value="won">{t.stageWon}</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
                >
                  {t.saveDeal}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
