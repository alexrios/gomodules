---
description: Gerenciamento automático de toolchains do Go desde a versão 1.21
---

# Gerenciamento de Toolchains

## Introdução

**Go 1.21** (agosto de 2023) introduziu um sistema revolucionário de gerenciamento de toolchains que permite:

1. **Download automático** de versões do Go conforme necessário
2. **Seleção inteligente** da versão correta para cada projeto
3. **Compatibilidade futura** garantida para projetos

{% hint style="success" %}
Antes do Go 1.21, você precisava instalar manualmente cada versão do Go. Agora, o Go baixa e usa a versão correta automaticamente!
{% endhint %}

## O que é um Toolchain?

Um **toolchain** do Go consiste em:

- Compilador (`go build`)
- Montador (assembler)
- Linker
- Biblioteca padrão (`fmt`, `net/http`, etc.)
- Ferramentas (`go fmt`, `go vet`, etc.)

Desde Go 1.21, o comando `go` pode usar:
- Seu toolchain **empacotado** (bundled)
- Toolchains encontrados no **PATH**
- Toolchains **baixados automaticamente** conforme necessário

## Numeração de versões

Go usa um esquema de versionamento estruturado:

| Tipo | Formato | Exemplo |
|------|---------|---------|
| **Release** | `1.N.P` | `1.25.0` |
| **Release Candidate** | `1.Nrc.R` | `1.25rc1` |
| **Família de linguagem** | `1.N` | `1.25` |

**Ordem de versões**: `1.25 < 1.25rc1 < 1.25rc2 < 1.25.0 < 1.25.1`

## Diretivas no go.mod

### Diretiva `go`

Declara a **versão mínima** do Go necessária:

```go
module github.com/usuario/projeto

go 1.25
```

**Comportamento**:
- Toolchains **mais antigos** que `1.25` se recusarão a carregar este módulo
- Toolchains **mais novos** podem usar este módulo normalmente
- Ativa features de linguagem da versão especificada

### Diretiva `toolchain`

Especifica um **toolchain preferido**:

```go
module github.com/usuario/projeto

go 1.25
toolchain go1.25.3
```

**Comportamento**:
- Se o toolchain atual for **mais antigo** que `go1.25.3`, faz upgrade automaticamente
- Se o toolchain atual for **mais novo**, usa o atual (não faz downgrade)

{% hint style="info" %}
Se você especifica apenas `go 1.25.0` sem `toolchain`, é implicitamente equivalente a `toolchain go1.25.0`.
{% endhint %}

## Variável de ambiente GOTOOLCHAIN

Controla **como** os toolchains são selecionados:

### GOTOOLCHAIN=auto (padrão)

```bash
# Seleção automática inteligente
GOTOOLCHAIN=auto  # ou apenas não definir
```

**Comportamento**:
- Usa o toolchain empacotado (local) como padrão
- **Faz upgrade** automaticamente se `go.mod` ou `go.work` requer versão mais nova
- Baixa toolchains sob demanda

### GOTOOLCHAIN=local

```bash
# Sempre usa o toolchain instalado
GOTOOLCHAIN=local go build
```

**Comportamento**:
- **Sempre** usa o toolchain empacotado
- **Nunca** baixa outras versões
- **Falha** se o projeto requer versão mais nova

### GOTOOLCHAIN=<name>

```bash
# Força uma versão específica
GOTOOLCHAIN=go1.25.0 go test
```

**Comportamento**:
- Usa **exclusivamente** a versão especificada
- Procura `go1.25.0` no PATH primeiro
- Baixa se não encontrar
- **Ignora** diretivas `toolchain` no go.mod

### GOTOOLCHAIN=<name>+auto

```bash
# Versão mínima com upgrade automático
GOTOOLCHAIN=go1.25.0+auto
```

**Comportamento**:
- Usa `go1.25.0` como **mínimo**
- Permite **upgrade** se projeto requer versão mais nova

### GOTOOLCHAIN=<name>+path

```bash
# Versão mínima apenas do PATH
GOTOOLCHAIN=go1.25.0+path
```

**Comportamento**:
- Usa `go1.25.0` como mínimo
- Permite upgrade **apenas** de versões encontradas no PATH
- **Nunca** baixa toolchains

## Como a seleção automática dunciona

### Fluxo de decisão

```
1. Comando executado (ex: go build)
2. ↓
3. Go lê go.work ou go.mod
4. ↓
5. Compara versões:
   - go line: versão mínima do Go
   - toolchain line: toolchain preferido
6. ↓
7. Versão requerida > versão atual?
   ├─ NÃO → Usa toolchain atual
   └─ SIM → Procede para seleção
8. ↓
9. Procura toolchain necessário:
   ├─ 1º: Procura no PATH (ex: go1.25.3)
   ├─ 2º: Baixa de golang.org/dl
   └─ 3º: Armazena em cache
10. ↓
11. Executa comando com toolchain correto
```

### Exemplo prático

```bash
# Você tem Go 1.24.0 instalado
$ go version
go version go1.24.0 linux/amd64

# Seu projeto requer Go 1.25
$ cat go.mod
module github.com/usuario/app
go 1.25

# Ao executar go build:
$ go build
go: downloading go1.25.0 (linux/amd64)
# ... build usa Go 1.25.0 automaticamente
```

## Downloads automáticos

### Como funciona

Toolchains são baixados como **módulos** especiais:

- **Caminho do módulo**: `golang.org/toolchain`
- **Versionamento**: `v0.0.1-go1.25.0.linux-amd64`
- **Respeitam GOPROXY**: Podem ser servidos via proxy corporativo

### Localização do cache

```bash
# Toolchains são armazenados em:
$GOPATH/pkg/mod/golang.org/toolchain@<versão>

# Exemplo:
~/.local/share/go/pkg/mod/golang.org/toolchain@v0.0.1-go1.25.0.linux-amd64/

# Listar toolchains baixados:
ls $GOPATH/pkg/mod/golang.org/toolchain@*
```

### Desabilitar downloads

```bash
# Opção 1: Usar GOTOOLCHAIN=local
export GOTOOLCHAIN=local

# Opção 2: Bloquear no GOPROXY
export GOPROXY=proxy.golang.org,direct|golang.org/toolchain=off

# Opção 3: CI/CD - use versão específica
export GOTOOLCHAIN=go1.25.0
```

## Comandos de gerenciamento

### Atualizar versões do Go

```bash
# Atualizar para última versão estável
go get go@latest

# Atualizar para versão específica
go get go@1.25.1

# Atualizar para release candidate
go get go@1.26rc1

# Ver versão atual no go.mod
go mod edit -json | jq .Go
```

### Atualizar toolchain

```bash
# Definir toolchain específico
go get toolchain@go1.25.3

# Atualizar para toolchain mais recente
go get toolchain@latest

# Remover diretiva toolchain (usar apenas go line)
go get toolchain@none
```

### Gerenciar workspace

```bash
# Sincronizar go.work com módulos
go work use -r .

# Remover diretiva toolchain do workspace
go work edit -toolchain=none

# Atualizar Go no workspace
go work edit -go=1.25
```

## Estratégia de seleção de versões

### Minimal Version Selection (MVS)

O Go aplica **MVS** (Seleção de Versão Mínima) para toolchains também:

```
Módulo A requer: go 1.24rc1
Módulo B requer: go 1.25.1
Módulo C requer: go 1.25.3

Toolchains disponíveis:
- go1.27.9
- go1.28.3
- go1.29rc2

SELECIONADO: go1.27.9
↑ Versão MAIS ANTIGA que satisfaz TODOS os requisitos
```

### Por que MVS para Toolchains?

- ✅ **Consistência** com seleção de módulos
- ✅ **Estabilidade** (evita versões experimentais)
- ✅ **Previsibilidade** (sempre o mesmo resultado)

## Casos de uso práticos

### Caso 1: Testar com Release Candidate

```bash
# Testar seu código com Go 1.26rc1
GOTOOLCHAIN=go1.26rc1 go test ./...

# Ou temporariamente no go.mod
go get toolchain@go1.26rc1
go test ./...
go get toolchain@none  # Remover depois
```

### Caso 2: CI/CD com versão fixa

```yaml
# .github/workflows/test.yml
name: Test
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.25'

      # Garantir que usa EXATAMENTE essa versão
      - run: export GOTOOLCHAIN=local
      - run: go test ./...
```

### Caso 3: Desenvolvimento multi-versão

```bash
# Instalar múltiplas versões via go install
go install golang.org/dl/go1.24.0@latest
go install golang.org/dl/go1.25.0@latest

# Baixar as versões
go1.24.0 download
go1.25.0 download

# Usar versões específicas
go1.24.0 build ./...
go1.25.0 test ./...

# Agora estão disponíveis no PATH!
```

### Caso 4: Monorepo com diferentes versões

```bash
# Estrutura:
monorepo/
├── go.work
├── legacy-service/    # Requer go 1.23
│   └── go.mod → go 1.23
├── new-service/       # Requer go 1.25
│   └── go.mod → go 1.25
└── experimental/      # Requer go 1.26rc1
    └── go.mod → go 1.26rc1

# go.work
go 1.25  # Mínimo para o workspace

# Cada módulo usa seu próprio toolchain automaticamente!
cd legacy-service && go build    # Usa go 1.23
cd ../new-service && go build    # Usa go 1.25
cd ../experimental && go build   # Usa go 1.26rc1
```

## Compatibilidade retroativa

### Go 1.21 Tornou a linha `go` obrigatória

Antes de Go 1.21, a linha `go` era **consultiva**. Desde Go 1.21:

- ✅ Go 1.21+ **recusa** carregar módulos que requerem versão mais nova
- ✅ Parcialmente retroportado para Go 1.19.13+ e Go 1.20.8+

```bash
# Go 1.20.0 (antigo)
$ go version
go version go1.20.0 linux/amd64

$ cat go.mod
go 1.22

$ go build
# ⚠️ Aviso, mas compila

# Go 1.20.8+ (com backport)
$ go version
go version go1.20.8 linux/amd64

$ cat go.mod
go 1.22

$ go build
# ❌ ERRO: go.mod requer Go 1.22
```

## Troubleshooting

### Erro: "toolchain not available"

```bash
# Causa: GOTOOLCHAIN=local mas projeto requer versão mais nova

# Solução 1: Permitir downloads automáticos
export GOTOOLCHAIN=auto
go build

# Solução 2: Instalar a versão necessária
go install golang.org/dl/go1.25.0@latest
go1.25.0 download

# Solução 3: Atualizar seu Go
# Baixe de https://go.dev/dl/
```

### Download de toolchain falha

```bash
# Verificar conectividade
curl -I https://dl.google.com/go/

# Verificar GOPROXY
echo $GOPROXY

# Usar proxy direto temporariamente
GOPROXY=direct go build

# Configurar proxy corporativo
export GOPROXY=https://proxy.empresa.com,direct
```

### Builds inconsistentes entre desenvolvedores

```bash
# Problema: Desenvolvedores usando versões diferentes

# Solução: Especificar toolchain exato no go.mod
go get toolchain@go1.25.3

# Agora todos usarão exatamente go1.25.3
git add go.mod
git commit -m "Pin toolchain to go1.25.3"
```

## Melhores práticas

### ✅ Recomendado

- Especifique `toolchain` em projetos críticos para builds reproduzíveis
- Use `GOTOOLCHAIN=local` em CI/CD para builds determinísticos
- Documente requisitos de versão no README
- Teste com release candidates antes de releases oficiais

### ❌ Evite

- Commitar `GOTOOLCHAIN` em variáveis de ambiente (use go.mod)
- Depender de "latest" em produção
- Misturar versões antigas (<1.21) com novas (≥1.21) sem entender comportamento
- Bloquear downloads sem configurar alternativa (PATH ou proxy)

## Impacto em ferramentas

### IDEs e Editores

- **VS Code**: Respeita `go.mod` automaticamente
- **GoLand**: Detecta e usa toolchain especificado
- **Vim/Neovim (com gopls)**: gopls usa toolchain correto

### Ferramentas de Build

- **Docker**: Especifique versão exata na imagem base
- **Bazel**: Configure toolchain via `go_register_toolchains`
- **Make**: Export `GOTOOLCHAIN` no Makefile

## Recursos adicionais

- [Documentação Oficial: Go Toolchains](https://go.dev/doc/toolchain)
- [Go Blog: Forward Compatibility and Toolchain Management](https://go.dev/blog/toolchain)
- [Go 1.21 Release Notes](https://go.dev/doc/go1.21)
- [Download de Versões Antigas](https://go.dev/dl/)

## Conclusão

O gerenciamento automático de toolchains do Go 1.21+ é um **divisor de águas**:

- 🎯 **Elimina** problemas de "works on my machine"
- 🚀 **Simplifica** gestão de múltiplas versões
- 🔒 **Garante** builds reproduzíveis
- ⚡ **Automatiza** downloads e seleção de versões

{% hint style="success" %}
Aproveite o poder dos toolchains! Especifique `toolchain` no seu `go.mod` para garantir que todos usem exatamente a mesma versão do Go.
{% endhint %}
