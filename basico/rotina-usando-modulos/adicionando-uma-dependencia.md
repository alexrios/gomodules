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

Agora vamos fazer o teste:

```text
$ go test
go: finding rsc.io/quote v1.5.2
go: downloading rsc.io/quote v1.5.2
go: extracting rsc.io/quote v1.5.2
go: finding rsc.io/sampler v1.3.0
go: finding golang.org/x/text v0.0.0-20170915032832-14c0d48ead0c
go: downloading rsc.io/sampler v1.3.0
go: extracting rsc.io/sampler v1.3.0
go: downloading golang.org/x/text v0.0.0-20170915032832-14c0d48ead0c
go: extracting golang.org/x/text v0.0.0-20170915032832-14c0d48ead0c
PASS
ok  	example.com/hello	0.023s
$
```

O comando go resolve importações usando as versões de módulo de dependência específicas listadas em `go.mod`. Ao encontrar um import de um pacote não fornecido por nenhum módulo em `go.mod`, o comando `go` procura automaticamente o módulo que contém esse pacote e o adiciona a `go.mod`, usando a versão mais recente. 

{% hint style="info" %}
“Mais recente” é definido como a versão estável mais recente tageada \(não pre-release\), ou então a versão pre-release tageada mais recente, ou então a versão não tageada mais recente.\) 
{% endhint %}

Em nosso exemplo, `go test` resolveu a nova importação `rsc.io/quote` para o módulo `rsc.io/quote v1.5.2`. :

```text
$ cat go.mod
module example.com/hello

go 1.12

require rsc.io/quote v1.5.2
$
```

{% hint style="warning" %}
Apenas dependências diretas são registradas no arquivo go.mod. 

Por isso motivo, mesmo tendo baixado duas dependências usadas por`rsc.io/quote`, nesse caso, `rsc.io/sampler` e `golang.org/x/text`, as mesmas não serão listadas no arquivo `go.mod`.
{% endhint %}

Um segundo comando `go test` não repetirá este trabalho, uma vez que o `go.mod` agora está atualizado e os módulos baixados são armazenados em cache local \(em `$GOPATH/pkg/mod`\):

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

