# Adicionando uma dependência em uma nova versão principal \(major\)

Vamos adicionar uma nova função ao nosso pacote: func Proverb retorna um provérbio de simultaneidade Go, chamando quote.Concurrency, que é fornecido pelo módulo rsc.io/quote/v3. Primeiro, atualizamos hello.go para adicionar a nova função:



```go
package hello

import (
    "rsc.io/quote"
    quoteV3 "rsc.io/quote/v3"
)

func Hello() string {
    return quote.Hello()
}

func Proverb() string {
    return quoteV3.Concurrency()
}
```

Em seguida, adicionamos um teste a hello\_test.go:

```go
func TestProverb(t *testing.T) {
    want := "Concurrency is not parallelism."
    if got := Proverb(); got != want {
        t.Errorf("Proverb() = %q, want %q", got, want)
    }
}
```

Então podemos testar nosso código:

```text
$ go test
go: finding rsc.io/quote/v3 v3.1.0
go: downloading rsc.io/quote/v3 v3.1.0
go: extracting rsc.io/quote/v3 v3.1.0
PASS
ok  	example.com/hello	0.024s
$
```

Observe que nosso módulo agora depende de rsc.io/quote e rsc.io/quote/v3:

```text
$ go list -m rsc.io/q...
rsc.io/quote v1.5.2
rsc.io/quote/v3 v3.1.0
$
```

Cada versão principal diferente \(v1, v2 e assim por diante\) de um módulo `go` usa um caminho de módulo diferente: começando na `v2`, o caminho deve terminar na versão principal. No exemplo, `v3` de `rsc.io/quote` não é mais `rsc.io/quote`: em vez disso, é identificado pelo caminho do módulo `rsc.io/quote/v3`. Essa convenção é chamada de **versionamento de importação semântica** e dá nomes diferentes aos pacotes incompatíveis \(aqueles com versões principais diferentes\). Em contraste, `v1.6.0` de `rsc.io/quote` deve ser compatível com versões anteriores com `v1.5.2`, portanto, ele reutiliza o nome `rsc.io/quote`. \(Na seção anterior, `rsc.io/sampler` `v1.99.99` deveria ter compatibilidade retroativa com `rsc.io/sampler v1.3.0`, mas bugs ou suposições incorretas do cliente sobre o comportamento do módulo podem ocorrer.\)

O comando `go` permite que uma compilação inclua no máximo uma versão de qualquer caminho de módulo específico, ou seja, no máximo um de cada versão principal: um `rsc.io/quote`, um `rsc.io/quote/v2`, um `rsc.io/quote/v3` e assim por diante.   
  
Isso dá aos autores do módulo uma regra clara sobre a possível duplicação de um único caminho do módulo:  é impossível para um programa construir com `rsc.io/quote v1.5.2` e `rsc.io/quote v1.6.0`.   
  
Ao mesmo tempo, permitir diferentes versões principais de um módulo \(porque eles têm caminhos diferentes\) dá aos consumidores do módulo a capacidade de atualizar para uma nova versão principal de forma incremental.   
  
Neste exemplo, queríamos usar `quote.Concurrency` de `rsc/quote/v3 v3.1.0`, mas ainda não estamos prontos para migrar nossos usos de `rsc.io/quote v1.5.2`. A capacidade de migrar incrementalmente é especialmente importante em um programa grande ou base de código.

