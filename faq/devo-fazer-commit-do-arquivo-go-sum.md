# Devo fazer commit do arquivo 'go.sum'?

Tipicamente seu arquivo `go.sum` deve ser _commitado_ junto com seu arquivo go.mod.

   - `go.sum` contém os _checksums_ criptográficos esperados do conteúdo de versões de módulos específicas.
   - Se alguém clonar seu repositório e fizer download das suas dependências utilizando o comando `go`, essa pessoa receberá um erro se houver alguma discrepância entre as cópias baixadas de suas dependências e as entradas correspondentes no arquivo `go.sum`.
   - Além disso, `go mod verify` verifica se as cópias cacheadas em disco dos downloads dos módulos ainda batem com as entradas no arquivo `go.sum`.
   - Note que `go.sum` não é um arquivo de _lock_!


