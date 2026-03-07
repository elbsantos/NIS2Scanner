import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Download, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

export default function ScanDetails() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/scans/:id");
  const scanId = params?.id ? parseInt(params.id) : 0;
  const [selectedVuln, setSelectedVuln] = useState<number | null>(null);

  const { data: scanDetails, isLoading } = trpc.scans.getDetails.useQuery(
    { scanId },
    { enabled: !!user && scanId > 0 }
  );

  const generateReport = trpc.reports.generate.useMutation({
    onSuccess: () => {
      alert("Relatório gerado com sucesso!");
    },
  });

  if (!match || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      </DashboardLayout>
    );
  }

  const vulnerabilities = scanDetails?.vulnerabilities || [];
  const summary = scanDetails?.summary;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Detalhes do Scan</h1>
            <p className="text-muted-foreground mt-2">
              Análise detalhada de vulnerabilidades e recomendações
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                generateReport.mutate({
                  scanId,
                  reportType: "technical",
                  format: "html",
                })
              }
              disabled={generateReport.isPending}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Gerar Relatório
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Voltar
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Vulnerabilidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.total || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-900">Críticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{summary?.critical || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-900">Altas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{summary?.high || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-900">Médias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{summary?.medium || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">Baixas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{summary?.low || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Vulnerabilities List */}
        <Card>
          <CardHeader>
            <CardTitle>Vulnerabilidades Encontradas</CardTitle>
            <CardDescription>
              Clique em uma vulnerabilidade para ver detalhes e recomendações
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vulnerabilities.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhuma vulnerabilidade encontrada!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vulnerabilities.map((vuln) => (
                  <div
                    key={vuln.id}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() =>
                      setSelectedVuln(selectedVuln === vuln.id ? null : vuln.id)
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(vuln.severity)}>
                            {vuln.severity.toUpperCase()}
                          </Badge>
                          <span className="font-mono text-sm text-muted-foreground">
                            {vuln.cveId}
                          </span>
                          <span className="text-sm font-medium">
                            CVSS {vuln.cvssScore ? (vuln.cvssScore as any).toFixed(1) : "N/A"}
                          </span>
                        </div>
                        <p className="font-medium">{vuln.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {vuln.description?.substring(0, 150)}...
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        {vuln.exploitAvailable && (
                          <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                            <AlertTriangle className="w-4 h-4" />
                            Exploit Disponível
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedVuln === vuln.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Descrição Completa
                          </p>
                          <p className="text-sm mt-1">{vuln.description}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Vetor CVSS
                          </p>
                          <p className="text-sm font-mono mt-1">{vuln.cvssVector}</p>
                        </div>

                        {vuln.affectedSoftware && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Software Afetado
                            </p>
                            <p className="text-sm mt-1">
                              {vuln.affectedSoftware}
                              {vuln.affectedVersion && ` (${vuln.affectedVersion})`}
                            </p>
                          </div>
                        )}

                        {vuln.remediationDetails && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Remediação
                            </p>
                            <p className="text-sm mt-1">{vuln.remediationDetails}</p>
                          </div>
                        )}

                        {vuln.nis2Articles && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Artigos NIS2 Relacionados
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {JSON.parse(vuln.nis2Articles || "[]").map(
                                (article: string) => (
                                  <Badge key={article} variant="secondary">
                                    {article}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recomendações Prioritárias</CardTitle>
            <CardDescription>
              Ações recomendadas para melhorar conformidade NIS2
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  priority: "critical",
                  title: "Aplicar Patches Críticos",
                  desc: "Atualizar imediatamente todos os sistemas com vulnerabilidades críticas",
                },
                {
                  priority: "high",
                  title: "Implementar MFA",
                  desc: "Ativar autenticação multifator em todos os pontos de acesso",
                },
                {
                  priority: "medium",
                  title: "Revisar Certificados SSL",
                  desc: "Verificar e renovar certificados SSL/TLS expirados",
                },
              ].map((rec, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Badge
                      className={
                        rec.priority === "critical"
                          ? "bg-red-100 text-red-800"
                          : rec.priority === "high"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {rec.priority.toUpperCase()}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">{rec.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{rec.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
