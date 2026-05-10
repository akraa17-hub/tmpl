import { useState } from 'react';
import { motion } from 'framer-motion';
import type { SchemeInfo, Plot, FeeRates } from '../types';

interface Props {
  onCalculate: (scheme: SchemeInfo, plots: Plot[], fees: FeeRates) => void;
}

let nextId = 1;
function createPlot(): Plot {
  return { id: String(nextId++), plotNumber: '', area: 0, pricePerMeter: 0 };
}

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function CalculatorForm({ onCalculate }: Props) {
  const [scheme, setScheme] = useState<SchemeInfo>({ name: '', number: '' });
  const [plots, setPlots] = useState<Plot[]>([createPlot()]);
  const [fees, setFees] = useState<FeeRates>({
    transactionTaxRate: 5,
    brokerageRate: 2.5,
    vatRate: 15,
    documentationFees: 2000,
    otherFees: 0,
  });

  const handleScheme = (field: keyof SchemeInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setScheme((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePlot = (id: string, field: keyof Omit<Plot, 'id'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'plotNumber' ? e.target.value : parseFloat(e.target.value) || 0;
    setPlots((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleFee = (field: keyof FeeRates) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFees((prev) => ({ ...prev, [field]: value }));
  };

  const addPlot = () => setPlots((prev) => [...prev, createPlot()]);
  const removePlot = (id: string) => setPlots((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(scheme, plots, fees);
  };

  return (
    <motion.form variants={fadeUp} initial="hidden" animate="visible" onSubmit={handleSubmit} className="space-y-8">
      {/* ─── Section: Scheme ─── */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-bold text-arsh-blue mb-4">
          <span className="w-1 h-4 rounded-full bg-arsh-gold" />
          معلومات المخطط
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="scheme-name" className="block text-xs font-semibold text-arsh-blue/70">اسم المخطط</label>
            <input
              id="scheme-name"
              type="text"
              value={scheme.name}
              onChange={handleScheme('name')}
              placeholder="أدخل اسم المخطط"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-arsh-charcoal placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:border-arsh-blue focus:ring-2 focus:ring-arsh-blue/10"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="scheme-number" className="block text-xs font-semibold text-arsh-blue/70">رقم المخطط</label>
            <input
              id="scheme-number"
              type="text"
              value={scheme.number}
              onChange={handleScheme('number')}
              placeholder="أدخل رقم المخطط"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-arsh-charcoal placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:border-arsh-blue focus:ring-2 focus:ring-arsh-blue/10"
            />
          </div>
        </div>
      </section>

      {/* ─── Section: Plots ─── */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-bold text-arsh-blue mb-4">
          <span className="w-1 h-4 rounded-full bg-arsh-gold" />
          القطع
        </h3>
        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-3 px-1">
            <span className="text-[11px] font-semibold text-arsh-blue/50">رقم القطعة</span>
            <span className="text-[11px] font-semibold text-arsh-blue/50">المساحة (م²)</span>
            <span className="text-[11px] font-semibold text-arsh-blue/50">سعر المتر (﷼)</span>
            <span></span>
          </div>
          {plots.map((plot) => (
            <div key={plot.id} className="grid grid-cols-[1fr_1fr_1fr_40px] gap-3 items-center">
              <input
                type="text"
                value={plot.plotNumber}
                onChange={handlePlot(plot.id, 'plotNumber')}
                placeholder="مثال: ١"
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-arsh-charcoal placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:border-arsh-blue focus:ring-2 focus:ring-arsh-blue/10"
              />
              <input
                type="number"
                value={plot.area || ''}
                onChange={handlePlot(plot.id, 'area')}
                min={0}
                placeholder="0"
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-arsh-charcoal placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:border-arsh-blue focus:ring-2 focus:ring-arsh-blue/10"
              />
              <input
                type="number"
                value={plot.pricePerMeter || ''}
                onChange={handlePlot(plot.id, 'pricePerMeter')}
                min={0}
                placeholder="0"
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-arsh-charcoal placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:border-arsh-blue focus:ring-2 focus:ring-arsh-blue/10"
              />
              <button
                type="button"
                onClick={() => removePlot(plot.id)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-200 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addPlot}
          className="mt-4 px-5 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-arsh-blue text-sm font-semibold hover:border-arsh-blue hover:bg-arsh-blue/5 transition-all duration-200"
        >
          + إضافة قطعة
        </button>
      </section>

      {/* ─── Section: Fees ─── */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-bold text-arsh-blue mb-4">
          <span className="w-1 h-4 rounded-full bg-arsh-gold" />
          الرسوم والنسب
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { id: 'tax-rate', label: 'ضريبة التصرفات (%)', key: 'transactionTaxRate', step: 0.1, max: 100 },
            { id: 'brokerage-rate', label: 'عمولة السعي (%)', key: 'brokerageRate', step: 0.1, max: 100 },
            { id: 'vat-rate', label: 'ضريبة القيمة المضافة (%)', key: 'vatRate', step: 0.1, max: 100 },
            { id: 'doc-fees', label: 'رسوم التوثيق (﷼)', key: 'documentationFees', step: 100 },
            { id: 'other-fees', label: 'رسوم أخرى (﷼)', key: 'otherFees', step: 100 },
          ].map((field) => (
            <div key={field.id} className="space-y-1.5">
              <label htmlFor={field.id} className="block text-xs font-semibold text-arsh-blue/70">{field.label}</label>
              <input
                id={field.id}
                type="number"
                value={fees[field.key as keyof FeeRates]}
                onChange={handleFee(field.key as keyof FeeRates)}
                min={0}
                max={field.max}
                step={field.step}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-arsh-charcoal transition-all duration-200 focus:outline-none focus:border-arsh-blue focus:ring-2 focus:ring-arsh-blue/10"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── Submit ─── */}
      <button
        type="submit"
        className="w-full py-4 rounded-xl bg-gradient-to-r from-arsh-copper to-[#a04d2e] text-white text-base font-bold shadow-lg shadow-arsh-copper/20 hover:shadow-xl hover:shadow-arsh-copper/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
      >
        احسب التكاليف
      </button>
    </motion.form>
  );
}