import type { Plot, FeeRates, PlotResult, CalculationResult, SchemeInfo, ColumnTotal } from '../types';

function calculatePlot(plot: Plot, fees: FeeRates): PlotResult {
  const vatOnBrokerage = fees.brokerageRate > 0;

  const landValue = plot.area * plot.pricePerMeter;
  const transactionTax = landValue * (fees.transactionTaxRate / 100);
  const brokerage = landValue * (fees.brokerageRate / 100);
  const brokerageVat = vatOnBrokerage ? brokerage * (fees.vatRate / 100) : 0;
  const totalBrokerage = brokerage + brokerageVat;
  const documentationFees = fees.documentationFees;
  const otherFees = fees.otherFees;
  const total = landValue + transactionTax + totalBrokerage + documentationFees + otherFees;

  return {
    plotNumber: plot.plotNumber,
    area: plot.area,
    pricePerMeter: plot.pricePerMeter,
    landValue,
    transactionTax,
    brokerage,
    brokerageVat,
    totalBrokerage,
    documentationFees,
    otherFees,
    total,
  };
}

function sumCols(plots: PlotResult[]): ColumnTotal {
  const init: ColumnTotal = {
    landValue: 0, transactionTax: 0, brokerage: 0, brokerageVat: 0,
    totalBrokerage: 0, documentationFees: 0, otherFees: 0, total: 0,
  };
  return plots.reduce((acc, p) => ({
    landValue: acc.landValue + p.landValue,
    transactionTax: acc.transactionTax + p.transactionTax,
    brokerage: acc.brokerage + p.brokerage,
    brokerageVat: acc.brokerageVat + p.brokerageVat,
    totalBrokerage: acc.totalBrokerage + p.totalBrokerage,
    documentationFees: acc.documentationFees + p.documentationFees,
    otherFees: acc.otherFees + p.otherFees,
    total: acc.total + p.total,
  }), init);
}

export function calculateAll(scheme: SchemeInfo, plots: Plot[], fees: FeeRates): CalculationResult {
  const plotResults = plots.map((p) => calculatePlot(p, fees));
  const columnTotals = sumCols(plotResults);
  const grandTotal = columnTotals.total;

  return { scheme, plots: plotResults, columnTotals, grandTotal };
}
