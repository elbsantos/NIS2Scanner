import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Plus, Edit, Trash2, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Asset {
  id: number;
  name: string;
  type: "server" | "network" | "workstation" | "iot" | "other";
  ipAddress?: string;
  hostname?: string;
  criticality: "low" | "medium" | "high" | "critical";
  lastScan?: string;
  vulnerabilities: number;
}

const mockAssets: Asset[] = [
  {
    id: 1,
    name: "Servidor Web Principal",
    type: "server",
    ipAddress: "192.168.1.10",
    hostname: "web-prod.empresa.pt",
    criticality: "critical",
    lastScan: "2026-03-07T14:30:00Z",
    vulnerabilities: 5,
  },
  {
    id: 2,
    name: "Servidor de Base de Dados",
    type: "server",
    ipAddress: "192.168.1.20",
    hostname: "db-prod.empresa.pt",
    criticality: "critical",
    lastScan: "2026-03-07T10:15:00Z",
    vulnerabilities: 3,
  },
  {
    id: 3,
    name: "Firewall Corporativo",
    type: "network",
    ipAddress: "192.168.1.1",
    hostname: "fw-corp.empresa.pt",
    criticality: "high",
    lastScan: "2026-03-06T09:00:00Z",
    vulnerabilities: 2,
  },
  {
    id: 4,
    name: "Workstation - Departamento TI",
    type: "workstation",
    ipAddress: "192.168.1.100",
    criticality: "medium",
    lastScan: "2026-03-05T15:30:00Z",
    vulnerabilities: 1,
  },
];

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);

  const handleDeleteAsset = (assetId: number) => {
    setAssets(assets.filter((a) => a.id !== assetId));
    toast.success("Ativo removido com sucesso");
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "server":
        return "🖥️";
      case "network":
        return "🌐";
      case "workstation":
        return "💻";
      case "iot":
        return "📱";
      default:
        return "⚙️";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString("pt-PT", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalVulnerabilities = () => {
    return assets.reduce((sum, a) => sum + a.vulnerabilities, 0);
  };

  const getCriticalAssets = () => {
    return assets.filter((a) => a.criticality === "critical").length;
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventário de Ativos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie todos os ativos de TI da sua organização
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Ativo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assets.length}</div>
              <p className="text-xs text-muted-foreground">Registrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Ativos Críticos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{getCriticalAssets()}</div>
              <p className="text-xs text-muted-foreground">Requerem atenção</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Vulnerabilidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{getTotalVulnerabilities()}</div>
              <p className="text-xs text-muted-foreground">Descobertas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Taxa de Cobertura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((assets.filter((a) => a.lastScan).length / assets.length) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Scaneados</p>
            </CardContent>
          </Card>
        </div>

        {/* Assets List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Ativos Registrados</h2>
          <div className="grid gap-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1 text-2xl">{getTypeIcon(asset.type)}</div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{asset.name}</CardTitle>
                        <CardDescription>
                          {asset.ipAddress && `IP: ${asset.ipAddress}`}
                          {asset.hostname && ` • ${asset.hostname}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCriticalityColor(asset.criticality)}>
                        {asset.criticality.toUpperCase()}
                      </Badge>
                      {asset.vulnerabilities > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <Shield className="h-3 w-3" />
                          {asset.vulnerabilities}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="text-sm font-semibold capitalize">{asset.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Último Scan</p>
                      <p className="text-sm font-semibold">{formatDate(asset.lastScan)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vulnerabilidades</p>
                      <p className="text-sm font-semibold">{asset.vulnerabilities}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteAsset(asset.id)}
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
        {assets.length === 0 && (
          <Card className="text-center py-12">
            <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum ativo registrado</h3>
            <p className="text-muted-foreground mb-4">
              Adicione ativos de TI para começar a monitorar vulnerabilidades
            </p>
            <Button>Registrar Novo Ativo</Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
