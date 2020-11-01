# Quando usar replace?

Conforme descrito na seção [go.mod](../novos-conceitos/go.mod.md), as diretivas `replace` fornecem controle adicional no `go.mod` do módulo principal do que é realmente usado para satisfazer uma dependência encontrada nos arquivos `.go` ou `go.mod`, enquanto as diretivas de `replace` em módulos diferentes do módulo principal são ignorados na construção.

A diretiva `replace` permite que você forneça outro caminho de importação \(import path\) que pode ser outro módulo localizado no VCS \(GitHub ou outro lugar\), ou em seu sistema de arquivos local com um caminho de arquivo relativo ou absoluto. O novo caminho de importação da diretiva `replace` é usado sem a necessidade de atualizar os caminhos de importação no código-fonte real.

`replace` permite o controle do módulo principal sobre a versão exata usada para uma dependência, como:

* `replace example.com/some/dependency => example.com/some/dependency v1.2.3`

`replace` também permite o uso de um fork de dependência, como:

* `replace example.com/some/dependency => example.com/some/dependency-fork v1.2.3`

Você também pode fazer referência a branches, por exemplo:

* `replace example.com/some/dependency => example.com/some/dependency-fork master`

Um exemplo de caso de uso é: se você precisar corrigir ou investigar algo em uma dependência, pode ter um fork local e adicionar algo como o seguinte em seu `go.mod` do seu módulo principal:

* `replace example.com/original/import/path => /your/forked/import/path`

`replace` também pode ser usado para informar o conjunto de ferramentas `go` da localização relativa ou absoluta no disco dos módulos em um projeto de vários módulos, como:

* `replace example.com/project/foo => ../foo`

{% hint style="warning" %}
se o lado direito de uma diretiva `replace` for um caminho do sistema de arquivos, o destino deve ter um arquivo `go.mod` nesse local. Se o arquivo `go.mod` não estiver presente, você pode criar um com `go mod init`.
{% endhint %}

{% hint style="info" %}
Em geral, você tem a opção de especificar uma versão à esquerda de =&gt; em uma diretiva `replace`, mas normalmente é menos sensível a alterações se você omitir isso \(por exemplo, como feito em todos os exemplos de substituição acima\).
{% endhint %}

Você pode confirmar que está obtendo as versões esperadas executando `go list -m all`, que mostra as versões finais reais que serão usadas em sua construção, incluindo a consideração de instruções de `replace`.

{% hint style="danger" %}
No Go 1.11, para dependências diretas, uma diretiva `require` é necessária mesmo se for feito um `replace`. Por exemplo, se `foo` é uma dependência direta, você não pode `replace foo => ../foo` sem um `require` correspondente para `foo`. Se você não tiver certeza de qual versão usar na diretiva `require`, você pode frequentemente usar `v0.0.0`, como `require foo v0.0.0`. Isso foi corrigido na versão 1.12 com [\#26241](https://golang.org/issue/26241).
{% endhint %}

Consulte o próximo FAQ para obter os detalhes de como usar `replace` para funcionar inteiramente fora do versionador de código.





