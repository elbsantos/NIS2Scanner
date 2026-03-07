import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Shield, Network, Zap } from "lucide-react";

export default function NewScan() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [scanName, setScanName] = useState("");
  const [mode, setMode] = useState<"sme" | "supply">("sme");
  const [scanType, setScanType] = useState<"network" | "web" | "supply_chain">("network");
  const [targetRange, setTargetRange] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createScan = trpc.scans.create.useMutation({
    onSuccess: (result) => {
      toast.success("Scan criado com sucesso!");
      navigate(`/scans/${result[0]?.insertId || 1}`);
    },
    onError: (error) => {
      toast.error(`Erro ao criar scan: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scanName.trim()) {
      toast.error("Por favor, insira um nome para o scan");
      return;
    }

    if (!targetRange.trim()) {
      toast.error("Por favor, insira o intervalo de destino (IP ou rede)");
      return;
    }

    setIsSubmitting(true);
    try {
      await createScan.mutateAsync({
        scanName,
        mode,
        scanType,
        targetRange,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Novo Scan de Conformidade</h1>
          <p className="text-muted-foreground mt-2">
            Configure e inicie um novo scan de segurança para sua organização
          </p>
        </div>

        {/* Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione o Modo de Scan</CardTitle>
            <CardDescription>
              Escolha entre um scan básico (SME) ou completo (Supply Chain)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={mode} onValueChange={(value) => setMode(value as "sme" | "supply")}>
              <div className="space-y-4">
                {/* SME Mode */}
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="sme" id="sme-mode" className="mt-1" />
                  <label htmlFor="sme-mode" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">Modo SME (Básico)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scan rápido e leve focado em portas comuns (22, 80, 443, 445, 3389) e
                      vulnerabilidades críticas. Ideal para PMEs com recursos limitados.
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc">
                      <li>Tempo de scan: 5-15 minutos</li>
                      <li>Portas: Comuns apenas</li>
                      <li>Análise: Rápida e focada</li>
                    </ul>
                  </label>
                </div>

                {/* Supply Mode */}
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="supply" id="supply-mode" className="mt-1" />
                  <label htmlFor="supply-mode" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Network className="w-5 h-5 text-green-600" />
                      <span className="font-semibold">Modo Supply Chain (Completo)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scan completo e profundo com análise de cadeia de fornecimento, todas as
                      portas e verificações avançadas. Para conformidade NIS2 completa.
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc">
                      <li>Tempo de scan: 30-60 minutos</li>
                      <li>Portas: Todas (1-65535)</li>
                      <li>Análise: Completa e detalhada</li>
                      <li>Supply chain: Análise de dependências</li>
                    </ul>
                  </label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Scan Details Form */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Scan</CardTitle>
            <CardDescription>Configure os parâmetros do scan</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Scan Name */}
              <div className="space-y-2">
                <Label htmlFor="scanName">Nome do Scan</Label>
                <Input
                  id="scanName"
                  placeholder="ex: Scan de Conformidade NIS2 - Março 2026"
                  value={scanName}
                  onChange={(e) => setScanName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Scan Type */}
              <div className="space-y-2">
                <Label>Tipo de Scan</Label>
                <RadioGroup value={scanType} onValueChange={(value) => setScanType(value as any)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="network" id="network-type" />
                    <Label htmlFor="network-type" className="font-normal cursor-pointer">
                      Scan de Rede
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="web" id="web-type" />
                    <Label htmlFor="web-type" className="font-normal cursor-pointer">
                      Scan Web
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="supply_chain" id="supply-type" />
                    <Label htmlFor="supply-type" className="font-normal cursor-pointer">
                      Análise de Cadeia de Fornecimento
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Target Range */}
              <div className="space-y-2">
                <Label htmlFor="targetRange">Intervalo de Destino</Label>
                <Input
                  id="targetRange"
                  placeholder="ex: 192.168.1.0/24 ou 192.168.1.1 ou example.com"
                  value={targetRange}
                  onChange={(e) => setTargetRange(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Pode ser um IP único, intervalo CIDR ou nome de domínio
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando Scan...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Iniciar Scan
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>
              • Os scans podem levar algum tempo dependendo do tamanho da rede e modo selecionado
            </p>
            <p>
              • Certifique-se de ter permissão para fazer scan na rede especificada
            </p>
            <p>
              • Os resultados serão armazenados e poderão ser consultados posteriormente
            </p>
            <p>
              • Todos os dados são processados em conformidade com a RGPD e NIS2
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
