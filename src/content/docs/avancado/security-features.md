---
title: "Security Features"
description: Features de segurança em Go Modules - GOVCS, GOAUTH, e melhores práticas
slug: "avancado/security-features"
---

## Introdução

O sistema de módulos do Go incorpora diversas **camadas de segurança** para proteger contra supply chain ataques, código malicioso e comprometimento de dependências.

:::note
Go leva segurança a sério! Features como checksum database, GOVCS e GOAUTH trabalham juntas para proteger o seu código.
:::

## Camadas de segurança

### 1. Checksum Database (Go 1.13+)

Garante **integridade global** dos módulos.

**Como funciona**:
- Versões públicas consultadas pelo serviço ficam registradas em `sum.golang.org`.
- Detecta alterações maliciosas em módulos.
- Previne ataques direcionados.

Ver capítulo completo: [Checksum Database](/avancado/checksum-database/)

### 2. GOVCS (Go 1.16+)

Controla quais **sistemas de controle de versão** o Go pode usar.

**Por quê?**:
Restringe os clientes VCS executados durante downloads diretos. O padrão permite Git e Mercurial para módulos públicos; os demais clientes suportados ficam limitados a módulos privados.

#### Configuração GOVCS

```bash
# Padrão seguro
GOVCS="public:git|hg,private:all"

# Apenas Git (mais restritivo)
GOVCS="*:git"

# Desabilitar proteção (NÃO RECOMENDADO)
GOVCS="*:all"
```

#### Regras de padrão

```bash
# Sintaxe
GOVCS="padrão:lista,padrão:lista,..."

# Exemplos
GOVCS="github.com:git,example.com:svn,private:all"
GOVCS="*.internal.corp:git,public:git|hg"
```

#### VCS suportados

| VCS | Comando | Permitido pelo GOVCS padrão |
|-----|---------|----------------------------|
| `git` | `git` | Público e privado |
| `hg` | `hg` | Público e privado |
| `svn` | `svn` | Privado |
| `fossil` | `fossil` | Privado |

No Go 1.27, o suporte ao download direto via Bazaar (`bzr`) foi removido. Módulos que dependem desse acesso precisam de outro VCS ou de um proxy que os disponibilize.

### 3. GOAUTH (Go 1.24+)

O `GOAUTH` configura a autenticação das requisições HTTPS usadas para descobrir módulos (`go-import`) e acessar proxies de módulos. O padrão é `netrc`.

#### Configuração

```bash
# Usar credenciais de NETRC ou ~/.netrc (padrão)
export GOAUTH=netrc

# Consultar o credential helper do Git em um diretório absoluto
export GOAUTH="git /home/gopher/projeto"

# Executar um helper próprio
export GOAUTH="/usr/local/bin/auth-helper"

# Combinar métodos, separados por ponto e vírgula
export GOAUTH="netrc; git /home/gopher/projeto"

# Desabilitar autenticação HTTP do comando go
export GOAUTH=off
```

No modo `git`, o Go executa `git credential fill` no diretório indicado. Esse diretório precisa existir e o credential helper precisa estar configurado.

Um helper próprio recebe e produz dados no formato descrito em `go help goauth`. Sua saída informa URLs e cabeçalhos HTTP, separados por linhas em branco. O valor de `GOAUTH` é uma lista de comandos; os hosts e as credenciais são definidos pelo método escolhido.

#### Exemplo prático

Para usar um arquivo `.netrc`, preencha os dados do servidor:

```text
machine gitlab.empresa.com
login oauth2
password SEU_TOKEN
```

Depois, limite a leitura do arquivo e configure o acesso:

```bash
chmod 600 ~/.netrc
export GOPRIVATE="gitlab.empresa.com/*"
export GOAUTH=netrc
go get gitlab.empresa.com/time/biblioteca@latest
```

:::note
`GOPRIVATE` controla quais módulos são privados. `GOAUTH` fornece credenciais para as requisições HTTPS do Go. Quando o download usa um comando Git, esse processo também precisa da própria autenticação, por exemplo por credential helper ou SSH.
:::

### 4. GOPRIVATE (Go 1.13+)

Define módulos **privados** que não devem usar proxy ou checksum database.

```bash
# Sintaxe
GOPRIVATE="padrão,padrão,..."

# Exemplos
GOPRIVATE="github.com/empresa/*"
GOPRIVATE="*.internal.corp,github.com/usuario"
GOPRIVATE="gitlab.empresa.com/*,bitbucket.org/time/*"
```

**Fornece o valor padrão para** `GONOPROXY` e `GONOSUMDB`. Se essas variáveis forem definidas explicitamente, seus padrões prevalecem para proxy e checksum database, respectivamente.

**Quando usar**:
- ✅ Repositórios privados da empresa
- ✅ Código proprietário
- ✅ Módulos internos

## Melhores Práticas de Segurança

### ✅ Verificação de Dependências

#### 1. Auditar Dependências

```bash
# Listar todas as dependências
go list -m all

# Ver dependências transitivas
go mod graph | grep -v "$(go list -m)"

# Verificar atualizações
go list -u -m all
```

#### 2. Usar Ferramentas de Segurança

```bash
# govulncheck - scanner oficial de vulnerabilidades
go install golang.org/x/vuln/cmd/govulncheck@latest
govulncheck ./...

# nancy - scanner de vulnerabilidades
go list -json -m all | nancy sleuth

# Dependabot (GitHub)
# Habilitar no repositório
```

### ✅ Versionamento Seguro

```bash
# Usar versões exatas em produção
require (
    github.com/gin-gonic/gin v1.10.0  // Não v1.10
    gorm.io/gorm v1.25.7              // Não v1.25 ou latest
)

# Evitar pseudo-versions em produção
# ❌ v0.0.0-20240101120000-abcdef123456
# ✅ v1.2.3
```

### ✅ Módulos Privados Seguros

```bash
# Configure GOPRIVATE
export GOPRIVATE="github.com/empresa/*"

# Use GOAUTH para autenticação
export GOAUTH=netrc  # Credenciais já configuradas em ~/.netrc

# Nunca commite tokens
# Adicione ao .gitignore:
.env
.netrc
```

### ✅ Verificar Checksums

```bash
# Sempre commite go.sum
git add go.sum
git commit -m "Update dependencies"

# Verifique integridade regularmente
go mod verify

# Em CI/CD
- run: go mod download
- run: go mod verify
- run: go build ./...
```

## Proteção Contra Ataques

### 1. Supply Chain Attacks

**Proteções**:
- ✅ Checksum database detecta alterações
- ✅ `go.sum` garante consistência
- ✅ `retract` marca versões comprometidas

**Exemplo**:
```bash
# Versão comprometida detectada
$ go get github.com/modulo-comprometido@v1.5.0
go: warning: github.com/modulo-comprometido@v1.5.0: retracted by module author
    Security vulnerability - use v1.5.1+
```

### 2. Dependency Confusion

**Proteções**:
- ✅ `GOPRIVATE` previne vazamento de nomes
- ✅ Proxies privados tem precedência

**Configuração**:
```bash
# Proxy privado PRIMEIRO
export GOPROXY="https://proxy.empresa.com,proxy.golang.org,direct"
export GOPRIVATE="github.com/empresa/*"

# Para buscar os privados no proxy corporativo, sem consultar o proxy público:
export GONOPROXY=none
export GOPROXY="https://proxy.empresa.com"
```

Sem `GONOPROXY=none`, o padrão de `GOPRIVATE` faz o Go buscar esses módulos diretamente no VCS. Se o proxy corporativo atende módulos privados, sua configuração precisa impedir que os caminhos sejam encaminhados a um serviço público.

### 3. Typosquatting

**Proteções**:
- Os checksums não detectam, por si só, que um caminho digitado errado aponta para outro módulo

**Mitigação**:
- ✅ Revisar `go.mod` em PRs
- ✅ Usar ferramentas de linting
- Conferir o caminho e a origem do módulo antes de adicioná-lo

### 4. Code Injection via VCS

**Proteções**:
- ✅ `GOVCS` limita VCS permitidos

**Exemplo seguro**:
```bash
# Apenas Git e Mercurial
export GOVCS="*:git|hg"
```

## CI/CD Seguro

### GitHub Actions

```yaml
name: Security
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version: '1.27.1'

      # Verificar checksums
      - name: Verify modules
        run: go mod verify

      # Scanner de vulnerabilidades
      - name: Run govulncheck
        run: |
          go install golang.org/x/vuln/cmd/govulncheck@latest
          govulncheck ./...

      # Verificar go.sum commitado
      - name: Check go.sum
        run: |
          go mod tidy
          git diff --exit-code go.sum

      # Scan de segurança
      - name: Run Gosec
        uses: securego/gosec@master
        with:
          args: ./...
```

### Variáveis de Ambiente Seguras

Use um secret com acesso de leitura aos repositórios necessários para preparar as credenciais. O token do workflow pode não ter acesso a outros repositórios privados. Veja o [tutorial de módulos privados no GitHub Actions](/tutoriais/como-usar-libs-privadas-no-github-actions/).

```yaml
# Nunca em código
env:
  GOPRIVATE: "github.com/empresa/*"
  # O arquivo de credenciais deve ser preparado pelo workflow
  GOAUTH: netrc
```

## Checklist de Segurança

### Setup Inicial

- [ ] Configure `GOPRIVATE` para módulos privados
- [ ] Configure `GOAUTH` para autenticação
- [ ] Configure `GOVCS` para limitar VCS
- [ ] Habilite checksum database (padrão)
- [ ] Use proxy privado se necessário

### Durante Desenvolvimento

- [ ] Sempre rode `go mod verify`
- [ ] Revise `go.mod` changes em PRs
- [ ] Não use `@latest` em produção
- [ ] Verifique licenças de dependências
- [ ] Audite dependências periodicamente

### Antes de Release

- [ ] Execute `govulncheck`
- [ ] Verifique todas as dependências atualizadas
- [ ] Commit `go.sum` atualizado
- [ ] Documente dependências críticas
- [ ] Teste com todas as dependências limpas

## Ferramentas de Segurança

### govulncheck (Oficial)

```bash
# Instalar
go install golang.org/x/vuln/cmd/govulncheck@latest

# Escanear projeto
govulncheck ./...

# JSON output
govulncheck -json ./...
```

### nancy (Sonatype)

```bash
# Via Docker
go list -json -m all | docker run -i sonatypecommunity/nancy:latest sleuth

# Output formatado
go list -json -m all | nancy sleuth --output=json
```

### gosec (Security Scanner)

```bash
# Instalar
go install github.com/securego/gosec/v2/cmd/gosec@latest

# Escanear
gosec ./...

# Com severity mínima
gosec -severity=medium ./...
```

## Recursos Adicionais

- [Go Security Policy](https://go.dev/security)
- [Go Vulnerability Database](https://vuln.go.dev/)
- [GOVCS Documentation](https://go.dev/ref/mod#vcs-govcs)
- [Module Authentication (GOAUTH)](https://pkg.go.dev/cmd/go#hdr-GOAUTH_environment_variable)
- [Checksum Database](https://go.dev/ref/mod#checksum-database)

## Conclusão

Segurança em Go Modules é **multi-camadas**:

- 🔒 **Checksum Database** - Integridade global
- 🔐 **GOVCS** - Controle de VCS
- 🔑 **GOAUTH** - Autenticação moderna
- 🛡️ **GOPRIVATE** - Proteção de privados
- ✅ **go mod verify** - Verificação local

:::caution
**Segurança é responsabilidade compartilhada**! Use todas as ferramentas disponíveis e mantenha dependências atualizadas.
:::
