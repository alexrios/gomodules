---
title: "Module Retraction"
description: Como retrair versões problemáticas de módulos usando a diretiva retract (Go 1.16+)
slug: "avancado/module-retraction"
---

## O que é Module Retraction?

**Module Retraction** (Retração de Módulo) é um mecanismo introduzido no **Go 1.16** que permite aos autores de módulos **marcar versões como não recomendadas** sem removê-las do repositório.

:::note
Retraction é útil quando você publica acidentalmente uma versão com problemas sérios, mas não pode deletá-la (pois isso quebraria builds de quem já depende dela).
:::

## Quando Usar Retraction?

Use retraction quando:

- ✅ Publicou uma versão **por acidente** (ex: tag errada)
- ✅ Descobriu **bug crítico** ou **falha de segurança** após publicação
- ✅ Versão está **quebrada** em certas plataformas
- ✅ Versão contém **código não finalizado** que foi taggeado prematuramente
- ✅ Precisa **desencorajar** uso de uma versão específica

Para depreciar um módulo inteiro, use um comentário `// Deprecated:` junto da diretiva `module` no `go.mod` e publique uma nova versão. Um aviso no README pode complementar essa indicação.

## Sintaxe da diretiva 'retract'

### Retrair uma única versão

```go
module github.com/usuario/biblioteca

go 1.25

// Retrair uma versão específica
retract v1.2.0 // Bug crítico no sistema de autenticação
```

### Retrair um intervalo de versões

```go
// Retrair múltiplas versões em um intervalo
retract [v1.0.0, v1.0.5] // Builds quebradas em macOS
```

### Múltiplas retrações

```go
module github.com/usuario/biblioteca

go 1.25

retract (
    v1.0.0 // Publicado acidentalmente
    v1.1.0 // Falha de segurança crítica - use v1.1.1+
    [v1.2.0, v1.2.3] // Incompatível com Go 1.18
    v1.4.0 // Tag prematura, versão ainda não está pronta
)
```

## Como funciona?

### 1. Autor retrai a versão

```bash
# 1. Editar go.mod para adicionar retraction
cat >> go.mod << 'EOF'

retract v1.5.0 // Bug crítico - use v1.5.1+
EOF

# 2. Commitar e criar nova versão
git add go.mod
git commit -m "Retract v1.5.0 due to critical bug"
git tag v1.5.1
git push origin v1.5.1
```

### 2. Usuários são alertados

```bash
# Ao tentar usar versão retraída:
$ go get github.com/usuario/biblioteca@v1.5.0
go: warning: github.com/usuario/biblioteca@v1.5.0: retracted by module author
    Bug crítico - use v1.5.1+
go: downloading github.com/usuario/biblioteca v1.5.0
```

### 3. Comandos go evitam versões retraídas

```bash
# go get NÃO seleciona versões retraídas automaticamente
$ go get github.com/usuario/biblioteca@latest
# Pula v1.5.0 (retraída) e instala v1.5.1

# go list mostra avisos
$ go list -m -u all
github.com/usuario/biblioteca v1.5.0 (retracted) [v1.5.1]
```

## Exemplos práticos

### Exemplo 1: Versão publicada acidentalmente

```go
// Situação: Você publicou v1.4.0 por engano
// Solução:

module github.com/empresa/api

go 1.27.0

retract (
    v1.4.0 // Tag acidental
    v1.4.1 // Contém apenas retraction
)

// Publique v1.4.1 com esta mudança
// @latest volta a selecionar v1.3.0, se essa for a maior versão restante
```

Cada caminho de módulo tem suas próprias retrações. Para versões v2, o caminho precisa terminar em `/v2`; uma retração publicada nesse módulo não altera a seleção de versões v1.

### Exemplo 2: Bug crítico de segurança

```go
// Descoberto CVE na v1.3.0

retract v1.3.0 // CVE-2024-XXXX: SQL Injection - use v1.3.1+

// Tag v1.3.1 com correção + retraction
// Usuários verão aviso ao tentar usar v1.3.0
```

### Exemplo 3: Incompatibilidade de plataforma

```go
retract [v1.8.0, v1.8.3] // Builds quebradas em Windows ARM64 - corrigido em v1.8.4
```

### Exemplo 4: Retrair a própria versão de retração

```go
// v1.0.0 foi publicada com problemas
// v1.0.1 contém APENAS retraction (sem código novo)

retract (
    v1.0.0 // Código quebrado
    v1.0.1 // Versão de retraction apenas, use v1.1.0+
)

// Tag v1.0.1 com apenas esta mudança
// Tag v1.1.0 com código corrigido
```

## Visualizando retrações

### Listar versões com retrações

```bash
# Ver todas as versões, incluindo retraídas
$ go list -m -versions -retracted github.com/usuario/biblioteca
github.com/usuario/biblioteca v1.0.0 v1.1.0 v1.2.0 v1.3.0

# Ver versões com informação de retraction
$ go list -m -retracted github.com/usuario/biblioteca@v1.2.0
github.com/usuario/biblioteca v1.2.0 (retracted)
```

### Ver motivo da retração

```bash
# Mostrar comentário de retraction
$ go list -m -retracted -json github.com/usuario/biblioteca@v1.2.0
{
    "Path": "github.com/usuario/biblioteca",
    "Version": "v1.2.0",
    "Retracted": [
        "Bug crítico no sistema de cache"
    ]
}
```

### Verificar dependências retraídas

```bash
# Ver se você está usando versões retraídas
$ go list -m -u all
github.com/usuario/biblioteca v1.2.0 (retracted) [v1.3.0]
                                ↑
                        Você está usando versão retraída!

# Atualizar para versão não retraída
$ go get github.com/usuario/biblioteca@v1.3.0
```

## Comportamento dos comandos

| Comando | Comportamento com Versões Retraídas |
|---------|-------------------------------------|
| `go get <module>@latest` | **Pula** versões retraídas |
| `go get <module>@v1.2.0` | **Permite** mas mostra aviso |
| `go get -u` | **Atualiza** para versão não retraída |
| `go list -m -u all` | **Mostra** quais deps são retraídas |
| `go mod tidy` | **Mantém** versão atual, mesmo se retraída |
| `go install <module>@latest` | **Pula** versões retraídas |

## Diferença: retraction vs deprecation

| Aspecto | Retraction | Deprecation |
|---------|-----------|-------------|
| **Escopo** | Versões específicas | Módulo inteiro ou pacote |
| **Mecanismo** | Diretiva `retract` no go.mod | Comentário `Deprecated:` no go.mod ou na documentação de pacote |
| **Detecção** | Avisos e consultas do comando go | Avisos do comando go para módulos; documentação para pacotes |
| **Ação** | Versões evitadas automaticamente | Desenvolvedores decidem migrar |
| **Desde** | Go 1.16 | Go 1.17 para avisos de módulos |

### Exemplo de deprecation

Para um módulo inteiro, no `go.mod`:

```go
// Deprecated: Use github.com/usuario/newapi.
module github.com/usuario/oldapi
```

Para um pacote, na documentação do código:

```go
// Package oldapi fornece APIs legadas.
//
// Deprecated: Use github.com/usuario/newapi ao invés.
// Este pacote será removido em v2.0.0.
package oldapi
```

## Workflow de retraction

### Passo a passo completo

```bash
# 1. Identificar versão problemática
echo "v1.5.0 tem bug crítico"

# 2. Corrigir o código
git checkout -b hotfix/v1.5.1
# ... fazer correções ...
git add .
git commit -m "Fix critical bug from v1.5.0"

# 3. Adicionar retraction ao go.mod
cat >> go.mod << 'EOF'

retract v1.5.0 // Critical bug in auth system - use v1.5.1+
EOF
git add go.mod
git commit -m "Retract v1.5.0"

# 4. Criar nova versão
git tag v1.5.1
git push origin v1.5.1

# 5. Notificar usuários (opcional mas recomendado)
# - Release notes no GitHub
# - Blog post
# - Security advisory se aplicável
```

## Retraction em 'go.sum'

Uma retração não remove automaticamente os hashes de uma versão do `go.sum`:

```
github.com/usuario/biblioteca v1.5.0 h1:abc...
github.com/usuario/biblioteca v1.5.0/go.mod h1:xyz...
github.com/usuario/biblioteca v1.5.1 h1:def...
github.com/usuario/biblioteca v1.5.1/go.mod h1:uvw...
```

Builds que ainda selecionam a versão retraída continuam funcionando. Quando os hashes deixam de ser necessários, `go mod tidy` pode removê-los; a presença de uma entrada em `go.sum` não seleciona aquela versão.

## Limitações

### O que retraction NÃO Faz

❌ **Não remove** a versão do repositório git
❌ **Não remove** a versão do module proxy
❌ **Não força** atualização automática
❌ **Não impede** uso se explicitamente solicitado (`@v1.5.0`)
❌ **Não funciona** com Go <1.16

### O que retraction FAZ

✅ **Mostra avisos** ao tentar usar
✅ **Evita seleção** automática em `go get @latest`
✅ **Documenta** problemas conhecidos
✅ **Guia** desenvolvedores para versões corretas

## Melhores práticas

### ✅ Faça

- **Sempre** inclua comentário explicativo na retraction
- **Seja específico** sobre o problema e solução
- **Publique** versão corrigida junto com retraction
- **Documente** retraction em release notes
- **Comunique** proativamente usuários conhecidos
- **Use** para problemas sérios, não pequenos bugs

### ❌ Não Faça

- Retrair versões **sem publicar correção**
- Usar retraction para **forçar upgrades**
- Retrair **sem explicação** clara
- Retrair **frequentemente** (sugere processo de release ruim)
- Confiar **apenas** em retraction para segurança (emita CVE também)

## Integração com ferramentas

### GitHub/GitLab

Retraction funciona perfeitamente com:
- ✅ Git tags
- ✅ GitHub Releases
- ✅ GitLab Releases
- ✅ Security Advisories

### Proxies de módulos

- ✅ proxy.golang.org respeita retractions
- ✅ Proxies customizados (Athens, etc.) suportam
- ✅ Caches privados mantêm versões retraídas

### IDEs

- ✅ VS Code (com gopls) mostra avisos
- ✅ GoLand destaca versões retraídas
- ✅ Ferramentas de linting detectam uso

## Troubleshooting

### Problema: Usuários ainda usando versão retraída

```bash
# Versões retraídas não são removidas automaticamente
# Usuários precisam atualizar manualmente

# Verificar quem está usando
$ go list -m -u all | grep retracted

# Atualizar
$ go get -u github.com/usuario/biblioteca
$ go mod tidy
```

### Problema: Retraction não aparece

```bash
# O Go lê as retrações do go.mod da maior versão publicada
# (preferindo releases a pré-releases), antes de aplicar as retrações.
# Publique uma nova versão com as diretivas; ela também pode retrair a si mesma.

# Verificar se retraction foi publicada
$ go list -m -retracted github.com/usuario/biblioteca@v1.5.0
```

### Problema: Como "desretrair" uma versão

```bash
# Editar go.mod removendo a diretiva retract
# Tag nova versão
# Não há como "desfazer" retraction sem nova release
```

## Recursos adicionais

- [Go Modules Reference: Retract Directive](https://go.dev/ref/mod#go-mod-file-retract)
- [Go Blog: Module Retraction](https://go.dev/blog/go116-module-changes)
- [Go 1.16 Release Notes](https://go.dev/doc/go1.16#modules)
- [Tutorial: Play with Go - Retract Module Versions](https://play-with-go.dev/retract-module-versions_go119_en/)

## Conclusão

Module Retraction é uma ferramenta essencial para manter a qualidade do ecossistema Go:

- 🛡️ **Protege** usuários de versões problemáticas
- 📢 **Comunica** problemas automaticamente
- 🔄 **Mantém** compatibilidade (não quebra builds)
- ✨ **Guia** para versões corretas

:::tip
Não tenha medo de retrair versões problemáticas! É melhor documentar e guiar usuários do que deixá-los descobrir problemas sozinhos.
:::
