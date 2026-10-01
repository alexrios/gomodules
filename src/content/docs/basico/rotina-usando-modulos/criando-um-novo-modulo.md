---
title: "Criando um novo módulo"
slug: "basico/rotina-usando-modulos/criando-um-novo-modulo"
---

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

:::caution
**Desde Go 1.16**, o modo de módulos é o padrão. Neste tutorial, `go test` precisa de um `go.mod` no diretório atual ou em um diretório pai. O modo GOPATH ainda existe com `GO111MODULE=off`, mas vamos trabalhar com módulos.
:::

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

:::tip
Parabéns! Você escreveu e testou seu primeiro módulo.
:::

Executando o exemplo com Go 1.27.1, o comando `go mod init` escreveu um arquivo go.mod:

```text
$ cat go.mod
module example.com/hello

go 1.27.1
$
```

:::note
A diretiva `go` no arquivo `go.mod` indica a versão mínima do Go necessária para compilar este módulo. Desde Go 1.21, o Go pode automaticamente baixar e usar a versão correta do toolchain se necessário.
:::

No Go 1.27, essa linha começa com a versão do toolchain que executou `go mod init`, incluindo o patch. Se você precisa atender uma versão anterior, pode ajustar o requisito com `go get go@1.26.0` e testar com essa versão. O código e as dependências também precisam ser compatíveis com ela.

As notas do Go 1.26 descrevem um padrão diferente, que escolhia uma versão anterior. Essa mudança foi revertida no Go 1.27. Veja os detalhes no [histórico dessas versões](/releases/1.26-1.27/).
