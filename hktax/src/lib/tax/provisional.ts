import type { Computation, ComputationLine, TaxYearParams } from './types';

export interface DemandNote {
  finalTax: number;
  provisionalTax: number;
  totalDemand: number;
  lines: ComputationLine[];
  installments: {
    firstAmount: number;
    secondAmount: number;
  };
}

type DemandHead = 'salaries' | 'property' | 'profits' | 'pa';

export interface HoldoverGround {
  id: string;
  labelZh: string;
  labelEn: string;
  descriptionZh: string;
  descriptionEn: string;
}

function line(
  key: string,
  labelZh: string,
  labelEn: string,
  amount: number,
  kind: ComputationLine['kind'],
): ComputationLine {
  return { key, labelZh, labelEn, amount, kind };
}

function expectedComputationHead(head: DemandHead): Computation['head'] {
  return head === 'pa' ? 'personalAssessment' : head;
}

export function assembleDemand(head: DemandHead, finalComp: Computation, params: TaxYearParams): DemandNote {
  const expectedHead = expectedComputationHead(head);
  if (finalComp.head !== expectedHead) {
    throw new Error(`Demand head ${head} does not match computation head ${finalComp.head}`);
  }

  const finalTax = finalComp.finalTax;
  // Provisional tax for the following year is assessed on the current year's
  // income/profits at the full statutory rates. The one-off tax reduction is a
  // final-assessment-only measure and does not apply to the provisional charge.
  const provisionalTax = Math.floor(finalComp.taxBeforeReduction);
  const totalDemand = finalTax + provisionalTax;
  // Round the second provisional-tax portion first, then derive the first
  // portion so the two provisional portions sum exactly to provisionalTax.
  const secondAmount = Math.round(provisionalTax * 0.25);
  const firstAmount = finalTax + (provisionalTax - secondAmount);

  return {
    finalTax,
    provisionalTax,
    totalDemand,
    lines: [
      line(
        'demand.year',
        `課稅年度 ${params.year.replace('_', '/')}`,
        `Year of assessment ${params.year.replace('_', '/')}`,
        0,
        'info',
      ),
      line('demand.finalTax', '本年度應繳最終稅款', 'Final tax payable for the year', finalTax, 'tax'),
      line('demand.provisionalTax', '下年度暫繳稅', 'Provisional tax for the following year', provisionalTax, 'tax'),
      line('demand.totalDemand', '繳稅通知書總額', 'Total demand', totalDemand, 'tax'),
      // Typical January/April installment split, per demand note -- actual due dates
      // are set by IRD on the individual demand note and can vary.
      line('demand.installment.first', '第一期稅款', 'First installment amount', firstAmount, 'tax'),
      line('demand.installment.second', '第二期稅款', 'Second installment amount', secondAmount, 'tax'),
    ],
    installments: {
      firstAmount,
      secondAmount,
    },
  };
}

// Simplified unified holdover checklist across salaries, profits, property, and
// Personal Assessment. Source: hktax/docs/params-verified-2026-08-31.md section 8.
// That source notes the profits/property lists are reconstructed from secondary
// sources rather than a single verbatim official enumeration; cross-check IRO
// ss.63H/63J/63K directly if statute-level precision is required.
export const HOLDOVER_GROUNDS: HoldoverGround[] = [
  {
    id: '90-percent-drop',
    labelZh: '入息或應評稅額少於九成',
    labelEn: 'Income or assessable amount below 90%',
    descriptionZh: '本年度入息、應評稅利潤或應評稅值，已經或相當可能少於上一年度有關金額的90%。',
    descriptionEn: 'Current-year income, assessable profits, or assessable value is, or is likely to be, less than 90% of the preceding year figure.',
  },
  {
    id: 'increased-allowances-deductions',
    labelZh: '新增或增加免稅額或扣除',
    labelEn: 'New or increased allowances or deductions',
    descriptionZh: '納稅人已符合資格享有新增免稅額或扣除，或有關免稅額或扣除增加，但暫繳評稅未有反映。',
    descriptionEn: 'The taxpayer has become entitled to, or has an increase in, allowances or deductions that were not reflected in the provisional assessment.',
  },
  {
    id: 'personal-assessment-election',
    labelZh: '選擇個人入息課稅',
    labelEn: 'Personal Assessment election',
    descriptionZh: '納稅人已選擇或擬選擇個人入息課稅，而該選擇相當可能會減低應繳稅款。',
    descriptionEn: 'The taxpayer has elected, or intends to elect, Personal Assessment and that election is likely to reduce the tax payable.',
  },
  {
    id: 'ceased-source',
    labelZh: '有關收入來源已停止',
    labelEn: 'Relevant income source has ceased',
    descriptionZh: '納稅人已經或將會在課稅年度完結前停止取得有關收入、停止經營業務，或不再持有有關物業。',
    descriptionEn: 'The taxpayer has ceased, or will cease before year-end, to derive the relevant income, carry on the business, or hold the relevant source.',
  },
  {
    id: 'prior-year-objection',
    labelZh: '已反對上一年度評稅',
    labelEn: 'Prior-year assessment under objection',
    descriptionZh: '納稅人已就上一課稅年度的有關評稅提出反對。',
    descriptionEn: 'The taxpayer has objected to the relevant assessment for the preceding year.',
  },
];

export function checkHoldoverEligibility(answers: Record<string, boolean>): {
  eligible: boolean;
  matchedGrounds: typeof HOLDOVER_GROUNDS;
} {
  const matchedGrounds = HOLDOVER_GROUNDS.filter((ground) => answers[ground.id] === true);

  return {
    eligible: matchedGrounds.length > 0,
    matchedGrounds,
  };
}
