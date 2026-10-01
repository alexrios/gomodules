---
description: Lazy Module Loading e Graph Pruning introduzidos no Go 1.17 para reduzir o trabalho de resolução de módulos
---

# Lazy Module Loading e Graph Pruning

## Introdução

**Go 1.17** (agosto de 2021) introduziu duas otimizações no sistema de módulos:

1. **Module Graph Pruning** (Poda do Grafo de Módulos)
2. **Lazy Module Loading** (Carregamento Preguiçoso de Módulos)

O que isso muda no dia a dia? O Go pode resolver os pacotes usados pelo projeto lendo menos arquivos `go.mod`. Essas otimizações continuam presentes no Go 1.27.

{% hint style="info" %}
O ganho depende das dependências e do comando executado. Para comparar desempenho, meça o mesmo projeto com as mesmas versões e condições de cache.
{% endhint %}

## O problema: Go ≤ 1.16

Em módulos com `go 1.16` ou inferior, a seleção de versões considera todo o grafo transitivo de requisitos. Isso exige ler arquivos `go.mod` de módulos que podem não fornecer nenhum pacote usado no build.

Ler um `go.mod` e baixar o código de um módulo são operações diferentes. O Go pode precisar dos requisitos de uma dependência para selecionar versões sem precisar compilar seus pacotes.

## A solução: Go 1.17+

### Module Graph Pruning (Poda do Grafo)

Se o módulo principal declara **`go 1.17` ou superior**, o grafo inclui apenas os requisitos imediatos das dependências que também declaram Go 1.17+. Dependências com `go 1.16` ou inferior ainda exigem seu grafo transitivo completo, inclusive quando alcançam módulos mais novos.

Para isso funcionar, `go mod tidy` registra no `go.mod` os módulos que fornecem pacotes importados direta ou indiretamente pelo código e pelos testes do módulo principal.

```text
Seu módulo (go 1.27)
    ├── Dependência A (go 1.17+)
    │   └── Requisitos imediatos de A
    └── Dependência B (go 1.16)
        └── Grafo transitivo completo de B
```

Podar requisitos de um módulo não significa remover esse módulo do resultado de `go list -m all`. Sua versão selecionada continua conhecida e seus pacotes podem ser carregados quando necessários.

### Lazy Module Loading

Com **`go 1.17` ou superior**, o Go tenta carregar os pacotes pedidos usando os requisitos do módulo principal antes de carregar o restante do grafo:

```text
1. Lê o go.mod do módulo principal
2. Procura os pacotes nos módulos exigidos
3. Se faltar informação, carrega o restante do grafo sob demanda
4. Confere os requisitos dos módulos que fornecem os pacotes usados
```

Isso evita trabalho quando os requisitos já são suficientes para executar o comando.

## Como funciona na prática

### Estrutura do go.mod

Continuando o [tutorial básico](../basico/rotina-usando-modulos/adicionando-uma-dependencia.md), o projeto importa `rsc.io/quote`, que usa pacotes de outros módulos:

```go
module example.com/hello

go 1.27.1

require rsc.io/quote v1.5.2

require (
    golang.org/x/text v0.0.0-20170915032832-14c0d48ead0c // indirect
    rsc.io/sampler v1.3.0 // indirect
)
```

O comentário `// indirect` indica que o módulo principal não importa diretamente pacotes daquela dependência. Esses requisitos ajudam o Go a localizar os pacotes sem carregar todo o grafo antes de começar.

### Blocos de require separados

Desde Go 1.17, `go mod tidy` separa os requisitos indiretos dos diretos. **No Go 1.27**, para módulos com `go 1.27` ou superior, também consolida blocos duplicados em até dois blocos.

```bash
# Conferir sem modificar os arquivos
go mod tidy -diff

# Aplicar a organização
go mod tidy
```

Veja [Go 1.26-1.27](../releases/1.26-1.27.md) para um exemplo de consolidação.

## Impacto no go.sum

O `go.sum` guarda os hashes necessários para autenticar arquivos `.mod` e o conteúdo das versões dos módulos. Não existe uma proporção fixa entre o número de dependências, o tamanho do arquivo e o tempo de build.

Por padrão, `go mod tidy` preserva também os checksums necessários para a versão do Go anterior à declarada. Por isso, um módulo `go 1.17` pode manter hashes para o grafo completo usado pelo Go 1.16. Um módulo `go 1.18` já considera a compatibilidade com o grafo podado do Go 1.17.

```bash
# Para um módulo go 1.17, manter compatibilidade de checksums com 1.16
go mod tidy -go=1.17 -compat=1.16
```

Esse comando só se aplica se o código e as dependências forem compatíveis com a versão escolhida. `-compat` controla a conferência das versões selecionadas e os checksums preservados; não faz o código aceitar recursos de linguagem mais antigos.

## Atualizando um projeto

Para um projeto que vai passar a exigir Go 1.27:

```bash
go get go@1.27.0
go mod tidy
go test ./...
git diff -- go.mod go.sum
```

Revise as mudanças e teste também com o menor toolchain que o projeto promete suportar. Mudar a linha `go` afeta a versão da linguagem e o requisito mínimo, além do comportamento de resolução de módulos.

## Inspecionando o grafo

```bash
# Requisitos que formam o grafo
go mod graph

# Versões selecionadas
go list -m all

# Dependências diretas do módulo principal
go list -m -f '{{if and (not .Main) (not .Indirect)}}{{.Path}} {{.Version}}{{end}}' all
```

A quantidade de módulos, sozinha, não comprova que o lazy loading está ativo. A diretiva `go` e os requisitos de cada dependência determinam o comportamento.

## Comportamento com workspaces

Em um workspace, cada módulo mantém a versão da linguagem definida em seu `go.mod`. O grafo do workspace combina os requisitos dos módulos principais. Uma dependência antiga pode exigir a expansão de parte desse grafo.

```bash
# Testar todos os módulos do workspace (Go 1.25+)
go test work

# Testar um módulo sem o workspace
cd app
GOWORK=off go test ./...
```

Veja [Workspace Mode](workspace-mode.md).

## Troubleshooting

### Problema: go mod tidy está lento

Confira a versão declarada e os módulos envolvidos. O `tidy` considera imports dos testes e arquivos para diferentes plataformas e build tags, por isso pode precisar de mais dependências que um build comum.

```bash
go mod edit -json
go mod graph
```

### Problema: go.sum está grande

Execute `go mod tidy` e revise o diff. O arquivo pode conter hashes de várias versões porque o Go precisa ler seus requisitos. Seu tamanho não indica, por si só, um problema.

```bash
go mod tidy
git diff -- go.sum
```

### Problema: builds estão lentos

Meça antes de mudar configurações. Limpar o cache com `go clean -modcache` força novos downloads e não é uma otimização de build. Separe o tempo gasto em downloads, compilação e testes ao investigar.

## Recursos adicionais

* [Go 1.17 Release Notes](https://go.dev/doc/go1.17#go-command)
* [Go Modules Reference: Module graph pruning](https://go.dev/ref/mod#graph-pruning)
* [Go Modules Reference: Lazy module loading](https://go.dev/ref/mod#lazy-loading)
* [Go 1.27 Release Notes: go mod tidy](https://go.dev/doc/go1.27#go-mod-tidy)
