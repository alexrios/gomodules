---
title: "Atualizando dependências"
slug: "basico/rotina-usando-modulos/atualizando-dependencias"
---

Com os módulos, as versões são referenciadas com tags de versão semântica. Uma versão semântica tem três partes: principal, secundária e patch.   
Por exemplo, para v0.1.2:

* a versão principal é 0 \(MAJOR\)
* a versão secundária é 1 \(MINOR\) 
* a versão do patch é 2 \(PATCH\)

Na próxima seção, consideraremos uma atualização de versão principal.

Pela saída de `go list -m all`, podemos ver que estamos usando uma versão não tageada de golang.org/x/text. Vamos escolher uma versão tageada, `v0.23.0`, e testar se tudo ainda funciona. A versão é fixa para reproduzir este tutorial; no seu projeto, `@latest` consulta a versão mais recente:

```text
$ go get golang.org/x/text@v0.23.0
$ go mod tidy
$ go test
PASS
ok  	example.com/hello	0.013s
$
```

Uau! Tudo passando. Vamos dar outra olhada em `go list -m all` e no arquivo `go.mod`:

```text
$ go list -m all
example.com/hello
golang.org/x/text v0.23.0
rsc.io/quote v1.5.2
rsc.io/sampler v1.3.0
$ cat go.mod
module example.com/hello

go 1.27.1

require rsc.io/quote v1.5.2

require (
    golang.org/x/text v0.23.0 // indirect
    rsc.io/sampler v1.3.0 // indirect
)
$
```

O pacote `golang.org/x/text` foi atualizado para a versão tageada escolhida \(`v0.23.0`\). O arquivo `go.mod` também foi atualizado para especificar a `v0.23.0`. O comentário `indirect` indica que uma dependência não é usada diretamente por este módulo, apenas indiretamente por outras dependências do módulo.

Agora, vamos tentar uma atualização de versão secundária de `rsc.io/sampler` para `v1.99.99`. Comece da mesma maneira, executando `go get` e rodando os testes:

```text
$ go get rsc.io/sampler@v1.99.99
$ go test
--- FAIL: TestHello (0.00s)
    hello_test.go:8: Hello() = "99 bottles of beer on the wall, 99 bottles of beer, ...", want "Hello, world."
FAIL
exit status 1
FAIL	example.com/hello	0.014s
$
```

Uh, oh! A falha do teste mostra que essa versão de `rsc.io/sampler` é incompatível com nosso uso. Vamos listar as versões marcadas disponíveis desse módulo:

```text
$ go list -m -versions rsc.io/sampler
rsc.io/sampler v1.0.0 v1.2.0 v1.2.1 v1.3.0 v1.3.1 v1.99.99
$
```

Estávamos usando a `v1.3.0`; `v1.99.99` claramente não é bom. Talvez possamos tentar usar a `v1.3.1` em vez disso:

```text
$ go get rsc.io/sampler@v1.3.1
$ go test
PASS
ok  	example.com/hello	0.022s
$
```

Observe o `@v1.3.1` explícito no argumento `go get`. Use uma versão explícita para escolher a atualização. Sem o sufixo, `go get` usa `@upgrade`: procura a versão mais recente, mas mantém a atual se ela já for mais nova, por exemplo uma pré-release. `@latest` também pode fazer downgrade nesses casos.



