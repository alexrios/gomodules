# Criando um novo módulo

Vamos criar um novo módulo.

Crie um novo diretório vazio \(em algum lugar fora de $GOPATH/src\), vá até esse diretório e, em seguida, crie um novo arquivo, `hello.go`:

```go
package hello

func Hello() string {
    return "Hello, world."
}
```

Vamos escrever um teste também em hello\_test.go:

```go
package hello

import "testing"

func TestHello(t *testing.T) {
    want := "Hello, world."
    if got := Hello(); got != want {
        t.Errorf("Hello() = %q, want %q", got, want)
    }
}
```

Neste ponto, o diretório contém um pacote, mas não um módulo, porque não há um arquivo `go.mod`. Se estivéssemos trabalhando em /home/gopher/hello e executássemos o teste agora, veríamos:

```bash
$ go test
PASS
ok  	_/home/gopher/hello	0.020s
$
```

A última linha resume o teste geral do pacote. Como estamos trabalhando fora do $GOPATH e também fora de qualquer módulo, o comando `go` não conhece o caminho de importação \(import path\) para o diretório atual e cria um falso com base no nome do diretório: `_/home/gopher/hello`.

Vamos tornar o diretório atual a raiz de um módulo usando `go mod init` e, em seguida, tente `go test` novamente:

```text
$ go mod init example.com/hello
go: creating new go.mod: module example.com/hello
$ go test
PASS
ok  	example.com/hello	0.020s
$
```

{% hint style="success" %}
Parabéns! Você escreveu e testou seu primeiro módulo.
{% endhint %}

O comando `go mod init` escreveu um arquivo go.mod:

```text
$ cat go.mod
module example.com/hello

go 1.12
$
```

