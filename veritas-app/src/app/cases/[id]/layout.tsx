import React from "react";
import { CaseWorkspaceLayout } from "@/components/case/CaseWorkspaceLayout";
import { apiService } from "@/services/api";

export default async function CaseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialCase = await apiService.getCaseById(id);

  return (
    <CaseWorkspaceLayout caseId={id} initialCase={initialCase}>
      {children}
    </CaseWorkspaceLayout>
  );
}
