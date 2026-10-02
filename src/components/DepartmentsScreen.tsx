import React from 'react';
import { Building, Users, DollarSign, Award, ShieldCheck } from 'lucide-react';
import { DepartmentItem, Language } from '../types';
import { translations } from '../i18n/translations';

interface DepartmentsScreenProps {
  departments: DepartmentItem[];
  lang?: Language;
}

export const DepartmentsScreen: React.FC<DepartmentsScreenProps> = ({
  departments,
  lang = 'en'
}) => {
  const t = translations[lang];

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-5 pb-24 max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.departmentsTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.departmentsSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map(dept => (
          <div
            key={dept.name}
            className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t.departmentLead}: {dept.lead}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full shrink-0">
                  {dept.count} {t.membersCount}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t.annualBudgetAlloc}</span>
              <span className="font-extrabold text-slate-900 dark:text-white font-mono text-sm">
                ${dept.budget.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
