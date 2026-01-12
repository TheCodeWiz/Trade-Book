'use client';

import { useCurrency } from '@/context/CurrencyContext';

interface Trade {
  id: string;
  symbol: string;
  tradeType: string;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  stopLoss: number | null;
  takeProfit: number | null;
  profitLoss: number | null;
  status: string;
  notes: string | null;
  isStarred?: boolean;
  tradeDate: string;
  createdAt: string;
}

interface TradeCardProps {
  trade: Trade;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStar?: () => void;
}

export default function TradeCard({ trade, onEdit, onDelete, onToggleStar }: TradeCardProps) {
  const { formatAmount } = useCurrency();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-6 border ${trade.isStarred ? 'border-yellow-500/30' : 'border-gray-800'} hover:border-gray-700 transition-all duration-300 shadow-xl shadow-black/20 group`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white tracking-tight">{trade.symbol}</h3>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                trade.tradeType === 'BUY'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/15 text-red-400 border border-red-500/30'
              }`}
            >
              {trade.tradeType}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1.5 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(trade.tradeDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              trade.status === 'OPEN'
                ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {trade.status}
          </span>
          {/* Star Button - Now beside status */}
          {onToggleStar && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStar(); }}
              className={`p-1.5 rounded-lg transition-all ${trade.isStarred ? 'text-yellow-400 bg-yellow-500/20' : 'text-gray-600 hover:text-yellow-400 hover:bg-gray-800'}`}
              title={trade.isStarred ? 'Unstar trade' : 'Star as best trade'}
            >
              <svg className="w-5 h-5" fill={trade.isStarred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Entry Price</p>
          <p className="text-white font-semibold text-lg">{formatAmount(trade.entryPrice)}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Exit Price</p>
          <p className="text-white font-semibold text-lg">{formatAmount(trade.exitPrice)}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Quantity</p>
          <p className="text-white font-semibold text-lg">{trade.quantity}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">P&L</p>
          <p
            className={`font-bold text-lg ${
              trade.profitLoss === null
                ? 'text-gray-500'
                : trade.profitLoss >= 0
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}
          >
            {trade.profitLoss !== null
              ? `${trade.profitLoss >= 0 ? '+' : ''}${formatAmount(trade.profitLoss)}`
              : '-'}
          </p>
        </div>
      </div>

      {/* Stop Loss / Take Profit */}
      {(trade.stopLoss || trade.takeProfit) && (
        <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-800">
          {trade.stopLoss && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Stop Loss</p>
                <p className="text-red-400 font-semibold">{formatAmount(trade.stopLoss)}</p>
              </div>
            </div>
          )}
          {trade.takeProfit && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Take Profit</p>
                <p className="text-emerald-400 font-semibold">{formatAmount(trade.takeProfit)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {trade.notes && (
        <div className="mb-4 pt-4 border-t border-gray-800">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1.5">Notes</p>
          <p className="text-gray-400 text-sm leading-relaxed">{trade.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-800">
        <button
          onClick={onEdit}
          className="flex-1 py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 border border-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 border border-red-500/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}
