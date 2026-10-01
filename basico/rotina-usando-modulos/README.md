# Rotina usando módulos

Seu fluxo de trabalho para um dia típico:

* Adicione os imports nos seus arquivo `.go` conforme necessidade.
* Use `go get <pacote>@<versão>` para adicionar uma dependência ou escolher sua versão.
* Execute `go mod tidy` para ajustar os requisitos aos imports.
* Execute `go test ./...` e `go build ./...` para verificar o resultado.

{% hint style="warning" %}
**Mudança importante desde Go 1.16**: Comandos de build como `go build`, `go test` e `go run` **não modificam mais automaticamente** o arquivo `go.mod`. Para adicionar ou atualizar dependências, use `go get` ou `go mod tidy`.
{% endhint %}

Haverá momentos onde será necessário escolher versões especificas da dependência. Em casos como esses use `go get <pacote>@<versão>`.

O formato do comando go get é `<nome-do-modulo>@<versão>`

```bash
# Adicionar ou atualizar uma dependência específica
$ go get foo@v1.2.3

# Adicionar a versão mais recente
$ go get foo@latest

# Adicionar uma versão específica de branch
$ go get foo@master

# Remover uma dependência (Go 1.17+)
$ go get foo@none
```

**Comandos úteis para gerenciar dependências:**

```bash
# Adicionar dependências faltantes e remover não utilizadas
$ go mod tidy

# Atualizar uma dependência para a versão mais recente
$ go get -u foo

# Atualizar dependências dos pacotes do módulo, incluindo indiretas
$ go get -u ./...

# Verificar atualizações disponíveis
$ go list -u -m all
```

{% hint style="warning" %}
Também é possível alterar o arquivo `go.mod` diretamente, caso necessário. Em todo caso, de preferência para que os comandos `go` façam as alterações no arquivo.
{% endhint %}



