# Atualizando dependências

Com os módulos, as versões são referenciadas com tags de versão semântica. Uma versão semântica tem três partes: principal, secundária e patch.   
Por exemplo, para v0.1.2:

* a versão principal é 0 \(MAJOR\)
* a versão secundária é 1 \(MINOR\) 
* a versão do patch é 2 \(PATCH\)

Na próxima seção, consideraremos uma atualização de versão principal.

Pela saída de `go list -m all`, podemos ver que estamos usando uma versão não tageada de golang.org/x/text. Vamos atualizar para a última versão tageada e testar se tudo ainda funciona:

```text
$ go get golang.org/x/text
go: finding golang.org/x/text v0.3.0
go: downloading golang.org/x/text v0.3.0
go: extracting golang.org/x/text v0.3.0
$ go test
PASS
ok  	example.com/hello	0.013s
$
```

Uau! Tudo passando. Vamos dar outra olhada em `go list -m all` e no arquivo `go.mod`:

```text
$ go list -m all
example.com/hello
golang.org/x/text v0.3.0
rsc.io/quote v1.5.2
rsc.io/sampler v1.3.0
$ cat go.mod
module example.com/hello

go 1.12

require (
    golang.org/x/text v0.3.0 // indirect
    rsc.io/quote v1.5.2
)
$
```

O pacote `golang.org/x/text` foi atualizado para a última versão tageada \(`v0.3.0`\). O arquivo `go.mod` também foi atualizado para especificar a `v0.3.0`. O comentário `indirect` indica que uma dependência não é usada diretamente por este módulo, apenas indiretamente por outras dependências do módulo.

Agora, vamos tentar atualizar a versão secundária `rsc.io/sampler`. Comece da mesma maneira, executando `go get` e rodando os testes:

```text
$ go get rsc.io/sampler
go: finding rsc.io/sampler v1.99.99
go: downloading rsc.io/sampler v1.99.99
go: extracting rsc.io/sampler v1.99.99
$ go test
--- FAIL: TestHello (0.00s)
    hello_test.go:8: Hello() = "99 bottles of beer on the wall, 99 bottles of beer, ...", want "Hello, world."
FAIL
exit status 1
FAIL	example.com/hello	0.014s
$
```

Uh, oh! A falha do teste mostra que a versão mais recente de `rsc.io/sampler` é incompatível com nosso uso. Vamos listar as versões marcadas disponíveis desse módulo:

```text
$ go list -m -versions rsc.io/sampler
rsc.io/sampler v1.0.0 v1.2.0 v1.2.1 v1.3.0 v1.3.1 v1.99.99
$
```

Estávamos usando a `v1.3.0`; `v1.99.99` claramente não é bom. Talvez possamos tentar usar a `v1.3.1` em vez disso:

```text
$ go get rsc.io/sampler@v1.3.1
go: finding rsc.io/sampler v1.3.1
go: downloading rsc.io/sampler v1.3.1
go: extracting rsc.io/sampler v1.3.1
$ go test
PASS
ok  	example.com/hello	0.022s
$
```

Observe o `@v1.3.1` explícito no argumento `go get`. Em geral, cada argumento passado para `go get` pode assumir uma versão explícita; o padrão é `@latest`, que resolve para a versão mais recente conforme definido anteriormente.



