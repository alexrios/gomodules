# Meu primeiro módulo

No fim dessa seção você deverá ser capaz de:

* Criar um novo respositório GIT
* Inicializar um novo módulo
* Enviar o seu novo módulo para o Github

## Começando um projeto no github

Crie um novo diretório

```
$ mkdir -p /tmp/scratchpad/repo
```

Vá até o diretório

```bash
$ cd /tmp/scratchpad/repo
```

Inicialize o seu repositório GIT

```bash
$ git init -q
```

Adicione a origem remota.

```bash
$ git remote add origin https://github.com/my/repo
```

## Inicializando um novo módulo

```bash
$ go mod init github.com/my/repo

go: creating new go.mod: module github.com/my/repo
```

## Adicionando código

```bash
$ cat <<EOF > hello.go
package main

import (
    "fmt"
    "rsc.io/quote"
)

func main() {
    fmt.Println(quote.Hello())
}
EOF
```

#### Build and run

```text
$ go build -o hello
$ ./hello

Hello, world.
```

{% hint style="info" %}
O arquivo`go.mod` foi atualizado para incluir a versão `v1.5.2`explicitamente.
{% endhint %}

```text
$ cat go.mod

module github.com/my/repo

require rsc.io/quote v1.5.2
```

