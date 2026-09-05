export type FaqItem = { q: string; a: string };

export const EIN_APPLICATION_FAQ: FaqItem[] = [
  {
    q: "What happens after I submit the EIN application?",
    a: "You're taken straight to secure checkout for the $149 fee. Once paid, we review your details within one business day, prepare Form SS-4, and submit it to the IRS on your behalf. You'll receive an email confirmation and a portal login where you can track progress and message us.",
  },
  {
    q: "Do I need a US Social Security Number or ITIN to get an EIN?",
    a: "No. A non-resident owner without an SSN or ITIN can obtain an EIN. Form SS-4 allows the responsible party's tax ID to be marked \"Foreign\", and the application goes to the IRS international unit. That is the route we use, so you don't need any US tax number first.",
  },
  {
    q: "Which address should I use for the company business mailing address?",
    a: "Use the address where the IRS should send notices about the company. It can be your registered agent's address, a US mailing address, or your own address outside the US — Form SS-4 accepts a non-US mailing address. It does not need to be a physical office.",
  },
  {
    q: "What does business type mean, and what if my LLC has only one owner?",
    a: "Choose the legal form you registered: LLC, corporation, or sole proprietorship. A single-member LLC owned by a non-resident is treated as a disregarded entity for US tax, but it still applies as an LLC — we complete the correct entity boxes on Form SS-4 for you.",
  },
  {
    q: "What should I put for business activity and principal products?",
    a: "Describe what the business actually does in plain words — for example \"e-commerce retail\", \"consulting\" or \"software\" — and then the main products or services, such as \"home and kitchen products sold online\". The IRS uses this to assign a business classification; it does not restrict what you can sell later.",
  },
  {
    q: "Why don't you ask for my passport or formation documents?",
    a: "For the EIN itself, the IRS does not require passport copies or certified documents — Form SS-4 only needs the details on this form. If the IRS ever asks for supporting documents on a specific application, we'll request them from you through your portal chat.",
  },
  {
    q: "What if the IRS says my company already has an EIN?",
    a: "An entity can only hold one EIN. If the IRS reports that one already exists — common when a formation service applied on your behalf — the IRS will not issue a second number. Message us through your portal and we'll help you retrieve the existing EIN instead.",
  },
  {
    q: "Can I apply for an EIN before my LLC is formed?",
    a: "Form the LLC first. The IRS issues EINs only to entities that already exist, so the company must be registered with its state before Form SS-4 can be submitted.",
  },
];
