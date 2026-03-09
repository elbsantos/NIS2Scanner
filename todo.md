# NIS2 Compliance Scanner - TODO

## Fase 1: Arquitetura e Modelo de Dados
- [x] Definir schema do banco de dados (ativos, scans, vulnerabilidades, artigos NIS2)
- [x] Criar migrações SQL para tabelas principais
- [x] Documentar mapeamento de CVEs para artigos NIS2

## Fase 2: Backend - APIs e Integrações
- [x] Implementar integração com API NVD (NIST National Vulnerability Database)
- [x] Implementar integração com API Vulners
- [ ] Criar módulo de scan de rede (Nmap wrapper)
- [x] Implementar análise CVSS e mapeamento para NIS2
- [x] Criar endpoints tRPC para gestão de ativos
- [x] Criar endpoints tRPC para gestão de scans
- [x] Criar endpoints tRPC para geração de relatórios
- [x] Implementar cache de vulnerabilidades
- [ ] Implementar sistema de notificações (backend)

## Fase 3: Frontend - Dashboard e UI
- [x] Criar layout principal com navegação
- [x] Implementar dashboard de conformidade NIS2
- [x] Criar formulário de novo scan (SME/Supply mode)
- [x] Implementar visualização de resultados de scan
- [ ] Criar painel de gestão de ativos
- [ ] Implementar visualização de relatórios
- [ ] Criar painel de recomendações priorizadas
- [ ] Implementar sistema de notificações no frontend

## Fase 4: Relatórios e Recomendações
- [ ] Implementar geração de relatórios JSON
- [ ] Implementar geração de relatórios HTML
- [ ] Integrar IA para simplificar recomendações (PT-PT)
- [ ] Criar templates de recomendações por artigo NIS2
- [ ] Implementar export de relatórios

## Fase 5: Testes e Refinamento
- [x] Testes unitários do backend (risk-analyzer: 26 testes passando)
- [ ] Testes de integração de APIs
- [ ] Testes de UI/UX
- [ ] Validação de conformidade NIS2
- [ ] Otimização de performance
- [x] Refinamento de design e elegância visual

## Fase 6: Entrega
- [ ] Documentação final
- [ ] Checkpoint e publicação


## Fase 7: Integração Nmap - Scan de Rede Real
- [x] Instalar e configurar Nmap
- [x] Criar wrapper Nmap com suporte a SME e Supply Chain modes
- [x] Implementar executor de scans com fila de processamento
- [x] Integrar resultados Nmap com análise NVD/Vulners
- [x] Criar testes unitários para módulo de scan (12 testes passando)
- [ ] Validar scans reais em localhost
- [x] Commit para branch dev


## Fase 8: Correção de Bugs e Geração de Relatórios
- [x] Investigar e corrigir erro da página 2 (atualizou menu do sidebar)
- [x] Implementar backend de geração de relatórios (PDF/HTML/JSON)
- [x] Criar plano de ação com recomendações priorizadas
- [x] Implementar frontend de visualização de relatórios (página Reports)
- [x] Implementar página de Scans com gerenciamento
- [x] Implementar página de Ativos com inventário
- [x] Testar geração de relatórios (13 testes passando)
- [ ] Commit para branch dev


## Fase 9: Integração MITRE ATT&CK + ISO 27001 + NIS2
- [x] Implementar integração MITRE ATT&CK (técnicas, táticas, grupos)
- [x] Mapear CVEs para técnicas MITRE ATT&CK
- [x] Implementar mapper ISO 27001 (14 domínios, 93 controlos)
- [x] Mapear vulnerabilidades para controlos ISO 27001
- [x] Criar tabelas de banco de dados para mapeamentos
- [x] Implementar dashboard de conformidade integrado (3 abas)
- [x] Criar matriz de conformidade visual
- [x] Implementar gap analysis
- [x] Gerar relatórios executivos (C-Level)
- [x] Gerar relatórios técnicos detalhados
- [x] Criar testes unitários para mapeamentos (80 testes passando)
- [x] Testar e validar integração completa
- [ ] Commit para branch dev


## Fase 10: Geração de Relatórios Executivos em PDF
- [x] Implementar serviço de geração de PDF com gráficos
- [x] Criar template de relatório executivo (C-Level)
- [x] Criar template de relatório técnico detalhado
- [x] Implementar plano de ação com prazos e estimativas
- [x] Integrar tRPC mutations para download de relatórios
- [x] Criar testes unitários para geração de PDF (16 testes passando)
- [x] Testar e validar relatórios gerados
- [ ] Commit para branch dev
