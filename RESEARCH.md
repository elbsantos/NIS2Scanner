# Pesquisa: APIs de Vulnerabilidades e Ferramentas de Integração

## 1. NVD (National Vulnerability Database) - NIST

### Informações Gerais
- **Base URL**: `https://services.nvd.nist.gov/rest/json/cves/2.0`
- **Tipo**: API REST pública com autenticação por API Key (recomendado)
- **Registos**: 336.589+ CVEs
- **Documentação**: https://nvd.nist.gov/developers/vulnerabilities

### Endpoints Principais
- **CVE API**: Recuperar informações de um ou múltiplos CVEs
- **CVE Change History API**: Monitorar mudanças em CVEs
- **Paginação**: Offset-based com `startIndex` e `resultsPerPage`

### Autenticação
- API Key gratuita disponível em: https://nvd.nist.gov/developers/request-an-api-key
- Requer informações da organização e email válido

### Limites
- Sem API Key: 5 requisições por 30 segundos
- Com API Key: 50 requisições por 30 segundos

### Vantagens
- Dados oficiais do NIST
- Cobertura completa de CVEs
- Informações estruturadas (CVSS, CWE, etc.)

---

## 2. Vulners API

### Informações Gerais
- **Base URL**: `https://vulners.com/api/v3/`
- **Tipo**: API REST comercial com autenticação por API Key
- **Documentação**: https://docs.vulners.com/docs/

### Funcionalidades Principais
- **Search**: Busca full-text em advisories, CVEs e metadados de pacotes
- **Audit**: Scan de hosts/imagens contra pacotes instalados
- **Collections**: Conjuntos curados de vulnerabilidades
- **Alerts**: Notificações de novas vulnerabilidades

### Endpoints Principais
- `POST /api/v3/search/lucene/` - Busca Lucene-style
- `POST /api/v3/audit/` - Audit de hosts
- `POST /api/v3/collections/` - Gestão de coleções

### Autenticação
- API Key obtida em https://vulners.com
- Header: `X-Api-Key: YOUR_API_KEY`

### Vantagens
- Busca avançada com query language
- Informações de exploits e advisories
- Audit automatizado de hosts
- Integrações prontas (Nmap plugin, Ansible, etc.)

### Limitações
- Serviço comercial (pode ter custos)
- Requer API Key

---

## 3. Python Libraries para Integração

### nvdlib
- **PyPI**: https://pypi.org/project/nvdlib/
- **Uso**: Wrapper Python para NVD API
- **Instalação**: `pip install nvdlib`
- **Exemplo**:
  ```python
  import nvdlib
  cves = nvdlib.searchCVE(keywordSearch="Windows", limit=10)
  ```

### vulners
- **PyPI**: https://pypi.org/project/vulners/
- **GitHub**: https://github.com/vulnersCom/api
- **Uso**: SDK Python oficial para Vulners
- **Instalação**: `pip install vulners`
- **Exemplo**:
  ```python
  import vulners
  vulners_api = vulners.Vulners(api_key='YOUR_KEY')
  results = vulners_api.search('Fortinet AND RCE', limit=5)
  ```

### python-nmap
- **PyPI**: https://pypi.org/project/python-nmap/
- **Uso**: Wrapper Python para Nmap
- **Instalação**: `pip install python-nmap`
- **Exemplo**:
  ```python
  import nmap
  nm = nmap.PortScanner()
  nm.scan('192.168.1.1', '22-443')
  ```

---

## 4. Ferramentas Open Source Complementares

### OpenVAS
- Scanner de vulnerabilidades open source
- Suporta autenticação remota
- Integração via API REST

### OWASP ZAP
- Ferramenta de teste de segurança web
- API REST disponível
- Foco em vulnerabilidades web

### Nuclei
- Scanner de templates para vulnerabilidades específicas
- Comunidade ativa de templates
- CLI e API

### CVE-Bin-Tool (OSSF)
- Ferramenta gratuita e open source
- Identifica CVEs em software
- Integração com NVD

---

## 5. Mapeamento NIS2 para CVEs

### Artigos Relevantes da Diretiva NIS2
- **Artigo 21**: Segurança de redes e sistemas de informação
- **Artigo 28**: Obrigações de fornecedores de serviços essenciais
- **Artigo 29**: Conformidade com medidas de segurança

### Estratégia de Mapeamento
1. Classificar CVEs por CVSS score
2. Mapear para categorias NIS2 (autenticação, criptografia, etc.)
3. Associar a artigos específicos da diretiva
4. Gerar recomendações contextualizadas

---

## 6. Arquitetura Proposta para Integração

### Backend
- **Camada de Integração**: Wrappers para NVD e Vulners
- **Cache**: SQLite/Redis para armazenar CVEs localmente
- **Processamento**: Análise CVSS e mapeamento NIS2
- **APIs tRPC**: Endpoints para frontend

### Frontend
- **Dashboard**: Visualização de conformidade NIS2
- **Scan Manager**: Interface para SME/Supply modes
- **Relatórios**: Geração e export de relatórios

### Fluxo de Dados
1. Usuário inicia scan (SME ou Supply mode)
2. Backend executa Nmap scan
3. Resultados enriquecidos com NVD/Vulners
4. Análise CVSS e mapeamento NIS2
5. Geração de relatórios e recomendações
6. Armazenamento em banco de dados

---

## 7. Próximos Passos

1. Obter API Keys (NVD e Vulners)
2. Implementar wrappers de integração
3. Criar schema de banco de dados
4. Desenvolver endpoints tRPC
5. Implementar frontend
