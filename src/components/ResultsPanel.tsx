import { useRef, useMemo, useEffect, useState } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { CalculationResult } from '../types';

interface Props {
  result: CalculationResult;
}

const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const container: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.34, 1] } },
};

const itemFade: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.5 } },
};

function AnimatedNumber({ value, isGold = false }: { value: string; isGold?: boolean }) {
  const [displayValue, setDisplayValue] = useState('0.00');
  const numericValue = parseFloat(value.replace(/,/g, ''));

  useEffect(() => {
    let start = 0;
    const end = numericValue;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const current = progress * end;
      setDisplayValue(fmt(current));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <div className={`font-mono dir-ltr ${isGold ? 'text-white' : 'text-arsh-blue'}`}>
      {displayValue}
    </div>
  );
}

export default function ResultsPanel({ result }: Props) {
  const { scheme, plots, columnTotals, grandTotal } = result;
  const reportRef = useRef<HTMLDivElement>(null);

  const totalArea = useMemo(() => plots.reduce((s, p) => s + p.area, 0), [plots]);
  const avgCostPerMeter = grandTotal / totalArea;

  const handleShareImage = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { 
        scale: 2, 
        backgroundColor: '#FFFBF2',
        useCORS: true,
        logging: true,
        onclone: (doc) => {
          // Ensure clones are visible and have consistent styling
          const el = doc.getElementById('report-container');
          if (el) el.style.opacity = '1';
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `تقرير_عقاري_${scheme.name || 'عرش'}.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
      alert('حدث خطأ أثناء تصدير الصورة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleSharePDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { 
        scale: 2, 
        backgroundColor: '#FFFBF2',
        useCORS: true,
        logging: true,
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`تقرير_عقاري_${scheme.name || 'عرش'}.pdf`);
    } catch (err) {
      console.error('PDF Export failed', err);
      alert('حدث خطأ أثناء تصدير ملف PDF. يرجى المحاولة مرة أخرى.');
    }
  };

  const feeItems = [
    { label: 'ضريبة التصرفات العقارية', value: columnTotals.transactionTax },
    { label: 'عمولة السعي', value: columnTotals.brokerage },
    { label: 'ضريبة القيمة المضافة', value: columnTotals.brokerageVat },
    { label: 'رسوم التوثيق', value: columnTotals.documentationFees },
    { label: 'رسوم أخرى', value: columnTotals.otherFees },
  ].filter((i) => i.value > 0);

  const maxFee = feeItems.length > 0 ? Math.max(...feeItems.map((i) => i.value)) : 1;

  const metrics = [
    { value: String(plots.length), label: 'عدد القطع', gold: false },
    { value: fmt(totalArea), label: 'المساحة الإجمالية (م²)', gold: false },
    { value: fmt(avgCostPerMeter), label: 'متوسط التكلفة/م²', gold: false },
    { value: fmt(grandTotal), label: 'الإجمالي الكلي', gold: true },
  ];

  return (
    <motion.section variants={container} initial="hidden" animate="visible" className="relative">
      {/* ─── Share Actions ─── */}
      <div className="flex justify-center gap-3 mb-6">
        {[
          { icon: '📷', label: 'تصدير كصورة', onClick: handleShareImage },
          { icon: '📄', label: 'تصدير PDF', onClick: handleSharePDF },
        ].map((btn, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05, backgroundColor: '#f8fafc' }}
            whileTap={{ scale: 0.95 }}
            onClick={btn.onClick}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-200 text-arsh-charcoal text-sm font-bold shadow-sm hover:border-arsh-blue hover:text-arsh-blue transition-all duration-300"
          >
            <span className="text-base">{btn.icon}</span>
            <span className="tracking-tight">{btn.label}</span>
          </motion.button>
        ))}
      </div>

      {/* ─── Executive Report Card ─── */}
      <div ref={reportRef} className="bg-arsh-paper rounded-[2.5rem] p-6 md:p-16 shadow-[0_40px_100px_-20px_rgba(0,58,99,0.15)] border border-white/60 relative overflow-hidden">
        {/* Royal Top Border */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-arsh-blue via-arsh-gold to-arsh-blue" />
        
        {/* Header */}
        <motion.div variants={itemFade} initial="hidden" animate="visible" className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-arsh-blue/10 text-arsh-blue text-[11px] font-black uppercase tracking-[0.2em] mb-4 border border-arsh-blue/20">
            Certified Valuation Report
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-arsh-blue mb-4 tracking-tight">ملخص التكاليف الاستثمارية</h2>
          <div className="flex items-center justify-center gap-4 text-sm text-arsh-charcoal/50 font-medium">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-arsh-gold" />
              المخطط: <strong className="text-arsh-charcoal/80">{scheme.name || '—'}</strong>
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-arsh-gold" />
              رقم: <strong className="text-arsh-charcoal/80">{scheme.number || '—'}</strong>
            </span>
          </div>
        </motion.div>

        {/* Key Performance Metrics with Animation */}
        <motion.div 
          variants={itemFade} 
          initial="hidden" 
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {metrics.map((m, i) => (
            <div 
              key={i} 
              className={`relative p-6 rounded-3xl transition-all duration-500 ${m.gold ? 'bg-gradient-to-br from-arsh-gold to-arsh-copper text-white shadow-xl shadow-arsh-gold/30 scale-105' : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'}`}
            >
              <div className="text-2xl md:text-3xl font-bold mb-1">
                <AnimatedNumber value={m.value} isGold={m.gold} />
              </div>
              <div className={`text-[10px] font-black uppercase tracking-widest ${m.gold ? 'text-white/70' : 'text-arsh-charcoal/40'}`}>
                {m.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Detailed Plots Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="flex items-center gap-3 text-lg font-bold text-arsh-blue">
              <div className="w-1.5 h-6 rounded-full bg-arsh-gold" />
              تفاصيل توزيع التكاليف
            </h3>
            <span className="text-xs font-bold text-arsh-charcoal/40 px-3 py-1 bg-gray-100 rounded-full">{plots.length} قطعة</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {plots.map((p, i) => (
              <motion.div
                key={i}
                variants={itemFade}
                initial="hidden"
                animate="visible"
                custom={i + 1}
                className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-arsh-gold/40 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-arsh-blue text-white text-xs font-black shadow-lg shadow-arsh-blue/30">
                      {p.plotNumber || i + 1}
                    </span>
                    <span className="text-sm font-bold text-arsh-charcoal">قطعة رقم {p.plotNumber || i + 1}</span>
                  </div>
                  <div className="text-2xl font-black text-arsh-gold font-mono dir-ltr">
                    {fmt(p.total)} <span className="text-xs font-medium opacity-60">﷼</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-4 border-t border-gray-50">
                  {[
                    { label: 'المساحة', value: `${fmt(p.area)} م²` },
                    { label: 'سعر المتر', value: `${fmt(p.pricePerMeter)} ﷼` },
                    { label: 'القيمة', value: `${fmt(p.landValue)} ﷼` },
                    ...(p.transactionTax > 0 ? [{ label: 'الضريبة', value: `${fmt(p.transactionTax)} ﷼` }] : []),
                    ...(p.brokerage > 0 ? [{ label: 'السعي', value: `${fmt(p.brokerage)} ﷼` }] : []),
                  ].slice(0, 5).map((item, j) => (
                    <div key={j} className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-arsh-charcoal/30 uppercase tracking-tighter">{item.label}</span>
                      <span className="text-sm font-bold text-arsh-charcoal font-mono dir-ltr">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Financial Burden Analysis */}
        {feeItems.length > 0 && (
          <motion.div variants={itemFade} initial="hidden" animate="visible" className="mb-16 bg-slate-50/80 rounded-[2rem] p-8 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-arsh-gold/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <h3 className="flex items-center gap-3 text-lg font-bold text-arsh-blue mb-8">
              <div className="w-1.5 h-6 rounded-full bg-arsh-gold" />
              تحليل الأعباء المالية الإضافية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
              {feeItems.map((item) => (
                <div key={item.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-arsh-charcoal/60 uppercase">{item.label}</span>
                    <span className="text-sm font-black text-arsh-charcoal font-mono dir-ltr">{fmt(item.value)} ﷼</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.value / maxFee) * 100}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-arsh-gold via-arsh-copper to-arsh-gold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Royal Footer Summary */}
        <motion.div variants={scaleIn} initial="hidden" animate="visible" className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-arsh-gold via-arsh-copper to-arsh-gold rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-700" />
          <div className="relative py-10 px-8 rounded-[2rem] bg-gradient-to-br from-arsh-blue to-[#001a30] text-center text-white shadow-2xl border border-white/10">
            <div className="text-white/50 text-xs font-black uppercase tracking-[0.3em] mb-3">Total Investment Required</div>
            <div className="text-5xl md:text-7xl font-black font-mono dir-ltr tracking-tighter mb-4">
              <AnimatedNumber value={fmt(grandTotal)} isGold={false} /> 
              <span className="text-2xl font-medium opacity-60 mr-2">﷼</span>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 text-[11px] text-white/30 font-medium italic leading-relaxed">
              هذا التقرير يمثل تحليلاً مالياً تقديرياً بناءً على المدخلات الحالية.<br/>
              جميع القيم تخضع للرسوم والضرائب السائدة في المملكة العربية السعودية.
            </div>
          </div>
        </motion.div>
        
        {/* Final Decorative Finish */}
        <div className="h-1 rounded-full bg-gradient-to-r from-transparent via-arsh-gold to-transparent mt-12 opacity-40" />
      </div>
    </motion.section>
  );
}
