---
description: Banco de dados de checksums do Go (sum.golang.org) que garante autenticidade e integridade de módulos
---

# Checksum Database

## O que é o Checksum Database?

O **Checksum Database** (Banco de Dados de Checksums) é um serviço global mantido pelo time do Go e acessível em **sum.golang.org**. Ele fornece uma fonte de verdade globalmente consistente para os hashes criptográficos de todos os módulos públicos do Go.

## Por que ele existe?

Embora o arquivo `go.sum` contenha hashes SHA-256 das dependências baixadas, ele opera com base no princípio de "confiança no primeiro uso" (trust on first use). Isso significa que:

- O primeiro desenvolvedor a baixar um módulo define o hash
- Não há garantia de que diferentes desenvolvedores recebam o mesmo código
- Um servidor malicioso poderia entregar código diferente para diferentes pessoas

O Checksum Database resolve este problema garantindo que **todos os desenvolvedores no mundo recebam exatamente o mesmo código para uma mesma versão de módulo**.

## Como funciona?

### Arquitetura: Transparent Log

O Checksum Database utiliza uma estrutura de **Merkle tree** (árvore de Merkle) baseada no sistema [Trillian](https://github.com/google/trillian) do Google. Esta arquitetura é conhecida como "Transparent Log" (Log Transparente) e possui propriedades que tornam impossível alterar dados sem ser detectado.

### Verificação criptográfica

O comando `go` utiliza duas formas de verificação:

1. **Inclusion Proofs (Provas de Inclusão)**: Confirmam que um registro específico existe no log
2. **Consistency Proofs (Provas de Consistência)**: Verificam que a árvore não foi comprometida ou alterada

### Endpoints da API

O Checksum Database oferece dois endpoints principais:

- **`/lookup`**: Retorna um "signed tree head" (STH) e as linhas `go.sum` solicitadas
- **`/tile`**: Fornece pedaços da árvore chamados "tiles" que o comando `go` usa para gerar provas criptográficas

## Fluxo de trabalho

Quando você executa comandos como `go get` ou `go mod download`:

1. O comando `go` baixa o código-fonte do módulo
2. Calcula o hash SHA-256 do código
3. Consulta o **sum.golang.org** para obter o hash esperado
4. Compara os dois hashes:
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

Nem mesmo os **autores dos módulos** podem alterar o código de uma versão já publicada sem que o Checksum Database detecte a mudança. Isso garante que `v1.2.3` sempre será exatamente o mesmo código, para sempre.

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
GOSUMDB="meu-servidor.com"
```

⚠️ **Atenção**: Desabilitar o GOSUMDB reduz significativamente a segurança do seu projeto.

### GONOSUMDB

Define padrões de módulos que **não** devem ser verificados no checksum database (útil para módulos privados):

```bash
# Ignorar verificação para módulos privados da empresa
GONOSUMDB="github.com/minhaempresa/*,gitlab.interno/*"
```

### GOPRIVATE

Define módulos privados (implica em `GONOSUMDB` e `GONOPROXY`):

```bash
# Maneira recomendada para módulos privados
GOPRIVATE="github.com/minhaempresa/*"
```

## Quando o Checksum Database é consultado?

O checksum database é consultado quando:

- ✅ O módulo é **público**
- ✅ O módulo **não está** em `go.sum`
- ✅ O módulo **não corresponde** aos padrões em `GONOSUMDB`/`GOPRIVATE`
- ✅ `GOSUMDB` **não está** definido como `off`

O checksum database **NÃO** é consultado quando:

- ❌ O módulo já está em `go.sum`
- ❌ O módulo está em `GOPRIVATE`
- ❌ O módulo corresponde a `GONOSUMDB`
- ❌ `GOSUMDB=off`

## Verificação manual

Você pode verificar manualmente um módulo usando:

```bash
# Verificar se o módulo está no checksum database
go mod verify

# Para Go 1.12 ou anterior, use a ferramenta gosumcheck
go get golang.org/x/mod/gosumcheck
gosumcheck /caminho/para/go.sum
```

## Histórico

| Versão | Data | Mudança |
|--------|------|---------|
| Go 1.13 | Agosto 2019 | Lançamento oficial do sum.golang.org como produção |
| Go 1.12 | Fevereiro 2019 | Suporte experimental via `GOSUMDB` |

## Comparação: go.sum vs Checksum Database

| Característica | go.sum | Checksum Database |
|----------------|--------|-------------------|
| **Escopo** | Local do projeto | Global (todos os desenvolvedores) |
| **Verificação** | Primeira vez: nenhuma | Sempre contra fonte de verdade |
| **Segurança** | Confiança no primeiro uso | Verificação criptográfica |
| **Detecta** | Mudanças locais | Mudanças globais + ataques direcionados |
| **Estrutura** | Arquivo texto simples | Merkle tree (Transparent Log) |

## Recursos adicionais

- [Go Blog: Module Mirror and Checksum Database](https://go.dev/blog/module-mirror-launch)
- [Documentação Oficial: Checksum Database](https://go.dev/ref/mod#checksum-database)
- [Trillian Project](https://github.com/google/trillian)
- [sum.golang.org](https://sum.golang.org)

## Perguntas frequentes

### Meus módulos privados são enviados para sum.golang.org?

**Não**. Módulos que correspondem a `GOPRIVATE` ou `GONOSUMDB` nunca são consultados no checksum database. O servidor nunca vê seus módulos privados.

### O que acontece se sum.golang.org estiver fora do ar?

O comando `go` tentará usar checksums já presentes em `go.sum`. Para novos módulos, a operação falhará até que o serviço volte. Você pode configurar um mirror ou, em último caso, usar `GOSUMDB=off` temporariamente.

### Posso hospedar meu próprio checksum database?

Sim! Você pode configurar sua própria instância usando ferramentas como [Athens](https://docs.gomods.io/) ou implementar um servidor compatível com o protocolo do sumdb.

### O checksum database conhece todo o código do meu projeto?

Não. O database apenas armazena **hashes** criptográficos. Ele não tem acesso ao código-fonte, apenas aos checksums e metadados de módulos públicos.
