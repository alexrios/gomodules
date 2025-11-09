---
description: Gerenciamento de dependências de ferramentas com a diretiva tool (Go 1.24+)
---

# Tool Dependencies

## Introdução

**Go 1.24** (fevereiro de 2025) introduziu a diretiva **`tool`** no `go.mod`, que finalmente resolve um problema antigo: **como gerenciar ferramentas de desenvolvimento** (linters, geradores de código, etc.) de forma padronizada.

{% hint style="success" %}
Antes do Go 1.24, desenvolvedores usavam hacks como `tools.go` com imports vazios. Agora há uma solução oficial e elegante!
{% endhint %}

## O problema antes do Go 1.24

### O Hack tools.go

Desenvolvedores criavam um arquivo especial para rastrear ferramentas:

```go
//go:build tools
// +build tools

package tools

import (
    _ "github.com/golangci/golangci-lint/cmd/golangci-lint"
    _ "golang.org/x/tools/cmd/goimports"
    _ "github.com/swaggo/swag/cmd/swag"
)
```

**Problemas com esta abordagem**:
- ❌ Confuso para novos desenvolvedores
- ❌ Build tags obscuros
- ❌ Ferramentas misturadas com dependências de runtime
- ❌ Não havia padrão oficial

## A solução: diretiva `tool`

### Sintaxe

```go
module github.com/usuario/projeto

go 1.25

// Ferramentas de desenvolvimento
tool (
    golang.org/x/tools/cmd/goimports
    github.com/golangci/golangci-lint/cmd/golangci-lint
    github.com/swaggo/swag/cmd/swag
)
```

### Como adicionar uma `tool`

```bash
# Adicionar uma ferramenta
go get -tool golang.org/x/tools/cmd/goimports@latest

# Adicionar múltiplas ferramentas
go get -tool \
    github.com/golangci/golangci-lint/cmd/golangci-lint@latest \
    github.com/swaggo/swag/cmd/swag@latest \
    golang.org/x/tools/cmd/stringer@latest

# Adicionar versão específica
go get -tool github.com/golangci/golangci-lint/cmd/golangci-lint@v1.55.0
```

### Como executar uma `tool```

```bash
# Executar ferramenta registrada
go tool goimports -w .
go tool golangci-lint run
go tool swag init

# Lista todas as ferramentas disponíveis
go tool
```

## Exemplo

### go.mod com `tool`

```go
module github.com/empresa/api

go 1.25

// Dependências de runtime
require (
    github.com/gin-gonic/gin v1.10.0
    gorm.io/gorm v1.25.7
)

// Ferramentas de desenvolvimento
tool (
    golang.org/x/tools/cmd/goimports
    github.com/golangci/golangci-lint/cmd/golangci-lint
    github.com/swaggo/swag/cmd/swag
    golang.org/x/tools/cmd/stringer
    github.com/google/wire/cmd/wire
)
```

### Setup de novo desenvolvedor

```bash
# 1. Clone o projeto
git clone github.com/empresa/api
cd api

# 2. Baixe dependências E ferramentas
go mod download

# 3. Instale ferramentas no GOBIN
go install tool

# 4. Pronto! Todas as ferramentas disponíveis
go tool goimports -w .
golangci-lint run  # Também disponível no PATH
```

## Comandos úteis

### Gerenciamento de ferramentas

```bash
# Adicionar ferramenta
go get -tool <package>@<version>

# Atualizar todas as ferramentas
go get -tool -u all

# Atualizar ferramenta específica
go get -tool <package>@latest

# Remover ferramenta
go get -tool <package>@none

# Listar ferramentas
go list -m -tool all
```

### Executar `tool`

```bash
# Via go tool (usa versão do go.mod)
go tool <nome> [args]

# Instalar no GOBIN
go install tool  # Instala todas
go install tool <package>  # Instala uma específica

# Executar diretamente (se instalada)
goimports -w .
```

## Vantagens da diretiva tool

| Aspecto | tools.go (antigo) | tool (Go 1.24+) |
|---------|-------------------|-----------------|
| **Clareza** | Obscuro | Explícito e oficial |
| **Separação** | Misturado com deps | Separado claramente |
| **Execução** | `go run` manual | `go tool` integrado |
| **Cache** | Não | Sim (builds mais rápidos) |
| **Padrão** | Hack não oficial | Suporte oficial |
| **IDEs** | Suporte limitado | Suporte nativo |

## Casos de uso comuns

### 1. Linters e Formatadores

```go
tool (
    github.com/golangci/golangci-lint/cmd/golangci-lint
    golang.org/x/tools/cmd/goimports
    mvdan.cc/gofumpt
)
```

```bash
# Executar linting
go tool golangci-lint run

# Formatar código
go tool goimports -w .
go tool gofumpt -l -w .
```

### 2. Geradores de código

```go
tool (
    github.com/google/wire/cmd/wire
    golang.org/x/tools/cmd/stringer
    github.com/swaggo/swag/cmd/swag
    google.golang.org/protobuf/cmd/protoc-gen-go
)
```

```bash
# Gerar código
go tool wire ./...
go tool stringer -type=Status
go tool swag init
```

### 3. Ferramentas de teste e cobertura

```go
tool (
    github.com/onsi/ginkgo/v2/ginkgo
    github.com/golang/mock/mockgen
    gotest.tools/gotestsum
)
```

```bash
# Executar testes
go tool gotestsum ./...
go tool ginkgo -r

# Gerar mocks
go tool mockgen -source=interface.go
```

## Cache de ferramentas

Go 1.24+ cacheia execuções de ferramentas no build cache:

```bash
# Primeira execução: lenta
go tool golangci-lint run
# Tempo: 5s

# Segunda execução: rápida (cache)
go tool golangci-lint run
# Tempo: 0.1s

# Limpar cache se necessário
go clean -cache
```

## Integração com CI/CD

### GitHub Actions

```yaml
name: CI
on: [push]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.25'

      # Ferramentas são baixadas automaticamente
      - run: go mod download

      # Executar linting
      - run: go tool golangci-lint run

      # Verificar formatação
      - run: |
          go tool goimports -l .
          test -z "$(go tool goimports -l .)"
```

### Makefile

```makefile
.PHONY: tools lint fmt test

# Instalar ferramentas
tools:
	go install tool

# Linting
lint:
	go tool golangci-lint run --timeout=5m

# Formatação
fmt:
	go tool goimports -w .
	go tool gofumpt -l -w .

# Gerar código
generate:
	go tool wire ./...
	go tool stringer -type=Status

# Executar tudo
all: tools fmt generate lint test
```

## Problema: Conflitos de dependências

### O Desafio

Ferramentas podem ter dependências conflitantes com seu projeto:

```
Seu projeto: require github.com/pkg/errors v0.9.1
Ferramenta:  require github.com/pkg/errors v0.8.0

❌ CONFLITO!
```

### Solução 1: Aceitar o conflito (simples)

```bash
# MVS escolhe a versão mais nova
# Geralmente funciona bem
go mod tidy
```

### Solução 2: go.mod separado (avançado)

```bash
# Criar tools/go.mod separado
mkdir tools
cd tools

cat > go.mod << 'EOF'
module tools
go 1.25

tool (
    github.com/golangci/golangci-lint/cmd/golangci-lint
)
EOF

go mod download

# Usar com -modfile
cd ..
go tool -modfile=tools/go.mod golangci-lint run
```

## Migrando de tools.go

### Antes (tools.go)

```go
//go:build tools

package tools

import (
    _ "golang.org/x/tools/cmd/goimports"
    _ "github.com/golangci/golangci-lint/cmd/golangci-lint"
)
```

### Depois (go.mod)

```go
// go.mod
tool (
    golang.org/x/tools/cmd/goimports
    github.com/golangci/golangci-lint/cmd/golangci-lint
)
```

### Passos de migração

```bash
# 1. Remover tools.go
rm tools.go

# 2. Adicionar ferramentas via go get -tool
go get -tool golang.org/x/tools/cmd/goimports@latest
go get -tool github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# 3. Limpar go.mod
go mod tidy

# 4. Testar
go tool goimports --help
go tool golangci-lint --version

# 5. Commit
git add go.mod go.sum
git rm tools.go
git commit -m "Migrate to tool directive (Go 1.24)"
```

## Melhores práticas

### ✅ Faça

- Use `tool` directive para todas as ferramentas de desenvolvimento
- Documente ferramentas necessárias no README
- Versione ferramentas (não use `@latest` em produção)
- Inclua `go install tool` no setup de novos desenvolvedores
- Use cache de ferramentas no CI para velocidade

### ❌ Evite

- Misturar ferramentas com dependências de runtime manualmente
- Manter `tools.go` em projetos Go 1.24+
- Usar `go run` para ferramentas (use `go tool`)
- Ignorar conflitos de dependências sem investigar

## Troubleshooting

### Erro: "unknown command"

```bash
# Ferramenta não encontrada
$ go tool goimports
go: unknown tool goimports

# Solução: Adicionar ao go.mod
go get -tool golang.org/x/tools/cmd/goimports@latest
```

### Erro: Versão conflitante

```bash
# Resolver conflito
go get -tool <package>@<versão-compatível>
go mod tidy

# Ou usar go.mod separado
```

### Cache não funciona

```bash
# Limpar e reconstruir cache
go clean -cache
go tool <ferramenta> # Reconstrói cache
```

## Recursos adicionais

- [Go 1.24 Release Notes](https://tip.golang.org/doc/go1.24)
- [Proposal: Tool Dependencies](https://go.googlesource.com/proposal/+/54d6775ff71ccbc00c276db2a4e4841d67011cf4/design/48429-go-tool-modules.md)
- [Blog: How to Use the New tool Directive](https://www.bytesizego.com/blog/go-124-tool-directive)
- [Alex Edwards: Managing Tool Dependencies in Go 1.24+](https://www.alexedwards.net/blog/how-to-manage-tool-dependencies-in-go-1.24-plus)

## Conclusão

A diretiva `tool` do Go 1.24 é uma adição **extremamente bem-vinda**:

- 🎯 **Padroniza** gerenciamento de ferramentas
- 🚀 **Simplifica** setup de novos desenvolvedores
- ⚡ **Melhora** performance com caching
- 📦 **Organiza** dependências claramente

{% hint style="success" %}
**Migre seus projetos!** Substitua `tools.go` pela diretiva `tool` para aproveitar todos os benefícios do Go 1.24+.
{% endhint %}
