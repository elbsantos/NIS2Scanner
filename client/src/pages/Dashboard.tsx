import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const { data: organization, isLoading: orgLoading } = trpc.organization.get.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: scans, isLoading: scansLoading } = trpc.scans.list.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: recommendations } = trpc.recommendations.list.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: notifications } = trpc.notifications.list.useQuery(
    { unreadOnly: true },
    { enabled: !!user }
  );

  if (authLoading || orgLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      </DashboardLayout>
    );
  }

  const recentScans = scans?.slice(0, 5) || [];
  const criticalRecommendations = recommendations?.filter((r) => r.priority === "critical") || [];

  // Calculate compliance score (placeholder)
  const complianceScore = 68;
  const nis2ArticlesCovered = 12;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard de Conformidade NIS2</h1>
            <p className="text-muted-foreground mt-2">
              Bem-vindo, {user?.name}! Acompanhe o estado de segurança da sua organização.
            </p>
          </div>
          <Button onClick={() => navigate("/scans/new")} className="gap-2">
            <Shield className="w-4 h-4" />
            Novo Scan
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Score de Conformidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{complianceScore}%</div>
              <p className="text-xs text-muted-foreground mt-2">↑ 5% vs. mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Artigos NIS2 Cobertos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{nis2ArticlesCovered}/30</div>
              <p className="text-xs text-muted-foreground mt-2">40% de conformidade</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vulnerabilidades Críticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">3</div>
              <p className="text-xs text-muted-foreground mt-2">Ação imediata necessária</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Últimas Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{notifications?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">Não lidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {criticalRecommendations.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="w-5 h-5" />
                Recomendações Críticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {criticalRecommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="flex items-start gap-2 text-sm text-red-800">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{rec.title}</p>
                      <p className="text-red-700">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Scans */}
        <Card>
          <CardHeader>
            <CardTitle>Scans Recentes</CardTitle>
            <CardDescription>Últimos 5 scans de segurança realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {scansLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="animate-spin w-6 h-6" />
              </div>
            ) : recentScans.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhum scan realizado ainda</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/scans/new")}
                >
                  Iniciar Primeiro Scan
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => navigate(`/scans/${scan.id}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{scan.scanName}</p>
                      <p className="text-sm text-muted-foreground">
                        {scan.mode === "sme" ? "Modo SME" : "Modo Supply Chain"} •{" "}
                        {new Date(scan.createdAt).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {scan.vulnerabilitiesFound} vulnerabilidades
                      </span>
                      {scan.status === "completed" && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {scan.status === "running" && (
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      )}
                      {scan.status === "failed" && (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Conformidade</CardTitle>
              <CardDescription>Progresso geral de conformidade NIS2</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Autenticação e Autorização</span>
                    <span className="text-sm text-muted-foreground">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Encriptação</span>
                    <span className="text-sm text-muted-foreground">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Disponibilidade</span>
                    <span className="text-sm text-muted-foreground">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Resposta a Incidentes</span>
                    <span className="text-sm text-muted-foreground">30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
              <CardDescription>Ações recomendadas para melhorar conformidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-sm font-medium text-blue-700">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Implementar MFA</p>
                    <p className="text-xs text-muted-foreground">Autenticação multifator em todos os sistemas</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-sm font-medium text-blue-700">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Atualizar Certificados SSL</p>
                    <p className="text-xs text-muted-foreground">Renovar certificados expirados</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-sm font-medium text-blue-700">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Plano de Recuperação de Desastres</p>
                    <p className="text-xs text-muted-foreground">Documentar e testar procedimentos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
