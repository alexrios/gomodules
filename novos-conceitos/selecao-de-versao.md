# Seleção de versão

Se você adicionar um novo import ao seu código-fonte que ainda não é coberta por um **require** no arquivo `go.mod`, a maioria dos comandos go como `go build` e `go test` irão automaticamente procurar o módulo apropriado e adicionar a versão mais recente da nova dependência direta ao `go.mod` do seu módulo como uma diretiva **require**.   
  
Por exemplo, se sua nova importação corresponde à dependência M cuja última versão de lançamento marcada é v1.2.3, o go.mod do seu módulo terminará com require M v1.2.3, o que indica que o módulo M é uma dependência com a versão permitida &gt;= v1.2.3 \(e &lt;v2, dado que v2 é considerado incompatível com v1\).

O algoritmo de "seleção de versão mínima" é usado para selecionar as versões de todos os módulos usados durante o build. Para cada módulo em um build, a versão selecionada pela "seleção de versão mínima" é sempre a semanticamente mais alta das versões explicitamente listadas por uma diretiva **require** no módulo principal ou em uma de suas dependências.



