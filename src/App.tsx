import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { SchemeInfo, Plot, FeeRates, CalculationResult } from './types';
import { calculateAll } from './utils/calculations';
import CalculatorForm from './components/CalculatorForm';
import ResultsPanel from './components/ResultsPanel';

export default function App() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleCalculate = (scheme: SchemeInfo, plots: Plot[], fees: FeeRates) => {
    setResult(calculateAll(scheme, plots, fees));
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-arsh-platinum">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-[880px] mx-auto px-4 py-5 md:py-7">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-arsh-blue">حاسبة التكاليف العقارية</h1>
              <p className="text-sm text-arsh-charcoal/45 mt-0.5">أداة احترافية لحساب تكاليف العقارات</p>
            </div>
            {result && (
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-sm font-medium text-arsh-blue/70 hover:bg-arsh-blue/5 transition-colors"
              >
                🔄 حساب جديد
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[880px] mx-auto px-4 py-6 md:py-8">
        <AnimatePresence mode="wait">
          {!result ? (
            <CalculatorForm key="form" onCalculate={handleCalculate} />
          ) : (
            <ResultsPanel key="results" result={result} />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-arsh-charcoal/35">
        جميع الحسابات تقريبية — قد تختلف حسب الجهة المختصة
      </footer>
    </div>
  );
}