# Adicionando uma dependência

A principal motivação para os módulos Go era melhorar a experiência de usar \(ou seja, adicionar uma dependência\) código escrito por outros desenvolvedores.

Vamos atualizar nosso `hello.go` para importar `rsc.io/quote` e usá-lo para implementar Hello:

```go
package hello

import "rsc.io/quote"

func Hello() string {
    return quote.Hello()
}
```

`quote.Hello()` escolhe a saudação conforme o idioma do ambiente. Para manter a comparação em inglês, ajuste também o teste:

```go
func TestHello(t *testing.T) {
    t.Setenv("LC_ALL", "en")
    want := "Hello, world."
    if got := Hello(); got != want {
        t.Errorf("Hello() = %q, want %q", got, want)
    }
}
```

Antes de testar, vamos adicionar a dependência. Usaremos uma versão específica para que você possa acompanhar o mesmo exemplo:

```bash
go get rsc.io/quote@v1.5.2
go mod tidy
go test
```

A saída do teste será parecida com esta:

```text
PASS
ok  	example.com/hello	0.023s
```

O comando `go get` registra a versão pedida e os requisitos necessários. Depois, `go mod tidy` ajusta `go.mod` e `go.sum` aos imports do código e dos testes.

{% hint style="info" %}
Para pedir a versão mais recente, use `@latest`. O Go prefere a versão estável mais recente; quando não há uma, considera versões de pré-lançamento e, por último, o commit mais recente. Versões retraídas são desconsideradas nessa consulta.
{% endhint %}

Em nosso exemplo, a importação `rsc.io/quote` é fornecida pelo módulo `rsc.io/quote v1.5.2`. Continuando o módulo criado com Go 1.27.1, teremos:

```text
$ cat go.mod
module example.com/hello

go 1.27.1

require rsc.io/quote v1.5.2

require (
    golang.org/x/text v0.0.0-20170915032832-14c0d48ead0c // indirect
    rsc.io/sampler v1.3.0 // indirect
)
```

{% hint style="info" %}
Desde Go 1.17, o `go.mod` também registra os módulos que fornecem pacotes importados indiretamente. Aqui, `rsc.io/sampler` e `golang.org/x/text` são usados por `rsc.io/quote`, por isso aparecem com `// indirect`.
{% endhint %}

Um segundo comando `go test` pode reutilizar os arquivos do cache de build. Sem argumentos de pacote, ele executa os testes novamente; `go test ./...` também pode reutilizar resultados de testes bem-sucedidos. Os módulos baixados ficam no cache local \(em `$GOPATH/pkg/mod`\):

```text
$ go test
PASS
ok  	example.com/hello	0.020s
$
```

Observe que, embora o comando `go` torne a adição de uma nova dependência rápida e fácil, não é sem custo. Seu módulo agora depende literalmente da nova dependência em áreas críticas, como correção, segurança e licenciamento adequado, apenas para citar alguns.

Como vimos acima, adicionar uma dependência direta geralmente traz outras dependências indiretas também. O comando `go list -m all` lista o módulo atual e todas as suas dependências:

```text
$ go list -m all
example.com/hello
golang.org/x/text v0.0.0-20170915032832-14c0d48ead0c
rsc.io/quote v1.5.2
rsc.io/sampler v1.3.0
$
```

Na saída da `go list`, o módulo atual, também conhecido como módulo principal, é sempre a primeira linha, seguida pelas dependências classificadas pelo caminho do módulo.

A versão `golang.org/x/text v0.0.0-20170915032832-14c0d48ead0c` é um exemplo de uma pseudo-versão, que é a sintaxe da versão do comando go para um commit sem tag especifica.

Além de `go.mod`, o comando `go` mantém um arquivo chamado `go.sum` contendo os hashes criptográficos esperados do conteúdo de versões específicas do módulo:

```text
$ cat go.sum
golang.org/x/text v0.0.0-20170915032832-14c0d48ead0c h1:qgOY6WgZO...
golang.org/x/text v0.0.0-20170915032832-14c0d48ead0c/go.mod h1:Nq...
rsc.io/quote v1.5.2 h1:w5fcysjrx7yqtD/aO+QwRjYZOKnaM9Uh2b40tElTs3...
rsc.io/quote v1.5.2/go.mod h1:LzX7hefJvL54yjefDEDHNONDjII0t9xZLPX...
rsc.io/sampler v1.3.0 h1:7uVkIFmeBqHfdjD+gZwtXXI+RODJ2Wc4O7MPEh/Q...
rsc.io/sampler v1.3.0/go.mod h1:T1hPZKmBbMNahiBKFy5HrXp6adAjACjK9...
$
```

O comando `go` usa o arquivo `go.sum` para garantir que os downloads futuros desses módulos recuperem os mesmos bits do primeiro download, para garantir que os módulos dos quais seu projeto depende não mudem inesperadamente, seja por motivos maliciosos, acidentais ou outros. `go.mod` e `go.sum` **devem** ser commitados no controle de versão.
