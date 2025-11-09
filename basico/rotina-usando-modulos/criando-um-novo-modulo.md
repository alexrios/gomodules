# Criando um novo módulo

Vamos criar um novo módulo.

Crie um novo diretório vazio em qualquer lugar do seu sistema de arquivos (desde Go 1.16, não é mais necessário se preocupar com $GOPATH), vá até esse diretório e, em seguida, crie um novo arquivo, `hello.go`:

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

Neste ponto, o diretório contém um pacote, mas não um módulo, porque não há um arquivo `go.mod`.

{% hint style="warning" %}
**Desde Go 1.16**, é obrigatório ter um arquivo `go.mod` para trabalhar com Go. Se você tentar executar `go test` sem um `go.mod`, receberá um erro.
{% endhint %}

Se estivéssemos trabalhando em /home/gopher/hello e executássemos o teste sem um `go.mod`, veríamos um erro solicitando que você execute `go mod init` primeiro.

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

go 1.25
$
```

{% hint style="info" %}
A diretiva `go` no arquivo `go.mod` indica a versão mínima do Go necessária para compilar este módulo. Desde Go 1.21, o Go pode automaticamente baixar e usar a versão correta do toolchain se necessário.
{% endhint %}

