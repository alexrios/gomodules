---
title: "Quando usar replace?"
slug: "faq/quando-usar-replace"
---

Conforme descrito na seção [go.mod](/novos-conceitos/go.mod/), as diretivas `replace` fornecem controle adicional no `go.mod` do módulo principal do que é realmente usado para satisfazer uma dependência encontrada nos arquivos `.go` ou `go.mod`, enquanto as diretivas de `replace` em módulos diferentes do módulo principal são ignorados na construção.

A diretiva `replace` permite que você forneça outro caminho de importação \(import path\) que pode ser outro módulo localizado no VCS \(GitHub ou outro lugar\), ou em seu sistema de arquivos local com um caminho de arquivo relativo ou absoluto. O novo caminho de importação da diretiva `replace` é usado sem a necessidade de atualizar os caminhos de importação no código-fonte real.

`replace` permite o controle do módulo principal sobre a versão exata usada para uma dependência, como:

* `replace example.com/some/dependency => example.com/some/dependency v1.2.3`

`replace` também permite o uso de um fork de dependência, como:

* `replace example.com/some/dependency => example.com/some/dependency-fork v1.2.3`

Você também pode fazer referência a branches, por exemplo:

```bash
versao=$(go list -m -f '{{.Version}}' example.com/some/dependency-fork@master)
go mod edit -replace=example.com/some/dependency=example.com/some/dependency-fork@"$versao"
```

O `go list` consulta a branch e retorna uma versão canônica, que pode ser uma pseudo-versão. O `go mod edit` grava essa versão na substituição. O nome `master` não deve permanecer como versão em um `go.mod` publicado.

Um exemplo de caso de uso é: se você precisar corrigir ou investigar algo em uma dependência, pode ter um fork local e adicionar algo como o seguinte em seu `go.mod` do seu módulo principal:

* `replace example.com/original/import/path => /your/forked/import/path`

`replace` também pode ser usado para informar o conjunto de ferramentas `go` da localização relativa ou absoluta no disco dos módulos em um projeto de vários módulos, como:

* `replace example.com/project/foo => ../foo`

:::caution
se o lado direito de uma diretiva `replace` for um caminho do sistema de arquivos, o destino deve ter um arquivo `go.mod` nesse local. Se o arquivo `go.mod` não estiver presente, você pode criar um com `go mod init`.
:::

:::note
Em geral, você tem a opção de especificar uma versão à esquerda de =&gt; em uma diretiva `replace`, mas normalmente é menos sensível a alterações se você omitir isso \(por exemplo, como feito em todos os exemplos de substituição acima\).
:::

Você pode confirmar que está obtendo as versões esperadas executando `go list -m all`, que mostra as versões finais reais que serão usadas em sua construção, incluindo a consideração de instruções de `replace`.

:::note
Uma diretiva `replace` sozinha não adiciona um módulo ao grafo de dependências. Para usar o pacote substituído, mantenha um requisito `require` correspondente, diretamente ou por uma dependência. Para uma substituição local de um módulo v0 ou v1, `v0.0.0` pode servir como versão nesse requisito.
:::

Veja o [FAQ sobre trabalho sem versionador de código](/faq/posso-trabalhar-totalmente-sem-um-versionador-de-codigo-em-meu-sistema-de-arquivos-local/). Para desenvolver vários módulos juntos, também existe o [Workspace Mode](/avancado/workspace-mode/), disponível desde Go 1.18.





