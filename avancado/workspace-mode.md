---
description: Workspace Mode para desenvolvimento com múltiplos módulos simultaneamente
---

# Workspace Mode

## O que é Workspace Mode?

**Workspace Mode** (Modo Workspace) foi introduzido no **Go 1.18** (março de 2022) e permite que você trabalhe com múltiplos módulos simultaneamente em um ambiente de desenvolvimento compartilhado.

{% hint style="success" %}
Antes do Workspace Mode, desenvolver em múltiplos módulos localmente exigia editar manualmente diretivas `replace` no `go.mod`, o que era trabalhoso e propenso a erros. Agora, você pode trabalhar em vários módulos sem modificar seus arquivos `go.mod`.
{% endhint %}

## Problema que resolve

### Antes do Workspace Mode (Go ≤ 1.17)

Imagine que você está desenvolvendo dois módulos: `app` e `library`. O `app` depende de `library`:

```bash
# Para testar mudanças locais em library, você precisava:
# 1. Editar app/go.mod adicionando:
replace github.com/user/library => ../library

# 2. Desenvolver e testar
# 3. LEMBRAR de remover a diretiva replace antes de fazer commit
# 4. Publicar library
# 5. Atualizar app para usar a versão publicada
```

Isso era trabalhoso, especialmente com muitos módulos!

### Com Workspace Mode (Go ≥ 1.18)

```bash
# Simplesmente criar um workspace:
go work init ./app ./library

# Agora app automaticamente usa a versão local de library!
# Sem editar go.mod, sem replace, sem problemas
```

## Estrutura do arquivo go.work

O arquivo `go.work` tem sintaxe similar ao `go.mod`:

```
go 1.25

use (
    ./app
    ./library
    ./another-module
)

// Comentários são suportados
replace golang.org/x/net => example.com/fork/net v1.4.5
```

### Diretivas do go.work

| Diretiva | Descrição | Exemplo |
|----------|-----------|---------|
| `go` | Versão do Go para interpretar o arquivo | `go 1.25` |
| `use` | Módulos ativos no workspace | `use ./module-path` |
| `replace` | Sobrescreve módulos (opcional) | `replace foo => bar v1.0.0` |
| `toolchain` | Especifica toolchain do Go (Go 1.21+) | `toolchain go1.25.0` |

## Como funciona?

Quando um arquivo `go.work` existe, o comando `go`:

1. **Trata todos os módulos listados em `use` como módulos principais**
2. **Resolve importações** preferindo os módulos do workspace
3. **Permite executar comandos** em qualquer módulo a partir da raiz do workspace
4. **Sincroniza dependências** entre os módulos quando solicitado

{% hint style="info" %}
O arquivo `go.work` é **local** e **não deve ser commitado** no repositório. Adicione `go.work` ao `.gitignore`.
{% endhint %}

## Criando um Workspace

### Método 1: Inicialização com módulos

```bash
# Crie um diretório para o workspace
mkdir meu-workspace
cd meu-workspace

# Inicialize com módulos existentes
go work init ./module1 ./module2

# Ou inicialize vazio e adicione depois
go work init
go work use ./module1
go work use ./module2
```

### Método 2: Adicionar módulos recursivamente

```bash
# Adiciona todos os módulos encontrados recursivamente
go work use -r .

# Útil para monorepos com muitos módulos
```

## Exemplo Prático Completo

### Cenário: Desenvolvendo uma aplicação e uma biblioteca juntas

```bash
# 1. Criar estrutura do workspace
mkdir projeto
cd projeto

# 2. Criar o módulo da biblioteca
mkdir stringutil
cd stringutil
go mod init github.com/usuario/stringutil

# Criar stringutil/reverse.go
cat > reverse.go << 'EOF'
package stringutil

func Reverse(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}
EOF

cd ..

# 3. Criar o módulo da aplicação
mkdir app
cd app
go mod init github.com/usuario/app

# Criar app/main.go
cat > main.go << 'EOF'
package main

import (
    "fmt"
    "github.com/usuario/stringutil"
)

func main() {
    fmt.Println(stringutil.Reverse("Hello, World!"))
}
EOF

cd ..

# 4. Criar o workspace
go work init ./app ./stringutil

# 5. Testar - funciona sem publicar stringutil!
cd app
go run .
# Saída: !dlroW ,olleH
```

### Modificando a biblioteca

```bash
# Adicionar uma nova função em stringutil/reverse.go
cd stringutil

cat >> reverse.go << 'EOF'

func ToUpper(s string) string {
    return strings.ToUpper(s)
}
EOF

# Usar imediatamente em app/main.go sem publicar!
cd ../app

# Modificar main.go para usar ToUpper
# ... app usa a nova função imediatamente
go run .
```

## Comandos de Workspace

### go work init

Cria um novo arquivo `go.work`:

```bash
# Inicializar vazio
go work init

# Inicializar com módulos
go work init ./module1 ./module2 ./module3

# Inicializar especificando versão do Go
go work init -go=1.25 ./module1
```

### go work use

Adiciona ou remove módulos do workspace:

```bash
# Adicionar um módulo
go work use ./new-module

# Adicionar múltiplos módulos
go work use ./module1 ./module2

# Adicionar recursivamente todos os módulos
go work use -r .

# Remover um módulo
go work edit -dropuse=./old-module
```

### go work sync

Sincroniza dependências do workspace para os módulos:

```bash
# Sincroniza as versões das dependências
go work sync

# Útil quando você quer que todos os módulos usem
# as mesmas versões de dependências comuns
```

### go work edit

Edita o arquivo `go.work`:

```bash
# Adicionar replace
go work edit -replace golang.org/x/net=../my-net

# Remover replace
go work edit -dropreplace golang.org/x/net

# Definir versão do Go
go work edit -go=1.25

# Adicionar toolchain
go work edit -toolchain=go1.25.1
```

### go work vendor (Go 1.22+)

Cria um diretório `vendor` para o workspace inteiro:

```bash
# Cria vendor/ com todas as dependências do workspace
go work vendor

# Build usando o vendor
go build -mod=vendor ./...
```

## Variáveis de Ambiente

### GOWORK

Controla qual arquivo workspace usar:

```bash
# Usar um arquivo go.work específico
GOWORK=/path/to/custom.work go build

# Desabilitar workspace mode (usar go.mod normalmente)
GOWORK=off go build

# Padrão: Go procura por go.work no diretório atual e pais
```

## Casos de Uso

### 1. Desenvolvimento Local de Dependências

Trabalhar em uma aplicação e suas bibliotecas simultaneamente:

```
workspace/
├── go.work
├── api-server/        # Sua aplicação
│   └── go.mod
├── auth-lib/          # Biblioteca de autenticação
│   └── go.mod
└── database-lib/      # Biblioteca de banco de dados
    └── go.mod
```

### 2. Monorepos

Gerenciar múltiplos serviços em um único repositório:

```
monorepo/
├── go.work
├── user-service/
│   └── go.mod
├── payment-service/
│   └── go.mod
├── notification-service/
│   └── go.mod
└── shared-lib/
    └── go.mod
```

### 3. Contribuindo para Projetos Open Source

Testar mudanças em um projeto que você está contribuindo:

```bash
# Clone o projeto que você usa
git clone https://github.com/author/library

# Clone seu fork onde você está fazendo mudanças
git clone https://github.com/you/library library-fork

# Seu projeto
git clone https://github.com/you/app

# Criar workspace
cd app
go work init . ../library-fork

# Agora app usa sua versão modificada de library
```

## Workflow de Release

Quando estiver pronto para publicar:

### 1. Publicar a biblioteca

```bash
cd library
git tag v1.2.0
git push origin v1.2.0
```

### 2. Atualizar a aplicação

```bash
cd ../app

# Atualizar para usar a versão publicada
go get github.com/user/library@v1.2.0

# Verificar
go mod tidy
```

### 3. O workspace continua funcionando

Mesmo após publicar, o workspace continua usando a versão local para desenvolvimento contínuo.

## Melhores Práticas

### ✅ Faça

- Adicione `go.work` e `go.work.sum` ao `.gitignore`
- Use workspace para desenvolvimento local
- Documente no README como configurar o workspace para novos desenvolvedores
- Use `go work sync` periodicamente para manter dependências sincronizadas

### ❌ Não faça

- **Nunca comite** `go.work` no repositório (é pessoal)
- Não confie em workspace para builds de produção
- Não use replace no `go.work` se puder evitar (prefira no `go.mod` se necessário)
- Não esqueça de testar sem o workspace antes de release

## Troubleshooting

### Problema: "package X is not in GOROOT or in any module"

```bash
# Verifique se todos os módulos estão listados
cat go.work

# Adicione o módulo faltante
go work use ./path/to/module
```

### Problema: Versões de dependências conflitantes

```bash
# Sincronize as versões
go work sync

# Ou force um módulo específico a atualizar
cd module1
go get dependency@version
cd ..
go work sync
```

### Problema: Build funciona localmente mas falha no CI/CD

```bash
# CI não tem o workspace!
# Certifique-se de que seus go.mod estão corretos:

# Desabilite workspace temporariamente
GOWORK=off go build ./...

# Isso mostrará erros que existem sem o workspace
```

## go.work.sum

Similar ao `go.sum`, o arquivo `go.work.sum` contém checksums das dependências usadas no workspace.

```bash
# É criado automaticamente
# Também deve ser adicionado ao .gitignore
echo "go.work" >> .gitignore
echo "go.work.sum" >> .gitignore
```

## Comparação: replace vs workspace

| Característica | replace (go.mod) | workspace (go.work) |
|----------------|------------------|---------------------|
| **Onde** | Dentro do módulo | Fora dos módulos |
| **Escopo** | Um módulo | Múltiplos módulos |
| **Commit** | Sim (com cuidado) | Não (sempre local) |
| **Uso** | Override permanente | Desenvolvimento local |
| **Afeta CI** | Sim | Não |

## Recursos Adicionais

- [Tutorial Oficial: Multi-Module Workspaces](https://go.dev/doc/tutorial/workspaces)
- [Go Blog: Get familiar with workspaces](https://go.dev/blog/get-familiar-with-workspaces)
- [Proposta Original: Design doc](https://go.googlesource.com/proposal/+/master/design/45713-workspace.md)
- [Go 1.18 Release Notes](https://go.dev/doc/go1.18)

## Conclusão

Workspace Mode é uma ferramenta poderosa para desenvolvimento local com múltiplos módulos. Ele simplifica o workflow, elimina a necessidade de diretivas `replace` temporárias, e torna o desenvolvimento em monorepos muito mais agradável.

{% hint style="success" %}
**Dica**: Se você trabalha regularmente com múltiplos módulos relacionados, workspace mode vai economizar muito tempo e frustração!
{% endhint %}
