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
- [ ] Instalar e configurar Nmap
- [ ] Criar wrapper Nmap com suporte a SME e Supply Chain modes
- [ ] Implementar executor de scans com fila de processamento
- [ ] Integrar resultados Nmap com análise NVD/Vulners
- [ ] Criar testes unitários para módulo de scan
- [ ] Validar scans reais em localhost
- [ ] Commit para branch dev
