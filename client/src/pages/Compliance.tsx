import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Target,
  Lock,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface ComplianceMetric {
  name: string;
  value: number;
  target: number;
  trend: "up" | "down" | "stable";
}

interface ControlStatus {
  id: string;
  name: string;
  status: "compliant" | "partial" | "non_compliant";
  implementation: number;
  priority: "critical" | "high" | "medium" | "low";
}

interface TacticRisk {
  name: string;
  risk: number;
  vulnerabilities: number;
  status: "high" | "medium" | "low";
}

const mockNIS2Data = {
  overallScore: 68,
  articlesCompliant: 12,
  articlesCovered: 30,
  criticalGaps: 3,
  highGaps: 5,
  metrics: [
    { name: "Art. 21 - Segurança de Sistemas", value: 75, target: 100, trend: "up" as const },
    { name: "Art. 22 - Gestão de Riscos", value: 65, target: 100, trend: "stable" as const },
    { name: "Art. 23 - Resposta a Incidentes", value: 55, target: 100, trend: "down" as const },
    { name: "Art. 24 - Continuidade de Negócio", value: 70, target: 100, trend: "up" as const },
  ],
};

const mockISO27001Data = {
  overallScore: 72,
  domainsCompliant: 6,
  domainsCovered: 14,
  implementedControls: 45,
  totalControls: 93,
  gaps: [
    { id: "A.5.1", name: "Políticas de Segurança da Informação", status: "partial" as const, implementation: 60, priority: "high" as const },
    { id: "A.9.1", name: "Controlo de Acesso", status: "partial" as const, implementation: 70, priority: "critical" as const },
    { id: "A.12.1", name: "Gestão de Mudanças", status: "non_compliant" as const, implementation: 20, priority: "high" as const },
    { id: "A.14.2", name: "Desenvolvimento Seguro", status: "non_compliant" as const, implementation: 30, priority: "high" as const },
  ],
};

const mockMitreData = {
  coverage: 65,
  tacticsCovered: 8,
  tacticTotal: 14,
  topThreats: [
    { name: "Execution", risk: 85, vulnerabilities: 5, status: "high" as const },
    { name: "Persistence", risk: 72, vulnerabilities: 3, status: "high" as const },
    { name: "Privilege Escalation", risk: 68, vulnerabilities: 2, status: "medium" as const },
    { name: "Defense Evasion", risk: 55, vulnerabilities: 2, status: "medium" as const },
  ],
};

export default function Compliance() {
  const [activeTab, setActiveTab] = useState("nis2");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "non_compliant":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return "📈";
    if (trend === "down") return "📉";
    return "➡️";
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conformidade Integrada</h1>
            <p className="text-muted-foreground mt-2">
              Dashboard unificado de NIS2, ISO 27001 e MITRE ATT&CK
            </p>
          </div>
          <Button className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Gerar Relatório
          </Button>
        </div>

        {/* Overall Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">NIS2 Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockNIS2Data.overallScore}%</div>
              <p className="text-xs text-muted-foreground mt-2">
                {mockNIS2Data.articlesCompliant}/{mockNIS2Data.articlesCovered} artigos cobertos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">ISO 27001 Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockISO27001Data.overallScore}%</div>
              <p className="text-xs text-muted-foreground mt-2">
                {mockISO27001Data.implementedControls}/{mockISO27001Data.totalControls} controlos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">MITRE ATT&CK Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockMitreData.coverage}%</div>
              <p className="text-xs text-muted-foreground mt-2">
                {mockMitreData.tacticsCovered}/{mockMitreData.tacticTotal} táticas cobertas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Overall Risk Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">6.8/10</div>
              <p className="text-xs text-muted-foreground mt-2">Risco moderado-alto</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nis2" className="gap-2">
              <Shield className="h-4 w-4" />
              NIS2
            </TabsTrigger>
            <TabsTrigger value="iso27001" className="gap-2">
              <Lock className="h-4 w-4" />
              ISO 27001
            </TabsTrigger>
            <TabsTrigger value="mitre" className="gap-2">
              <Target className="h-4 w-4" />
              MITRE ATT&CK
            </TabsTrigger>
          </TabsList>

          {/* NIS2 Tab */}
          <TabsContent value="nis2" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Conformidade NIS2</CardTitle>
                <CardDescription>
                  Progresso de implementação dos artigos 21-28 da Diretiva NIS2
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockNIS2Data.metrics.map((metric) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">{metric.name}</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{metric.value}%</span>
                        <span>{getTrendIcon(metric.trend)}</span>
                      </div>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gaps Críticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium">Vulnerabilidades Críticas</span>
                    <Badge className="bg-red-600">{mockNIS2Data.criticalGaps}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium">Vulnerabilidades Altas</span>
                    <Badge className="bg-orange-600">{mockNIS2Data.highGaps}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ISO 27001 Tab */}
          <TabsContent value="iso27001" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Conformidade ISO 27001</CardTitle>
                <CardDescription>
                  Implementação de controlos nos 14 domínios da ISO 27001:2022
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Controlos Implementados</p>
                    <p className="text-2xl font-bold mt-2">{mockISO27001Data.implementedControls}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Controlos Pendentes</p>
                    <p className="text-2xl font-bold mt-2">
                      {mockISO27001Data.totalControls - mockISO27001Data.implementedControls}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Controlos com Gaps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockISO27001Data.gaps.map((gap) => (
                  <div key={gap.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{gap.id} - {gap.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Implementação: {gap.implementation}%
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(gap.status)}>
                          {gap.status.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(gap.priority)}>
                          {gap.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={gap.implementation} className="h-1" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MITRE ATT&CK Tab */}
          <TabsContent value="mitre" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Táticas MITRE ATT&CK</CardTitle>
                <CardDescription>
                  Cobertura defensiva contra técnicas de ataque conhecidas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Táticas Cobertas</p>
                    <p className="text-2xl font-bold mt-2">{mockMitreData.tacticsCovered}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Táticas Expostas</p>
                    <p className="text-2xl font-bold mt-2">
                      {mockMitreData.tacticTotal - mockMitreData.tacticsCovered}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Ameaças por Tática</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockMitreData.topThreats.map((threat) => (
                  <div key={threat.name} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{threat.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {threat.vulnerabilities} vulnerabilidades descobertas
                        </p>
                      </div>
                      <Badge className={getStatusColor(threat.status)}>
                        {threat.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Progress value={threat.risk} className="h-2" />
                      </div>
                      <span className="text-sm font-bold w-12 text-right">{threat.risk}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Recomendações Prioritárias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded">
              <p className="font-medium text-sm text-red-900">Crítico</p>
              <p className="text-sm text-red-800 mt-1">
                Implementar controlo de acesso (A.9.1) - Mapeado para 5 vulnerabilidades críticas
              </p>
            </div>
            <div className="p-4 bg-orange-50 border-l-4 border-orange-600 rounded">
              <p className="font-medium text-sm text-orange-900">Alto</p>
              <p className="text-sm text-orange-800 mt-1">
                Melhorar gestão de mudanças (A.12.1) - Reduzir risco de Execution (MITRE)
              </p>
            </div>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-600 rounded">
              <p className="font-medium text-sm text-yellow-900">Médio</p>
              <p className="text-sm text-yellow-800 mt-1">
                Implementar desenvolvimento seguro (A.14.2) - Alinhado com Art. 21 NIS2
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
