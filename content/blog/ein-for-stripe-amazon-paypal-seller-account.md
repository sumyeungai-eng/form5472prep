---
title: "EIN for Stripe, Amazon, or PayPal Seller Accounts"
description: "A foreign-owned LLC usually needs its EIN and exact IRS legal name before seller onboarding. Use this sequence and fix common EIN mismatches."
date: 2026-08-30
updated: 2026-08-30
author: "Form5472 Prep"
tags: ["ein", "stripe", "amazon-seller", "paypal", "foreign-owned-llc"]
draft: false
---

**For a Stripe, Amazon, or PayPal business account, a non-resident founder should obtain the LLC's EIN before onboarding and enter the LLC's legal name exactly as it appears in IRS records. The EIN identifies the LLC; a foreign individual owner's W-8BEN documents the owner. If verification fails, check the name-EIN pair before applying again.**

A platform rejection can look like an EIN problem when the number is valid. The account may contain a trading name instead of the LLC's legal name, an omitted “LLC” suffix, or owner information where entity information belongs. Repeated submissions with different spellings create more records to untangle.

For a 2026 seller launch, the right preparation is deliberately boring: one formation record, one IRS record, and one consistent set of names and addresses. The IRS charges **$0** to issue an EIN and warns that nobody has to pay a government fee for one on its [online EIN page](https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online). A paid service charges for preparing Form SS-4 and handling the application, not for selling the number.

If seller onboarding is waiting on the federal number, [get the LLC's EIN handled for $149](/ein?utm_source=blog&utm_medium=internal&utm_campaign=ein-for-stripe-amazon-paypal-seller-account). This guide begins after formation and concentrates on getting the EIN record ready for platform review; the separate [EIN application checklist](/blog/ein-application-checklist-foreign-owned-llc) covers the underlying SS-4 inputs.

## Why do seller platforms ask for an EIN?

Seller platforms ask for tax-identification information so they can identify the business attached to an account and complete any tax reporting that applies to their role. An EIN is the federal identifier for the LLC. It does not prove the owner's personal tax status, guarantee account approval, or turn a non-resident into a US person.

The useful mental model has two files:

- **Entity file:** LLC legal name, EIN, formation jurisdiction, formation document, business address, and authority to act for the LLC.
- **Owner file:** beneficial owner's legal name, residential address, identity document, ownership details, and the tax-status form requested for that owner.

Putting the owner's name beside the LLC's EIN creates a different name-TIN pair from the one in IRS records. Putting the LLC's name on every owner field can hide the natural person whom the platform is trying to identify.

The IRS [TIN Matching service](https://www.irs.gov/tax-professionals/taxpayer-identification-number-tin-matching) illustrates the key federal check: eligible payers can validate a taxpayer identification number and name combination before submitting an information return. A seller platform may have its own workflow and additional checks, but the practical first question remains the same: **does the submitted legal name belong with that EIN?**

## What does a platform onboarding file usually contain?

A platform onboarding file usually contains the same categories even when labels differ. The table is a preparation map, not a statement of current platform policy; read the live prompt before answering it.

| Account being prepared | US taxpayer-ID field | Entity identity | Address evidence | Owner tax-status layer |
|---|---|---|---|---|
| Stripe business account | LLC EIN where the account is for the LLC | Exact LLC legal name and formation record | Address requested by the live application | Beneficial-owner details and the appropriate owner form if requested |
| Amazon seller account | LLC EIN where the seller is the LLC | Exact LLC legal name and formation record | Address requested by the live application | Beneficial-owner details and the appropriate owner form if requested |
| PayPal business account | LLC EIN where the account is for the LLC | Exact LLC legal name and formation record | Address requested by the live application | Beneficial-owner details and the appropriate owner form if requested |
| Any other marketplace or processor | EIN matched to the named legal entity | Formation document and authority record | Business, registered, or residential address according to the field label | Owner identity and foreign-status documentation where applicable |

Read whether a field asks for the **business**, **account holder**, **beneficial owner**, or **taxpayer**. One person may control every role, but the name and identifier can still differ by field.

## Which name should be paired with the EIN?

Pair the LLC's EIN with the legal entity name used on its IRS record. Start with the EIN confirmation rather than memory, a website header, or a marketplace display name. Preserve punctuation, meaningful words, and the entity suffix consistently; do not substitute a brand or DBA unless the field specifically asks for it.

Compare the LLC's state formation name, the name on its IRS EIN confirmation, and the platform's legal-entity field. Do not “solve” an old record by creating a second EIN application. The [new-EIN rules after an LLC change](/blog/new-ein-llc-ownership-structure-change) explain when a changed name, address, or responsible party is an update rather than a new-number event.

## What is the best order for formation, EIN, banking, and onboarding?

The best order is **formation, EIN, bank, then platform**. Each step creates evidence used by the next step and gives the founder one stable record to reuse.

1. **Form the LLC.** Save the state-stamped formation document and confirm the exact legal name, jurisdiction, formation date, and ownership.
2. **Obtain the EIN.** Apply once, keep the completed Form SS-4, and save the IRS confirmation permanently. The IRS tells LLC applicants to form the entity before requesting the EIN.
3. **Open the business account.** Use the LLC name and EIN consistently, then save the bank's accepted entity record and opening-funds evidence.
4. **Complete platform onboarding.** Copy legal data from the source documents. Treat storefront names, display names, and customer-facing brands as separate fields.
5. **Archive the accepted submission.** Keep screenshots or PDFs of the final answers, tax forms, upload confirmations, and any support correspondence.

Starting onboarding without the EIN can mean reaching a tax-ID stop and returning later. The sequence prevents avoidable rework; it does not promise approval.

## Does the EIN belong to the LLC or the foreign owner?

The EIN belongs to the LLC. A foreign individual owner's Form W-8BEN addresses the owner's status for withholding and reporting purposes; it is not the LLC's EIN application and does not replace the entity identifier.

The distinction matters most for a single-member LLC that is disregarded for federal tax purposes. The [IRS Instructions for Form W-8BEN](https://www.irs.gov/instructions/iw8ben) say the single owner of a disregarded entity is treated as the beneficial owner of income the entity receives and provides the appropriate owner documentation. A foreign entity owner generally follows a different form path.

Seller onboarding can need both layers without contradiction. Do not sign Form W-9 merely because the LLC has a US EIN or put the owner's foreign tax number into an EIN field. For the form choice and exceptions, use the focused [W-8BEN versus W-9 guide](/blog/w8ben-vs-w9-foreign-owned-llc).

## What should you do when a platform rejects the EIN?

When a platform rejects the EIN, stop changing fields at random and diagnose the record in a fixed order. “Invalid EIN” can describe a failed combination or document review; it does not establish that the IRS never assigned the number.

1. **Confirm every digit from IRS evidence.** Do not rely on a typed note, memory, or a copy-pasted number with hidden spaces.
2. **Compare the legal name character by character.** Check the IRS confirmation, formation record, and platform legal-entity field. Move a DBA or store name to a trade-name field only when the application provides one.
3. **Check which person the field describes.** An entity EIN should sit beside the entity's name, while a beneficial-owner question needs the owner's information.
4. **Review address labels.** A registered address, trading address, mailing address, and owner's residence are not interchangeable merely because the same application displays them together.
5. **Supply accepted IRS evidence when support requests proof.** The IRS says its digital CP575 confirms the EIN and can be used when EIN verification is requested for business purposes.
6. **Escalate with a clean explanation.** State the LLC legal name, EIN, owner role, and which attached IRS document supports the pair. Ask what exact field or document failed.
7. **Apply for another EIN only if the IRS rules require one.** A platform rejection alone is not a reason to create a duplicate federal account.

The [IRS CP575 notice page](https://www.irs.gov/individuals/understanding-your-cp575-notice) says the original CP575A-J notice series cannot be duplicated or recreated. The same page says the digital CP575 is written confirmation and is accepted by banks and other institutions. If the original evidence is missing, obtain proper IRS confirmation rather than editing a saved SS-4 or making your own letter.

## How do four common onboarding scenarios work?

Four common scenarios show which record to fix without asserting a current policy for any named platform.

### Scenario 1: The founder has an LLC but no EIN

The founder starts a Stripe application using a personal foreign tax number in the business EIN field. The clean action is to pause, obtain the LLC's EIN, and resume. The foreign number may still belong in an owner field if requested.

### Scenario 2: The EIN is correct but the legal name is shortened

An Amazon seller application uses the storefront brand while the IRS record uses the full LLC name. The founder corrects the legal-entity field and keeps the brand only where a trade or display name is requested. No new EIN is needed merely to test a spelling.

### Scenario 3: The EIN proof is missing

A PayPal business-account review asks the founder to substantiate the LLC's federal number. The founder locates valid IRS confirmation and supplies it through the platform's stated channel. A homemade letter or altered SS-4 is not a substitute for IRS evidence.

### Scenario 4: The entity and owner layers are reversed

The LLC's name appears in a beneficial-owner field and the individual's name appears beside the EIN. The founder restores the roles: LLC name plus EIN for the entity, individual name plus appropriate foreign-owner documentation for the owner.

## How can Form5472 Prep obtain the EIN for the seller account?

Form5472 Prep can prepare Form SS-4 correctly for a foreign-owned entity, submit the application, deal with the IRS as third-party designee, and deliver the EIN, typically in **1-5 business days**. The service costs **$149**. The IRS charge remains **$0**; the price covers preparation and handling.

If an ITIN is genuinely required for a separate US tax purpose, the **$349** ITIN service at [/itin](/itin) includes identity-document certification through an IRS-authorised Certifying Acceptance Agent, so the applicant does not mail an original passport. An ITIN is not a prerequisite merely to obtain the LLC's EIN.

Annual Form 5472 filing is separate: **$149** standard, **$199** express, and **+$99** for each additional past tax year. If that annual filing is also due, [/start](/start) is the secondary next step after the EIN is available.

We are not a CPA firm and do not give tax advice. We prepare and submit the forms within the stated service scope; banks and seller platforms make their own account decisions.

## Frequently asked questions

### Do I need an EIN for a Stripe account as a non-resident?

If the Stripe business account is opened for a US LLC and the application requests the entity's US taxpayer number, use the LLC's EIN. Check the live application because account eligibility and supporting-document requirements are set by the platform.

### Does a non-resident need an EIN for an Amazon seller account?

An Amazon seller using a US LLC should prepare the LLC's EIN and exact IRS legal name for entity-level tax-ID questions. The owner's identity and foreign tax documentation remain separate. Follow Amazon's current prompts rather than assuming every seller follows one document path.

### Can I use my SSN or ITIN instead of the LLC's EIN?

Not in a field asking for the LLC's federal identifier. Personal and entity numbers identify different taxpayers. Read the field label, pair the LLC's EIN with its legal name, and provide personal information only in the owner-level section that requests it.

### Why does a platform say my EIN and name do not match?

First compare the IRS confirmation with the platform's legal-entity field. A trade name, omitted entity suffix, typing error, or owner name paired with the LLC EIN can produce a different combination. Ask platform support which field failed before changing the federal record.

### Is CP575 proof of an EIN?

Yes. The IRS describes CP575 as notice confirming an EIN and says it can be used when verification is requested for business purposes. Keep the IRS document in the LLC's permanent records and use the platform's secure upload route when proof is requested.

### Does the foreign owner give W-8BEN or W-9?

A nonresident individual who owns a disregarded LLC generally gives W-8BEN when owner documentation is requested, not W-9 merely because the LLC has an EIN. Entity owners and LLCs with tax elections need a separate classification analysis.

### Does an EIN guarantee seller-account approval?

No. The EIN resolves the federal entity-identifier step. A platform can separately review identity, ownership, addresses, business activity, supported countries, documents, and its own risk criteria. No EIN preparer can promise a platform's decision.

---

Build the seller-account file in one direction: formation record, EIN confirmation, bank evidence, then platform application. When the entity name and owner documentation stay in their proper lanes, a rejection becomes much easier to diagnose. [Get the EIN handled for $149](/ein?utm_source=blog&utm_medium=internal&utm_campaign=ein-for-stripe-amazon-paypal-seller-account-close), or review [how to open a US bank account for a foreign-owned LLC](/blog/us-bank-account-foreign-owned-llc).
