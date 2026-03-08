import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Report {
  id: number;
  title: string;
  scanId: number;
  generatedAt: string;
  format: "pdf" | "html" | "json";
  severity: "critical" | "high" | "medium" | "low";
  vulnerabilitiesCount: number;
  complianceScore: number;
}

const mockReports: Report[] = [
  {
    id: 1,
    title: "Relatório de Conformidade NIS2 - Março 2026",
    scanId: 1,
    generatedAt: "2026-03-07T14:30:00Z",
    format: "pdf",
    severity: "high",
    vulnerabilitiesCount: 12,
    complianceScore: 68,
  },
  {
    id: 2,
    title: "Análise de Vulnerabilidades - Rede Corporativa",
    scanId: 2,
    generatedAt: "2026-03-06T10:15:00Z",
    format: "html",
    severity: "medium",
    vulnerabilitiesCount: 8,
    complianceScore: 72,
  },
  {
    id: 3,
    title: "Plano de Ação - Artigos 21-28 NIS2",
    scanId: 3,
    generatedAt: "2026-03-05T09:00:00Z",
    format: "json",
    severity: "low",
    vulnerabilitiesCount: 5,
    complianceScore: 85,
  },
];

export default function Reports() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const handleDownload = (report: Report) => {
    toast.success(`Relatório "${report.title}" baixado com sucesso!`);
  };

  const handleView = (report: Report) => {
    setSelectedReport(report);
    toast.info(`Abrindo relatório: ${report.title}`);
  };

  const handleDelete = (reportId: number) => {
    setReports(reports.filter((r) => r.id !== reportId));
    toast.success("Relatório removido com sucesso");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie e visualize relatórios de conformidade NIS2 e análises de vulnerabilidades
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Relatório
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Vulnerabilidades Críticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {reports.reduce((sum, r) => sum + (r.severity === "critical" ? r.vulnerabilitiesCount : 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Requer ação imediata</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Score Médio de Conformidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(reports.reduce((sum, r) => sum + r.complianceScore, 0) / reports.length)}%
              </div>
              <p className="text-xs text-muted-foreground">Conformidade NIS2</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Relatórios Disponíveis</h2>
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1 p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <CardDescription>
                          Gerado em {formatDate(report.generatedAt)} • Scan #{report.scanId}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(report.severity)}>
                      {report.severity.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Vulnerabilidades</p>
                      <p className="text-lg font-semibold">{report.vulnerabilitiesCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conformidade NIS2</p>
                      <p className="text-lg font-semibold">{report.complianceScore}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Formato</p>
                      <p className="text-lg font-semibold uppercase">{report.format}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleView(report)}
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDownload(report)}
                    >
                      <Download className="h-4 w-4" />
                      Baixar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {reports.length === 0 && (
          <Card className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum relatório disponível</h3>
            <p className="text-muted-foreground mb-4">
              Crie um novo relatório para começar a analisar vulnerabilidades
            </p>
            <Button>Criar Novo Relatório</Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
