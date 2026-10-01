---
title: "Checksum Database"
description: Banco de dados de checksums do Go (sum.golang.org) para conferir a consistência do conteúdo de versões públicas
slug: "avancado/checksum-database"
---

## O que é o Checksum Database?

O **Checksum Database** (Banco de Dados de Checksums) é um serviço global mantido pelo time do Go e acessível em **sum.golang.org**. Ele fornece uma fonte de verdade globalmente consistente para os hashes criptográficos de todos os módulos públicos do Go.

## Por que ele existe?

Embora o arquivo `go.sum` contenha hashes SHA-256 das dependências baixadas, ele opera com base no princípio de "confiança no primeiro uso" (trust on first use). Isso significa que:

- O primeiro desenvolvedor a baixar um módulo define o hash
- Não há garantia de que diferentes desenvolvedores recebam o mesmo código
- Um servidor malicioso poderia entregar código diferente para diferentes pessoas

O Checksum Database permite detectar quando o conteúdo recebido diverge do hash registrado para uma versão pública. Isso confere a consistência do conteúdo; não garante que o código publicado seja seguro ou livre de bugs.

## Como funciona?

### Arquitetura: Transparent Log

O Checksum Database utiliza uma estrutura de **Merkle tree** (árvore de Merkle) baseada no sistema [Trillian](https://github.com/google/trillian) do Google. Esta arquitetura é conhecida como "Transparent Log" (Log Transparente) e possui propriedades que tornam impossível alterar dados sem ser detectado.

### Verificação criptográfica

O comando `go` utiliza duas formas de verificação:

1. **Inclusion Proofs (Provas de Inclusão)**: Confirmam que um registro específico existe no log
2. **Consistency Proofs (Provas de Consistência)**: Verificam que a árvore não foi comprometida ou alterada

### Endpoints da API

Entre os endpoints do Checksum Database estão:

- **`/lookup/<módulo>@<versão>`**: Retorna um "signed tree head" (STH) e as linhas `go.sum` solicitadas
- **`/tile/...`**: Fornece pedaços da árvore chamados "tiles" que o comando `go` usa para gerar provas criptográficas

## Fluxo de trabalho

Quando você executa comandos como `go get` ou `go mod download`:

1. O comando `go` baixa o código-fonte do módulo
2. Calcula o hash SHA-256 do código
3. Usa o hash correspondente de `go.sum` ou consulta o checksum database, que pode responder a partir do cache ou por um proxy
4. Valida o registro no log e compara os hashes:
   - ✅ Se coincidirem: adiciona ao `go.sum` e continua
   - ❌ Se divergirem: reporta o erro e interrompe a execução

```bash
# Exemplo de erro quando os hashes não coincidem
verifying github.com/exemplo/modulo@v1.2.3: checksum mismatch
    downloaded: h1:abc123...
    sum.golang.org: h1:xyz789...

SECURITY ERROR
This download does NOT match the one reported by the checksum server.
```

## Benefícios de segurança

### 1. Proteção contra ataques direcionados

Mesmo que um atacante comprometa um servidor proxy ou origin, ele **não pode** distribuir código malicioso para desenvolvedores específicos sem ser detectado. O Checksum Database detectaria a inconsistência.

### 2. Imutabilidade de versões

Nem mesmo os **autores dos módulos** podem alterar o código de uma versão já publicada sem que o Checksum Database detecte a mudança. Um download que diverge do hash registrado para `v1.2.3` é rejeitado, mesmo que a tag tenha sido alterada no repositório original.

### 3. Verificação global

Todos os desenvolvedores verificam contra a mesma fonte de verdade, criando uma rede global de verificação.

## Configuração e variáveis de ambiente

### GOSUMDB

A variável de ambiente `GOSUMDB` controla qual checksum database usar:

```bash
# Configuração padrão (desde Go 1.13)
GOSUMDB="sum.golang.org"

# Desabilitar verificação (NÃO RECOMENDADO)
GOSUMDB=off

# Usar servidor customizado
GOSUMDB="meu-servidor.com+<chave-publica> https://meu-servidor.com"
```

A chave pública precisa ser fornecida para um servidor próprio. O Go já conhece a chave de `sum.golang.org`.

⚠️ **Atenção**: Desabilitar o GOSUMDB reduz significativamente a segurança do seu projeto.

### GONOSUMDB

Define padrões de módulos que **não** devem ser verificados no checksum database (útil para módulos privados):

```bash
# Ignorar verificação para módulos privados da empresa
GONOSUMDB="github.com/minhaempresa/*,gitlab.interno/*"
```

### GOPRIVATE

Define os padrões usados como valor padrão de `GONOSUMDB` e `GONOPROXY`, quando essas variáveis não foram configuradas explicitamente:

```bash
# Maneira recomendada para módulos privados
GOPRIVATE="github.com/minhaempresa/*"
```

## Quando o Checksum Database é consultado?

O Go consulta o checksum database quando precisa autenticar um arquivo `.mod` ou `.zip` cujo hash ainda não consta em `go.sum`, desde que a verificação esteja habilitada e o módulo não corresponda a `GONOSUMDB`. `GOPRIVATE` fornece o padrão de `GONOSUMDB` quando essa variável não foi definida.

A consulta pode usar registros já armazenados no cache ou ser intermediada pelo proxy. Um hash do arquivo `go.mod` não substitui o hash do conteúdo do módulo: são entradas diferentes em `go.sum`.

## Verificação manual

Para baixar uma versão e conferir o hash pelos mecanismos configurados:

```bash
go mod download -json rsc.io/quote@v1.5.2
```

Para conferir se os módulos no cache local foram alterados desde o download:

```bash
go mod verify
```

O `verify` compara os arquivos zip e os diretórios extraídos com os hashes registrados no próprio cache. Ele não consulta o checksum database para verificar esses conteúdos, nem usa as entradas de `go.sum` nessa comparação. Veja [go mod verify](https://go.dev/ref/mod#go-mod-verify).

## Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| Go 1.13 | Agosto 2019 | Lançamento oficial do sum.golang.org como produção |
| Go 1.12 | Fevereiro 2019 | `proxy.golang.org` disponível para testes públicos |

## Comparação: go.sum vs Checksum Database

| Característica | go.sum | Checksum Database |
|----------------|--------|-------------------|
| **Escopo** | Local do projeto | Global (todos os desenvolvedores) |
| **Verificação** | Hashes esperados pelo projeto | Registro global usado quando falta o hash em go.sum |
| **Segurança** | Hashes autenticados no download, quando sumdb está habilitado | Log assinado e provas criptográficas |
| **Detecta** | Mudanças locais | Mudanças globais + ataques direcionados |
| **Estrutura** | Arquivo texto simples | Merkle tree (Transparent Log) |

## Recursos adicionais

- [Go Blog: Module Mirror and Checksum Database](https://go.dev/blog/module-mirror-launch)
- [Documentação Oficial: Checksum Database](https://go.dev/ref/mod#checksum-database)
- [Trillian Project](https://github.com/google/trillian)
- [sum.golang.org](https://sum.golang.org)

## Perguntas frequentes

### Meus módulos privados são enviados para sum.golang.org?

Com `GONOSUMDB` configurado para esses módulos, o Go não faz essa consulta. `GOPRIVATE` fornece esse padrão, mas uma configuração explícita de `GONOSUMDB` pode substituí-lo. Confira os padrões para evitar enviar caminhos privados ao serviço público.

### O que acontece se sum.golang.org estiver fora do ar?

O comando `go` tentará usar checksums já presentes em `go.sum`. Se não houver um hash em `go.sum` nem registros suficientes no cache do checksum database, a operação falhará até que o serviço volte. Você pode configurar um mirror ou, em último caso, usar `GOSUMDB=off` temporariamente.

### Posso hospedar meu próprio checksum database?

Sim! É preciso um servidor compatível com o protocolo do sumdb e configurar sua chave pública em `GOSUMDB`. Um proxy de módulos, como Athens, desempenha outra função: servir arquivos de módulos, podendo também intermediar consultas ao checksum database.

### O checksum database conhece todo o código do meu projeto?

Não. O database apenas armazena **hashes** criptográficos. O serviço calcula hashes a partir de versões públicas obtidas pelo mirror. Ele não recebe o código do módulo principal do seu projeto durante uma consulta.
