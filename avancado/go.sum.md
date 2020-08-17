# go.sum

O arquivo `go.sum` tem os hashes criptograficos esperados do conteúdo esperado de uma versão especifica de um módulo.

O comando go usa o arquivo `go.sum` para garantir que os downloads futuros desses módulos recuperem os mesmos bits do primeiro download, para garantir que os módulos dos quais seu projeto depende não mudem inesperadamente, seja por motivos maliciosos, acidentais ou outros. `go.mod` e `go.sum` **devem** ser commitados no controle de versão.

### Anatomia do go.sum

`<module> <version>[/go.mod] <hash>`  
  
A primeira linha fornece o hash da árvore de arquivos da versão do módulo

`rsc.io/quote v1.5.2 h1:w5fcysjrx7yqtD/aO+QwRjYZOKnaM9Uh2b40tElTs3Y=`  
  
A segunda linha anexa `/go.mod` à versão e fornece o hash apenas do arquivo go.mod da versão do módulo.

`rsc.io/quote v1.5.2/go.mod h1:LzX7hefJvL54yjefDEDHNONDjII0t9xZLPXsUe+TKr0=`

#### Algoritimo de hash

O hash do `go.mod` permite baixar e autenticar o arquivo `go.mod` de uma versão do módulo necessário para calcular o grafo de dependências, sem precisar baixar todo o código-fonte do módulo.

O hash começa com um prefixo de algoritmo no formato `h<N>:`. O prefixo de algoritmo definido é `h1:`, que usa SHA-256.

