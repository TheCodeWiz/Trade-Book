'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'USD' | 'INR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  symbol: string;
  formatAmount: (amount: number | null) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    // Load saved currency preference
    const saved = localStorage.getItem('tradePulse_currency') as Currency;
    if (saved && (saved === 'USD' || saved === 'INR')) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('tradePulse_currency', newCurrency);
  };

  const symbol = currency === 'USD' ? '$' : '₹';

  const formatAmount = (amount: number | null): string => {
    if (amount === null) return '-';
    const formatted = amount.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, symbol, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
