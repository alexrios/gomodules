# go.mod

Um módulo é definido por uma árvore de arquivos `.go` com um arquivo `go.mod` no diretório raiz da árvore. Existem quatro diretivas: `module`, `require`, `replace`, `exclude`.

{% hint style="info" %}
O código-fonte do módulo pode estar localizado fora do GOPATH.
{% endhint %}

### require

Aqui está um arquivo `go.mod` de exemplo que define o módulo `github.com/my/thing`:

```text
module github.com/my/thing

require (
    github.com/some/dependency v1.2.3
    github.com/another/dependency/v4 v4.0.0
)
```

Um módulo declara sua identidade em seu `go.mod` por meio da diretiva de `module`, que fornece o caminho do módulo. Os caminhos de importação \(import paths\) para todos os pacotes em um módulo compartilham o caminho do módulo como um prefixo comum. O caminho do módulo e o caminho relativo de `go.mod` para o diretório de um pacote juntos determinam o caminho de importação de um pacote.

Por exemplo, se você estiver criando um módulo para um repositório `github.com/user/mymod` que conterá dois pacotes com caminhos de importação `github.com/user/mymod/foo` e `github.com/user/mymod/bar`, então a primeira linha em seu arquivo `go.mod` normalmente declararia o caminho do módulo como `module github.com/user/mymod`, e a estrutura em disco correspondente poderia ser:

```text
mymod
|-- bar
|   `-- bar.go
|-- foo
|   `-- foo.go
`-- go.mod
```

No código-fonte, os pacotes são importados usando o caminho completo, incluindo o caminho do módulo. Por exemplo, se em nosso exemplo acima, declaramos a identidade do módulo em `go.mod` como o `module github.com/user/mymod`, um consumidor poderia fazer:

```text
import "github.com/user/mymod/bar"
```

Assim seria importado o pacote `bar` do módulo `github.com/user/mymod`.

### replace e exclude

`exclude` e `replace` as diretivas operam apenas no módulo atual \("principal"\). `exclude` e `replace` em módulos diferentes do módulo principal são ignoradas ao construir o módulo principal. As instruções `exclude` e `replace`, portanto, permitem que o módulo principal controle completamente sobre sua própria construção, sem também estar sujeito a ser controlado por suas dependências. \(Veja o [FAQ](../faq/quando-usar-replace.md) sobre quando usar uma diretiva `replace`\).



