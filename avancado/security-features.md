---
description: Features de segurança em Go Modules - GOVCS, GOAUTH, e melhores práticas
---

# Security Features

## Introdução

O sistema de módulos do Go incorpora diversas **camadas de segurança** para proteger contra supply chain ataques, código malicioso e comprometimento de dependências.

{% hint style="info" %}
Go leva segurança a sério! Features como checksum database, GOVCS e GOAUTH trabalham juntas para proteger o seu código.
{% endhint %}

## Camadas de segurança

### 1. Checksum Database (Go 1.13+)

Garante **integridade global** dos módulos.

**Como funciona**:
- Todos os módulos públicos têm checksums em `sum.golang.org`.
- Detecta alterações maliciosas em módulos.
- Previne ataques direcionados.

Ver capítulo completo: [Checksum Database](checksum-database.md)

### 2. GOVCS (Go 1.16+)

Controla quais **sistemas de controle de versão** o Go pode usar.

**Por quê?**:
Previne que código malicioso em `go.mod` execute comandos arbitrários via VCS inseguros.

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

| VCS | Comando | Segurança |
|-----|---------|-----------|
| `git` | `git` | ✅ Seguro |
| `hg` | `hg` | ✅ Seguro |
| `svn` | `svn` | ⚠️ Menos seguro |
| `bzr` | `bzr` | ⚠️ Menos seguro |
| `fossil` | `fossil` | ⚠️ Menos seguro |

### 3. GOAUTH (Go 1.24+)

Sistema de **autenticação** para módulos privados.

**O que resolve**:
- Autenticação em repositórios privados
- Tokens de acesso gerenciados centralmente
- Suporte a múltiplos provedores

#### Configuração

```bash
# Formato
GOAUTH="padrão=provedor/comando"

# Git com token
GOAUTH="github.com/empresa/*=git:echo username=token:ghp_abc123"

# Netrc
GOAUTH="gitlab.empresa.com=netrc"

# Comando customizado
GOAUTH="bitbucket.org=command:/usr/local/bin/auth-helper"
```

#### Provedores suportados

| Provedor | Exemplo |
|----------|---------|
| `git` | `git:echo username=token:$GITHUB_TOKEN` |
| `netrc` | `netrc` (usa `~/.netrc`) |
| `command` | `command:/caminho/para/script` |
| `off` | `off` (desabilita auth) |

#### Exemplo prático

```bash
# GitHub private repos
export GOAUTH="github.com/empresa=git:echo username=token:${GITHUB_TOKEN}"

# GitLab com netrc
cat >> ~/.netrc << EOF
machine gitlab.empresa.com
login oauth2
password glpat-xxx
EOF
export GOAUTH="gitlab.empresa.com=netrc"

# Agora funciona
go get github.com/empresa/biblioteca-privada@latest
```

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

**Implica em**:
- `GONOPROXY=$GOPRIVATE`
- `GONOSUMDB=$GOPRIVATE`

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
export GOAUTH="github.com/empresa=git:echo username=token:${TOKEN}"

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
- run: go mod verify
- run: go mod download
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
```

### 3. Typosquatting

**Proteções**:
- ⚠️ Não há proteção automática (em desenvolvimento)

**Mitigação**:
- ✅ Revisar `go.mod` em PRs
- ✅ Usar ferramentas de linting
- ✅ Verificar checksums

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
          go-version: '1.25'

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

```yaml
# Nunca em código
env:
  GOPRIVATE: "github.com/empresa/*"
  # Token via secrets
  GOAUTH: "github.com/empresa=git:echo username=token:${{ secrets.GITHUB_TOKEN }}"
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
- [Module Authentication (GOAUTH)](https://go.dev/ref/mod#module-authentication)
- [Checksum Database](https://go.dev/ref/mod#checksum-database)

## Conclusão

Segurança em Go Modules é **multi-camadas**:

- 🔒 **Checksum Database** - Integridade global
- 🔐 **GOVCS** - Controle de VCS
- 🔑 **GOAUTH** - Autenticação moderna
- 🛡️ **GOPRIVATE** - Proteção de privados
- ✅ **go mod verify** - Verificação local

{% hint style="warning" %}
**Segurança é responsabilidade compartilhada**! Use todas as ferramentas disponíveis e mantenha dependências atualizadas.
{% endhint %}
