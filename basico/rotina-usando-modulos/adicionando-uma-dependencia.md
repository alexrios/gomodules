# Adicionando uma dependência

A principal motivação para os módulos Go era melhorar a experiência de usar \(ou seja, adicionar uma dependência\) código escrito por outros desenvolvedores.

Vamos atualizar nosso hello.go para importar rsc.io/quote e usá-lo para implementar Hello:



```go
package hello

import "rsc.io/quote"

func Hello() string {
    return quote.Hello()
}
```

Agora vamos fazer o teste:



