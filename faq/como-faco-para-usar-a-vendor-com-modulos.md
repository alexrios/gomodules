# Como faço para usar a "vendor" com módulos?

Para usar a vendor com módulos:

* `go mod vendor` redefine o diretório do vendor do módulo principal para incluir todos os pacotes necessários para construir e testar todos os pacotes do módulo com base no estado dos arquivos `go.mod` e do código-fonte `.go`. 
* Desde Go 1.14, se existe um diretório `vendor` na raiz e o `go.mod` declara `go 1.14` ou superior, comandos como `go build` usam esse diretório automaticamente.
* A flag `-mod=vendor` (por exemplo, `go build -mod=vendor ./...`) escolhe esse modo explicitamente. O Go confere se `vendor/modules.txt` está consistente com os requisitos e substituições do `go.mod`; se houver divergência, execute `go mod vendor` novamente. Diretórios `vendor` de dependências são ignorados.

* Algumas pessoas vão querer optar pelo vendor, para isso deve se definir uma variável de ambiente `GOFLAGS=-mod=vendor`. 

Em um workspace, use `go work vendor` (Go 1.22+) para gerar o `vendor` na raiz do workspace. Para trabalhar apenas no módulo atual, use `GOWORK=off go mod vendor`.

Veja [Vendoring](https://go.dev/ref/mod#vendoring) e [Workspace Mode](../avancado/workspace-mode.md).
