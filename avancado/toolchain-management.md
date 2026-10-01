---
description: Gerenciamento automático de toolchains do Go desde a versão 1.21
---

# Gerenciamento de Toolchains

## Introdução

**Go 1.21** (agosto de 2023) introduziu um sistema revolucionário de gerenciamento de toolchains que permite:

1. **Download automático** de versões do Go conforme necessário
2. **Seleção inteligente** da versão correta para cada projeto
3. **Requisitos mínimos** de versão respeitados

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
| **Release** | `1.N.P` | `1.27.0` |
| **Release Candidate** | `1.NrcR` | `1.27rc1` |
| **Família de linguagem** | `1.N` | `1.27` |

**Ordem de versões**: `1.27 < 1.27rc1 < 1.27rc2 < 1.27.0 < 1.27.1`

## Diretivas no go.mod

### Diretiva `go`

Declara a **versão mínima** do Go necessária:

```go
module github.com/usuario/projeto

go 1.27.0
```

**Comportamento**:
- Toolchains **mais antigos** que `1.27.0` se recusarão a carregar este módulo
- Toolchains **mais novos** podem usar este módulo normalmente
- Ativa features de linguagem da versão especificada

### Diretiva `toolchain`

Especifica um **toolchain preferido**:

```go
module github.com/usuario/projeto

go 1.27.0
toolchain go1.27.1
```

**Comportamento com `GOTOOLCHAIN=auto`**:
- Se o toolchain atual for **mais antigo** que `go1.27.1`, faz upgrade automaticamente
- Se o toolchain atual for **mais novo**, usa o atual (não faz downgrade)

{% hint style="info" %}
Se você especifica apenas `go 1.27.0` sem `toolchain`, é implicitamente equivalente a `toolchain go1.27.0`.
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
GOTOOLCHAIN=go1.27.0 go test
```

**Comportamento**:
- Usa **exclusivamente** a versão especificada
- Procura `go1.27.0` no PATH primeiro
- Baixa se não encontrar
- **Ignora** diretivas `toolchain` no go.mod

### GOTOOLCHAIN=<name>+auto

```bash
# Versão mínima com upgrade automático
GOTOOLCHAIN=go1.27.0+auto
```

**Comportamento**:
- Usa `go1.27.0` como **mínimo**
- Permite **upgrade** se projeto requer versão mais nova

### GOTOOLCHAIN=<name>+path

```bash
# Versão mínima apenas do PATH
GOTOOLCHAIN=go1.27.0+path
```

**Comportamento**:
- Usa `go1.27.0` como mínimo
- Permite upgrade **apenas** de versões encontradas no PATH
- **Nunca** baixa toolchains

## Como a seleção automática funciona

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
   ├─ 1º: Procura no PATH (ex: go1.27.1)
   ├─ 2º: Baixa o módulo golang.org/toolchain via GOPROXY
   └─ 3º: Armazena em cache
10. ↓
11. Executa comando com toolchain correto
```

### Exemplo prático

```bash
# Você tem Go 1.26.0 instalado
$ go version
go version go1.26.0 linux/amd64

# Seu projeto requer Go 1.27
$ cat go.mod
module github.com/usuario/app
go 1.27.0

# Ao executar go build:
$ go build
go: downloading go1.27.0 (linux/amd64)
# ... build usa Go 1.27.0 automaticamente
```

## Downloads automáticos

### Como funciona

Toolchains são baixados como **módulos** especiais:

- **Caminho do módulo**: `golang.org/toolchain`
- **Versionamento**: `v0.0.1-go1.27.0.linux-amd64`
- **Respeitam GOPROXY**: Podem ser servidos via proxy corporativo

### Localização do cache

```bash
# Toolchains são armazenados em:
$GOPATH/pkg/mod/golang.org/toolchain@<versão>

# Exemplo:
~/.local/share/go/pkg/mod/golang.org/toolchain@v0.0.1-go1.27.0.linux-amd64/

# Listar toolchains baixados:
ls $GOPATH/pkg/mod/golang.org/toolchain@*
```

### Desabilitar downloads

```bash
# Opção 1: Usar GOTOOLCHAIN=local
export GOTOOLCHAIN=local

# Opção 2: Permitir troca apenas para toolchains encontrados no PATH
export GOTOOLCHAIN=path
```

## Comandos de gerenciamento

Desde Go 1.25, atualizar a linha `go` não adiciona automaticamente uma linha `toolchain` com a versão do comando em execução.

### Atualizar versões do Go

```bash
# Atualizar para última versão estável
go get go@latest

# Atualizar para versão específica
go get go@1.27.1

# Atualizar para release candidate
go get go@1.27rc1

# Ver versão atual no go.mod
go mod edit -json | jq .Go
```

### Atualizar toolchain

```bash
# Definir toolchain específico
go get toolchain@go1.27.1

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
go work edit -go=1.27.1
```

## Estratégia de seleção de versões

### Quando uma dependência exige um Go mais novo

Com a troca automática habilitada, comandos como `go get` podem encontrar uma dependência que exige um Go mais novo. Nesse caso, o Go considera toolchains das versões suportadas e escolhe o mais antigo entre os candidatos que atendem ao requisito.

Um exemplo hipotético:

```
Dependência requer: go 1.26.0

Candidatos disponíveis:
- go1.26.8
- go1.27.1

SELECIONADO: go1.26.8
↑ Candidato mais antigo que atende ao requisito
```

Essa escolha depende das versões disponíveis. Para repetir um build com um toolchain específico, configure uma versão exata no ambiente de execução.

## Casos de uso práticos

### Caso 1: Testar com Release Candidate

Este exemplo ilustra o teste durante o ciclo de lançamento. Depois da versão estável, prefira a versão estável para o trabalho diário.

```bash
# Testar seu código com Go 1.27rc1
GOTOOLCHAIN=go1.27rc1 go test ./...

# O módulo precisa declarar um mínimo compatível com esse RC
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
          go-version: '1.27.1'

      # Garantir que usa EXATAMENTE essa versão
      - run: go test ./...
        env:
          GOTOOLCHAIN: local
```

### Caso 3: Desenvolvimento multi-versão

```bash
# Instalar múltiplas versões via go install
go install golang.org/dl/go1.26.0@latest
go install golang.org/dl/go1.27.0@latest

# Baixar as versões
go1.26.0 download
go1.27.0 download

# Usar versões específicas
go1.26.0 build ./...
go1.27.0 test ./...

# Agora estão disponíveis no PATH!
```

### Caso 4: Monorepo com diferentes versões

```bash
# Estrutura:
monorepo/
├── go.work
├── legacy-service/    # Requer go 1.25.0
│   └── go.mod
├── new-service/       # Requer go 1.26.0
│   └── go.mod
└── experimental/      # Requer go 1.27.0
    └── go.mod

# Na raiz do monorepo:
go work init ./legacy-service ./new-service ./experimental
go test work
```

O workspace usa um único toolchain por execução. A linha `go` do `go.work` precisa ser pelo menos tão nova quanto a de cada módulo listado. A versão da linguagem de cada módulo continua sendo definida pelo seu próprio `go.mod`.

## Compatibilidade retroativa

### Go 1.21 passou a exigir o mínimo declarado na linha `go`

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

### Erro: módulo exige uma versão mais nova

```bash
# Causa: GOTOOLCHAIN=local mas projeto requer versão mais nova

# Solução 1: Permitir downloads automáticos
export GOTOOLCHAIN=auto
go build

# Solução 2: Instalar a versão necessária
go install golang.org/dl/go1.27.0@latest
go1.27.0 download

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

# Sugerir uma versão para trabalhar no módulo
go get toolchain@go1.27.1

# Executar os testes com uma versão exata
GOTOOLCHAIN=go1.27.1 go test ./...
```

## Melhores práticas

### ✅ Recomendado

- Use `toolchain` para sugerir uma versão de desenvolvimento
- Instale uma versão exata no CI/CD e use `GOTOOLCHAIN=local` para impedir a troca automática de toolchain
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

- **Explicita** os requisitos de versão do projeto
- **Simplifica** gestão de múltiplas versões
- **Permite** selecionar uma versão exata pelo ambiente
- **Automatiza** downloads e seleção de versões

{% hint style="success" %}
Use `go` para declarar o mínimo e `toolchain` para sugerir uma versão de desenvolvimento. Para exigir a mesma versão em uma execução, configure `GOTOOLCHAIN` com o nome exato ou instale essa versão e use `GOTOOLCHAIN=local`.
{% endhint %}
