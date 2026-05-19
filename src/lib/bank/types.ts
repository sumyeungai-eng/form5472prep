// Canonical bank-statement transaction format. Every parser normalises into this shape.
export type ParsedTransaction = {
  // YYYY-MM-DD
  date: string;
  description: string;
  // Counterparty as the bank reports it. May be empty if the bank doesn't separate.
  counterparty: string;
  // Positive for money into the account, negative for money out.
  amountCents: number;
  // Bank's own transaction id, if any. Used for dedup.
  bankRef?: string;
};

export type BankProvider = "mercury" | "wise" | "relay" | "brex" | "generic";

export type ParseResult = {
  provider: BankProvider;
  transactions: ParsedTransaction[];
  warnings: string[];
};
