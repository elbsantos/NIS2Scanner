import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  Shield,
  CheckCircle,
  TrendingUp,
  Zap,
  Lock,
  AlertTriangle,
  BarChart3,
  Users,
} from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-pulse">
          <Shield className="w-12 h-12 text-blue-400" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-lg">NIS2 Scanner</span>
          </div>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Entrar
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-sm text-blue-200">
              Conformidade NIS2 Simplificada
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Conformidade NIS2 para PMEs Portuguesas
            </h1>

            <p className="text-xl text-slate-300">
              Plataforma inteligente de scanning de segurança que identifica vulnerabilidades,
              mapeia conformidade NIS2 e gera recomendações práticas em português.
            </p>

            <div className="flex gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Shield className="w-5 h-5" />
                Começar Agora
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 hover:bg-slate-800"
              >
                Saber Mais
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur-2xl opacity-20"></div>
            <div className="relative bg-slate-800/50 border border-slate-700 rounded-lg p-8 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Scan de Rede Completo</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Análise de Vulnerabilidades</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Mapeamento NIS2 Automático</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Recomendações em PT-PT</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Relatórios Executivos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Funcionalidades Principais</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle>Dois Modos de Scan</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>
                Modo SME para scans rápidos ou Modo Supply Chain para análise completa de
                conformidade NIS2.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle>Análise de Risco CVSS</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>
                Avaliação automática de vulnerabilidades com scores CVSS e mapeamento para
                artigos NIS2.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle>Relatórios Detalhados</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>
                Geração automática de relatórios em JSON, HTML e PDF com recomendações
                práticas em português.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
              <CardTitle>Notificações em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>
                Alertas imediatos para vulnerabilidades críticas e violações de conformidade
                NIS2.
              </p>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <CardTitle>Dashboard de Conformidade</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>
                Visualização clara do estado de conformidade NIS2 com histórico de scans e
                tendências.
              </p>
            </CardContent>
          </Card>

          {/* Feature 6 */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-400" />
              </div>
              <CardTitle>Gestão de Ativos</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>
                Inventário centralizado de ativos com histórico de scans e recomendações
                priorizadas.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Como Funciona</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: 1, title: "Registar", desc: "Crie sua conta e configure sua organização" },
            { step: 2, title: "Configurar", desc: "Adicione seus ativos e defina parâmetros" },
            { step: 3, title: "Scanear", desc: "Inicie um scan SME ou Supply Chain" },
            { step: 4, title: "Analisar", desc: "Revise resultados e recomendações" },
          ].map((item) => (
            <div key={item.step} className="relative">
              {item.step < 4 && (
                <div className="absolute top-8 left-[60%] w-[40%] h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>
              )}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-slate-400 text-sm mt-2">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para Conformidade NIS2?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Comece agora mesmo com um scan gratuito e descubra o estado atual de conformidade
            da sua organização.
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Iniciar Scan Gratuito
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="font-bold">NIS2 Scanner</span>
              </div>
              <p className="text-slate-400 text-sm">
                Conformidade NIS2 simplificada para PMEs portuguesas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Documentação
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Termos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    RGPD
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2026 NIS2 Scanner. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
