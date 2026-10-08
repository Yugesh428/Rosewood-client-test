import JobPosting from "./careerModel";
import { Op } from "sequelize";

// ─── Get all job postings ──────────────────────────────────────────────────
export async function getJobPostings(options?: {
  activeOnly?: boolean;
  department?: string;
  employmentType?: string;
}) {
  const where: any = {};

  if (options?.activeOnly) {
    where.isActive = true;
  }

  if (options?.department) {
    where.department = options.department;
  }

  if (options?.employmentType) {
    where.employmentType = options.employmentType;
  }

  const jobs = await JobPosting.findAll({
    where,
    order: [
      ["displayOrder", "ASC"],
      ["createdAt", "DESC"],
    ],
  });

  return jobs;
}

// ─── Get single job posting ────────────────────────────────────────────────
export async function getJobPostingById(id: string) {
  const job = await JobPosting.findByPk(id);
  return job;
}

// ─── Create job posting ────────────────────────────────────────────────────
export async function createJobPosting(data: {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  salaryRange?: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits?: string;
  applicationEmail: string;
  displayOrder?: number;
}) {
  const job = await JobPosting.create({
    title: data.title,
    department: data.department,
    location: data.location,
    employmentType: data.employmentType as any,
    salaryRange: data.salaryRange || null,
    description: data.description,
    requirements: data.requirements,
    responsibilities: data.responsibilities,
    benefits: data.benefits || null,
    applicationEmail: data.applicationEmail,
    displayOrder: data.displayOrder || 0,
    isActive: true,
  });

  return job;
}

// ─── Update job posting ────────────────────────────────────────────────────
export async function updateJobPosting(
  id: string,
  data: Partial<{
    title: string;
    department: string;
    location: string;
    employmentType: string;
    salaryRange: string;
    description: string;
    requirements: string;
    responsibilities: string;
    benefits: string;
    applicationEmail: string;
    displayOrder: number;
  }>
) {
  const job = await JobPosting.findByPk(id);
  if (!job) {
    throw new Error("Job posting not found");
  }

  await job.update(data);
  return job;
}

// ─── Toggle job posting active status ──────────────────────────────────────
export async function toggleJobPosting(id: string) {
  const job = await JobPosting.findByPk(id);
  if (!job) {
    throw new Error("Job posting not found");
  }

  await job.update({ isActive: !job.isActive });
  return job;
}

// ─── Delete job posting ────────────────────────────────────────────────────
export async function deleteJobPosting(id: string) {
  const job = await JobPosting.findByPk(id);
  if (!job) {
    throw new Error("Job posting not found");
  }

  await job.destroy();
  return { success: true };
}

// ─── Get departments ───────────────────────────────────────────────────────
export async function getJobDepartments() {
  const jobs = await JobPosting.findAll({
    attributes: ["department"],
    group: ["department"],
  });

  return jobs.map((j) => j.department);
}

// ─── Get stats ─────────────────────────────────────────────────────────────
export async function getJobStats() {
  const total = await JobPosting.count();
  const active = await JobPosting.count({ where: { isActive: true } });
  const inactive = await JobPosting.count({ where: { isActive: false } });

  return {
    total,
    active,
    inactive,
  };
}
