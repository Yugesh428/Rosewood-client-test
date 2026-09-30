import TermsSection from "./termsModel";

// ─── Get all sections ───────────────────────────────────────────────────────
export async function getTermsSections(activeOnly: boolean = false) {
  const where: any = {};
  
  if (activeOnly) {
    where.isActive = true;
  }

  const sections = await TermsSection.findAll({
    where,
    order: [["displayOrder", "ASC"]],
  });

  return sections;
}

// ─── Get single section ─────────────────────────────────────────────────────
export async function getTermsSectionById(id: string) {
  const section = await TermsSection.findByPk(id);
  return section;
}

// ─── Create section ─────────────────────────────────────────────────────────
export async function createTermsSection(data: {
  title: string;
  content: string;
  displayOrder?: number;
}) {
  const section = await TermsSection.create({
    title: data.title,
    content: data.content,
    displayOrder: data.displayOrder || 0,
    isActive: true,
  });

  return section;
}

// ─── Update section ─────────────────────────────────────────────────────────
export async function updateTermsSection(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    displayOrder: number;
  }>
) {
  const section = await TermsSection.findByPk(id);
  if (!section) {
    throw new Error("Terms section not found");
  }

  await section.update(data);
  return section;
}

// ─── Toggle section ─────────────────────────────────────────────────────────
export async function toggleTermsSection(id: string) {
  const section = await TermsSection.findByPk(id);
  if (!section) {
    throw new Error("Terms section not found");
  }

  await section.update({ isActive: !section.isActive });
  return section;
}

// ─── Delete section ─────────────────────────────────────────────────────────
export async function deleteTermsSection(id: string) {
  const section = await TermsSection.findByPk(id);
  if (!section) {
    throw new Error("Terms section not found");
  }

  await section.destroy();
  return { success: true };
}
