import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProfileHistoryTableProps {
  history: any[];
  isLoading: boolean;
  onViewTx: (tx: any) => void;
}

const ProfileHistoryTable: React.FC<ProfileHistoryTableProps> = ({ 
  history, 
  isLoading, 
  onViewTx 
}) => {
  const { t } = useLanguage();
  return (
    <div className="paper-texture scroll-border border-double border-4 border-amber-600/30 rounded-2xl shadow-md overflow-hidden transition-all hover:border-amber-600/50">
      <div className="px-6 py-4 border-b border-amber-600/20 bg-amber-50/50">
          <h3 className="font-bold text-amber-950 font-serif italic">{t.profile_history_title}</h3>
      </div>
      
      <div className="overflow-x-auto">
          <table className="w-full text-sm">
              <thead className="bg-amber-50/20 text-stone-500 border-b border-stone-200">
                  <tr>
                      <th className="px-4 md:px-6 py-3 text-left font-medium uppercase tracking-wider">{t.profile_history_col_date}</th>
                      <th className="px-4 md:px-6 py-3 text-left font-medium uppercase tracking-wider">{t.profile_history_col_type}</th>
                      <th className="px-4 md:px-6 py-3 text-right font-medium uppercase tracking-wider">{t.profile_history_col_amount}</th>
                      <th className="hidden md:table-cell px-6 py-3 text-left font-medium uppercase tracking-wider">{t.profile_history_col_desc}</th>
                      <th className="px-4 md:px-6 py-3 text-center font-medium uppercase tracking-wider">{t.profile_history_col_actions}</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                  {isLoading ? (
                      <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-stone-400 italic">{t.profile_history_loading}</td>
                      </tr>
                  ) : history.length === 0 ? (
                      <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-stone-400 italic">{t.profile_history_empty}</td>
                      </tr>
                  ) : (
                      history.map((h, i) => (
                          <tr 
                              key={i} 
                              onClick={() => onViewTx(h)}
                              className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                          >
                              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-stone-500">
                                  {new Date(h.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-4 md:px-6 py-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      h.type === 'in' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                      {h.type === 'in' ? t.profile_history_type_in : t.profile_history_type_out}
                                  </span>
                              </td>
                              <td className={`px-4 md:px-6 py-4 text-right font-bold ${
                                  h.type === 'in' ? 'text-green-600' : 'text-amber-600'
                              }`}>
                                  {h.type === 'in' ? '+' : '-'}{h.amount}
                              </td>
                              <td className="hidden md:table-cell px-6 py-4 text-stone-600 max-w-[150px] truncate">
                                  {h.description}
                              </td>
                              <td className="px-4 md:px-6 py-4 text-center">
                                  <button className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded hover:bg-amber-600 hover:text-white transition-all">
                                      {t.profile_history_action_view}
                                  </button>
                              </td>
                          </tr>
                      ))
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
};

export default ProfileHistoryTable;
