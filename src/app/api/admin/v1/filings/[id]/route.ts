import { fail, ok, withAdminAuth } from "@/lib/admin/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withAdminAuth(async (_req, { params }) => {
  const id = params.id;

  const [filing, messageRows, changeLogRows] = await Promise.all([
    prisma.filing.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        tier: true,
        amountPaid: true,
        llcName: true,
        llcEin: true,
        llcAddress: true,
        llcCity: true,
        llcState: true,
        llcZip: true,
        llcCountry: true,
        llcDateIncorporated: true,
        llcBusinessActivity: true,
        llcBusinessCode: true,
        ownerName: true,
        ownerAddress: true,
        ownerCountryCitizenship: true,
        ownerCountryTaxResidence: true,
        ownerCountryBusiness: true,
        ownerFtin: true,
        ownerItin: true,
        ownerReferenceId: true,
        taxYears: true,
        isDiirsp: true,
        reasonableCauseNarrative: true,
        faxService: true,
        faxStatus: true,
        faxedAt: true,
        signedAt: true,
        validationStatus: true,
        validationCheckedAt: true,
        createdAt: true,
        updatedAt: true,
        partnerId: true,
        user: { select: { id: true, email: true } },
        yearData: {
          select: {
            id: true,
            taxYear: true,
            totalAssetsYearEnd: true,
            contributions: true,
            distributions: true,
            reportableTransactions: true,
            otherTransactionsNote: true,
          },
        },
      },
    }),
    prisma.message.findMany({
      where: { filingId: id },
      select: {
        id: true,
        fromAdmin: true,
        body: true,
        readAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.filingChangeLog.findMany({
      where: { filingId: id },
      select: {
        id: true,
        adminId: true,
        source: true,
        field: true,
        beforeJson: true,
        afterJson: true,
        reason: true,
        changedAt: true,
      },
      orderBy: { changedAt: "desc" },
      take: 25,
    }),
  ]);

  if (!filing) {
    return fail(404, "not_found", "Filing not found");
  }

  const mappedFiling = {
    id: filing.id,
    status: filing.status,
    tier: filing.tier,
    amountPaid: filing.amountPaid,
    llcName: filing.llcName,
    llcEin: filing.llcEin,
    llcAddress: filing.llcAddress,
    llcCity: filing.llcCity,
    llcState: filing.llcState,
    llcZip: filing.llcZip,
    llcCountry: filing.llcCountry,
    llcDateIncorporated: filing.llcDateIncorporated?.toISOString() ?? null,
    llcBusinessActivity: filing.llcBusinessActivity,
    llcBusinessCode: filing.llcBusinessCode,
    ownerName: filing.ownerName,
    ownerAddress: filing.ownerAddress,
    ownerCountryCitizenship: filing.ownerCountryCitizenship,
    ownerCountryTaxResidence: filing.ownerCountryTaxResidence,
    ownerCountryBusiness: filing.ownerCountryBusiness,
    ownerFtin: filing.ownerFtin,
    ownerItin: filing.ownerItin,
    ownerReferenceId: filing.ownerReferenceId,
    taxYears: filing.taxYears,
    isDiirsp: filing.isDiirsp,
    reasonableCauseNarrative: filing.reasonableCauseNarrative,
    faxService: filing.faxService,
    faxStatus: filing.faxStatus,
    faxedAt: filing.faxedAt?.toISOString() ?? null,
    signedAt: filing.signedAt?.toISOString() ?? null,
    validationStatus: filing.validationStatus,
    validationCheckedAt: filing.validationCheckedAt?.toISOString() ?? null,
    createdAt: filing.createdAt.toISOString(),
    updatedAt: filing.updatedAt.toISOString(),
    partnerId: filing.partnerId,
    user: filing.user
      ? { id: filing.user.id, email: filing.user.email }
      : null,
    yearData: filing.yearData.map((year) => ({
      id: year.id,
      taxYear: year.taxYear,
      totalAssetsYearEnd: year.totalAssetsYearEnd.toString(),
      contributions: year.contributions.toString(),
      distributions: year.distributions.toString(),
      reportableTransactions: year.reportableTransactions,
      otherTransactionsNote: year.otherTransactionsNote,
    })),
  };

  const messages = messageRows.map((message) => ({
    id: message.id,
    fromAdmin: message.fromAdmin,
    body: message.body,
    readAt: message.readAt?.toISOString() ?? null,
    createdAt: message.createdAt.toISOString(),
  }));

  const changeLog = changeLogRows.map((change) => ({
    id: change.id,
    adminId: change.adminId,
    source: change.source,
    field: change.field,
    beforeJson: change.beforeJson,
    afterJson: change.afterJson,
    reason: change.reason,
    changedAt: change.changedAt.toISOString(),
  }));

  return ok({ filing: mappedFiling, messages, changeLog });
});
