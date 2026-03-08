import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, Play, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Scan {
  id: number;
  name: string;
  mode: "sme" | "supply";
  targetRange: string;
  status: "pending" | "running" | "completed" | "failed";
  createdAt: string;
  vulnerabilitiesFound: number;
  complianceScore: number;
}

const mockScans: Scan[] = [
  {
    id: 1,
    name: "Scan Rede Corporativa - SME",
    mode: "sme",
    targetRange: "192.168.1.0/24",
    status: "completed",
    createdAt: "2026-03-07T14:30:00Z",
    vulnerabilitiesFound: 12,
    complianceScore: 68,
  },
  {
    id: 2,
    name: "Análise Completa - Supply Chain",
    mode: "supply",
    targetRange: "10.0.0.0/8",
    status: "running",
    createdAt: "2026-03-07T10:15:00Z",
    vulnerabilitiesFound: 0,
    complianceScore: 0,
  },
  {
    id: 3,
    name: "Scan Servidores Críticos",
    mode: "sme",
    targetRange: "172.16.0.0/12",
    status: "pending",
    createdAt: "2026-03-06T09:00:00Z",
    vulnerabilitiesFound: 0,
    complianceScore: 0,
  },
];

export default function Scans() {
  const [scans, setScans] = useState<Scan[]>(mockScans);
  const [, navigate] = useLocation();

  const handleExecuteScan = (scanId: number) => {
    setScans(
      scans.map((s) =>
        s.id === scanId ? { ...s, status: "running" as const } : s
      )
    );
    toast.success("Scan iniciado com sucesso!");
  };

  const handleViewDetails = (scanId: number) => {
    navigate(`/scans/${scanId}`);
  };

  const handleDeleteScan = (scanId: number) => {
    setScans(scans.filter((s) => s.id !== scanId));
    toast.success("Scan removido com sucesso");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
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
            <h1 className="text-3xl font-bold tracking-tight">Scans de Rede</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie e execute scans de vulnerabilidades na sua infraestrutura
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/scans/new")}>
            <Plus className="h-4 w-4" />
            Novo Scan
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scans.length}</div>
              <p className="text-xs text-muted-foreground">Todos os tempos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Scans Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {scans.filter((s) => s.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">Com sucesso</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Em Execução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {scans.filter((s) => s.status === "running").length}
              </div>
              <p className="text-xs text-muted-foreground">Processando</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Vulnerabilidades Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {scans.reduce((sum, s) => sum + s.vulnerabilitiesFound, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Descobertas</p>
            </CardContent>
          </Card>
        </div>

        {/* Scans List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Histórico de Scans</h2>
          <div className="grid gap-4">
            {scans.map((scan) => (
              <Card key={scan.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1 p-2 bg-cyan-100 rounded-lg">
                        <Shield className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{scan.name}</CardTitle>
                        <CardDescription>
                          {scan.targetRange} • {formatDate(scan.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(scan.status)}>
                        {scan.status === "running" && "🔄 "}
                        {scan.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {scan.mode === "sme" ? "SME Mode" : "Supply Chain"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Vulnerabilidades</p>
                      <p className="text-lg font-semibold">{scan.vulnerabilitiesFound}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Score de Conformidade</p>
                      <p className="text-lg font-semibold">{scan.complianceScore}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-lg font-semibold capitalize">{scan.status}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {scan.status === "pending" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleExecuteScan(scan.id)}
                      >
                        <Play className="h-4 w-4" />
                        Executar
                      </Button>
                    )}
                    {scan.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleViewDetails(scan.id)}
                      >
                        <Eye className="h-4 w-4" />
                        Detalhes
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteScan(scan.id)}
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
        {scans.length === 0 && (
          <Card className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum scan disponível</h3>
            <p className="text-muted-foreground mb-4">
              Crie um novo scan para começar a analisar vulnerabilidades na sua rede
            </p>
            <Button onClick={() => navigate("/scans/new")}>Criar Novo Scan</Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
