# go.mod

Um módulo é definido por uma árvore de arquivos `.go` com um arquivo `go.mod` no diretório raiz da árvore. Esse arquivo identifica o módulo, declara a versão mínima do Go e registra os requisitos de dependências.

{% hint style="info" %}
O código-fonte do módulo pode estar localizado fora do GOPATH.
{% endhint %}

### Diretivas disponíveis

| Diretiva | Para que serve |
|----------|----------------|
| `module` | Define o caminho do módulo |
| `go` | Declara a versão mínima do Go e a versão da linguagem |
| `toolchain` | Sugere o toolchain para trabalhar no módulo (Go 1.21+) |
| `require` | Declara versões mínimas de dependências |
| `replace` | Substitui um módulo por outra versão ou diretório local |
| `exclude` | Exclui uma versão da seleção de dependências |
| `retract` | Informa que uma versão publicada deve ser evitada (Go 1.16+) |
| `tool` | Registra pacotes de ferramentas (Go 1.24+) |
| `godebug` | Define comportamentos de compatibilidade do runtime e da biblioteca padrão (Go 1.23+) |
| `ignore` | Ignora diretórios ao procurar pacotes com padrões como `./...` (Go 1.25+) |

### go e toolchain

```text
module example.com/projeto

go 1.27.0
toolchain go1.27.1
```

Nesse exemplo, o módulo exige Go 1.27.0 e sugere Go 1.27.1 para o desenvolvimento. A diretiva `toolchain` é considerada quando esse é o módulo principal. Ela permite usar toolchains mais novos; uma dependência não impõe sua sugestão de toolchain ao projeto que a utiliza.

Para alterar as versões, prefira os comandos:

```bash
go get go@1.27.0
go get toolchain@go1.27.1
```

Desde Go 1.21, a versão da linha `go` também precisa atender ao mínimo exigido pelas dependências. No Go 1.27, `go mod init` começa com a versão do toolchain em execução, incluindo o patch.

Veja o capítulo de [Gerenciamento de Toolchains](../avancado/toolchain-management.md).

### require

Aqui está um arquivo `go.mod` de exemplo que define o módulo `github.com/my/thing`:

```text
module github.com/my/thing

go 1.27.0

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

Use `go get` para alterar dependências e `go mod tidy` para ajustar os requisitos aos pacotes usados. Com `go 1.27` ou superior, o `tidy` consolida os requisitos em até dois blocos, separando dependências diretas e indiretas.

### replace e exclude

As diretivas `exclude` e `replace` são consideradas nos módulos principais. As mesmas diretivas em dependências são ignoradas. Em um workspace, os módulos listados em `use` são principais, e um `replace` no `go.work` tem precedência sobre os seus `go.mod`. Veja o [FAQ](../faq/quando-usar-replace.md) sobre quando usar uma diretiva `replace`.

### tool, retract, godebug e ignore

As ferramentas declaradas em `tool` são executadas com `go tool`. Suas versões ficam nos requisitos `require` e participam da mesma seleção de versões das outras dependências. Veja [Tool Dependencies](../avancado/tool-dependencies.md).

Já `retract` serve para avisar quem usa o módulo sobre versões publicadas que devem ser evitadas. Veja [Module Retraction](../avancado/module-retraction.md).

A diretiva `godebug` permite escolher valores padrão de compatibilidade para os programas e testes do módulo. Por exemplo:

```text
godebug default=go1.26
```

Isso ajusta padrões de `GODEBUG`; o compilador e a versão mínima continuam sendo definidos pelas outras configurações. No Go 1.27, uma opção já removida só é aceita nessa diretiva com seu valor definitivo.

Para excluir diretórios da busca de pacotes:

```text
ignore (
    ./generated
    ./examples/legacy
)
```

Esses diretórios deixam de participar de padrões como `./...`, mas continuam incluídos no arquivo zip do módulo. `ignore` não serve para esconder arquivos na publicação.

### Referências

* [Go Modules Reference](https://go.dev/ref/mod#go-mod-file)
* [GODEBUG](https://go.dev/doc/godebug)
* [Novidades do Go 1.26 e 1.27](../releases/1.26-1.27.md)
