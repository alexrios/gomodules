# Seleção de versão

Se você adicionar um import que ainda não é atendido pelos requisitos do `go.mod`, use `go get <pacote>@<versão>` ou `go mod tidy` para registrar a dependência. Desde Go 1.16, `go build` e `go test` não adicionam esses requisitos automaticamente.

Por exemplo, `go get example.com/lib@v1.2.3` registra um requisito para esse módulo. A versão selecionada pode ser maior se outra dependência exigir uma versão mais nova do mesmo caminho de módulo.

O algoritmo de "seleção de versão mínima" é usado para selecionar as versões de todos os módulos usados durante o build. Para cada módulo em um build, a versão selecionada pela "seleção de versão mínima" é sempre a semanticamente mais alta das versões explicitamente listadas por uma diretiva **require** no módulo principal ou em uma de suas dependências.



