export interface SchemeInfo {
  name: string;
  number: string;
}

export interface Plot {
  id: string;
  plotNumber: string;
  area: number;
  pricePerMeter: number;
}

export interface FeeRates {
  transactionTaxRate: number;
  brokerageRate: number;
  vatRate: number;
  documentationFees: number;
  otherFees: number;
}

export interface PlotResult {
  plotNumber: string;
  area: number;
  pricePerMeter: number;
  landValue: number;
  transactionTax: number;
  brokerage: number;
  brokerageVat: number;
  totalBrokerage: number;
  documentationFees: number;
  otherFees: number;
  total: number;
}

export interface ColumnTotal {
  landValue: number;
  transactionTax: number;
  brokerage: number;
  brokerageVat: number;
  totalBrokerage: number;
  documentationFees: number;
  otherFees: number;
  total: number;
}

export interface CalculationResult {
  scheme: SchemeInfo;
  plots: PlotResult[];
  columnTotals: ColumnTotal;
  grandTotal: number;
}
