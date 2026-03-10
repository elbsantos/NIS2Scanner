import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Target, AlertCircle } from "lucide-react";

// Mock data for demonstration
const trendData = [
  { month: "Jan", nis2: 45, iso27001: 42, mitre: 38 },
  { month: "Fev", nis2: 48, iso27001: 45, mitre: 41 },
  { month: "Mar", nis2: 52, iso27001: 50, mitre: 45 },
  { month: "Abr", nis2: 58, iso27001: 56, mitre: 52 },
  { month: "Mai", nis2: 65, iso27001: 63, mitre: 60 },
  { month: "Jun", nis2: 68, iso27001: 66, mitre: 64 },
];

const vulnerabilityTrendData = [
  { month: "Jan", total: 45, critical: 8, high: 15 },
  { month: "Fev", total: 42, critical: 7, high: 14 },
  { month: "Mar", total: 38, critical: 5, high: 12 },
  { month: "Abr", total: 32, critical: 3, high: 10 },
  { month: "Mai", total: 24, critical: 2, high: 7 },
  { month: "Jun", total: 18, critical: 1, high: 5 },
];

const improvementActions = [
  {
    id: 1,
    title: "Implementar MFA em todos os sistemas",
    priority: "critical",
    status: "completed",
    impact: "+8.5%",
    articles: ["Art. 21", "Art. 22"],
  },
  {
    id: 2,
    title: "Atualizar políticas de backup",
    priority: "high",
    status: "completed",
    impact: "+5.2%",
    articles: ["Art. 24"],
  },
  {
    id: 3,
    title: "Implementar DLP",
    priority: "high",
    status: "in_progress",
    impact: "+3.8% (esperado)",
    articles: ["Art. 25"],
  },
  {
    id: 4,
    title: "Treinar equipa em segurança",
    priority: "medium",
    status: "open",
    impact: "+2.5% (esperado)",
    articles: ["Art. 21"],
  },
];

const beforeAfterComparison = {
  baseline: {
    nis2: 45,
    iso27001: 42,
    mitre: 38,
    vulnerabilities: 45,
    critical: 8,
  },
  current: {
    nis2: 68,
    iso27001: 66,
    mitre: 64,
    vulnerabilities: 18,
    critical: 1,
  },
};

function ComparisonCard({
  title,
  baseline,
  current,
  unit = "%",
}: {
  title: string;
  baseline: number;
  current: number;
  unit?: string;
}) {
  const improvement = current - baseline;
  const isPositive = improvement >= 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{current}{unit}</div>
            <p className="text-xs text-muted-foreground">
              Antes: {baseline}{unit}
            </p>
          </div>
          <div className={`flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-sm font-semibold">
              {isPositive ? "+" : ""}{improvement}{unit}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionPriorityBadge({ priority }: { priority: string }) {
  const colors = {
    critical: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-blue-100 text-blue-800",
  };

  return (
    <Badge className={colors[priority as keyof typeof colors]}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

function ActionStatusBadge({ status }: { status: string }) {
  const colors = {
    completed: "bg-green-100 text-green-800",
    in_progress: "bg-blue-100 text-blue-800",
    open: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge className={colors[status as keyof typeof colors]}>
      {status === "in_progress" ? "Em Progresso" : status === "completed" ? "Concluída" : "Aberta"}
    </Badge>
  );
}

export default function ComplianceHistory() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Conformidade</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe a evolução da conformidade NIS2 e ISO 27001 ao longo do tempo
          </p>
        </div>

        {/* Before/After Comparison */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <ComparisonCard
            title="Score NIS2"
            baseline={beforeAfterComparison.baseline.nis2}
            current={beforeAfterComparison.current.nis2}
          />
          <ComparisonCard
            title="Score ISO 27001"
            baseline={beforeAfterComparison.baseline.iso27001}
            current={beforeAfterComparison.current.iso27001}
          />
          <ComparisonCard
            title="Cobertura MITRE"
            baseline={beforeAfterComparison.baseline.mitre}
            current={beforeAfterComparison.current.mitre}
          />
          <ComparisonCard
            title="Vulnerabilidades"
            baseline={beforeAfterComparison.baseline.vulnerabilities}
            current={beforeAfterComparison.current.vulnerabilities}
            unit=""
          />
          <ComparisonCard
            title="Críticas"
            baseline={beforeAfterComparison.baseline.critical}
            current={beforeAfterComparison.current.critical}
            unit=""
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Vulnerabilidades</TabsTrigger>
            <TabsTrigger value="actions">Ações</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Conformidade</CardTitle>
                <CardDescription>
                  Scores de conformidade NIS2, ISO 27001 e cobertura MITRE ATT&CK ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="nis2"
                      stroke="#3b82f6"
                      name="NIS2"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="iso27001"
                      stroke="#10b981"
                      name="ISO 27001"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="mitre"
                      stroke="#f59e0b"
                      name="MITRE ATT&CK"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Área de Conformidade</CardTitle>
                <CardDescription>
                  Visualização em área dos scores de conformidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="nis2"
                      fill="#3b82f6"
                      stroke="#3b82f6"
                      fillOpacity={0.6}
                      name="NIS2"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vulnerabilities Tab */}
          <TabsContent value="vulnerabilities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Redução de Vulnerabilidades</CardTitle>
                <CardDescription>
                  Tendência de vulnerabilidades totais, críticas e altas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vulnerabilityTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#94a3b8" name="Total" />
                    <Bar dataKey="critical" fill="#ef4444" name="Críticas" />
                    <Bar dataKey="high" fill="#f97316" name="Altas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ações de Conformidade</CardTitle>
                <CardDescription>
                  Plano de ação com impacto estimado na conformidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {improvementActions.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{action.title}</h4>
                          <ActionPriorityBadge priority={action.priority} />
                          <ActionStatusBadge status={action.status} />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {action.articles.map((article) => (
                            <Badge key={article} variant="outline" className="text-xs">
                              {article}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end text-green-600 font-semibold">
                          <TrendingUp className="h-4 w-4" />
                          {action.impact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Meta de Conformidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">Meta NIS2:</span> 85% até Junho 2026
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Progresso Atual:</span> 68% (17% faltando)
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Ações Necessárias:</span> Implementar DLP e treinar equipa
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
