# Como faço para usar a "vendor" com módulos?

Para usar a vendor com módulos:

* `go mod vendor` redefine o diretório do vendor do módulo principal para incluir todos os pacotes necessários para construir e testar todos os pacotes do módulo com base no estado dos arquivos `go.mod` e do código-fonte `.go`. 
* Por padrão, os comandos go, como `go build`, ignoram o diretório vendor. 
* Usando a flag  `-mod=vendor` \(por exemplo, `go build -mod=vendor`\) instrui os comandos go a usar o diretório `vendor` da raiz do módulo principal para satisfazer as dependências. Os comandos go neste modo, portanto, ignoram as descrições de dependência em `go.mod` e presumem que o diretório do fornecedor contém as cópias corretas das dependências. Observe que apenas o diretório vendor na raiz do módulo principal é usado; diretórios vendor em outros locais ainda são ignorados. 
* Algumas pessoas vão querer optar pelo vendor, para isso deve se definir uma variável de ambiente `GOFLAGS=-mod=vendor`. 

Se você está pensando em usar vendor, vale a pena ler as seções ["Modules and vendoring"](https://tip.golang.org/cmd/go/#hdr-Modules_and_vendoring) and ["Make vendored copy of dependencies"](https://tip.golang.org/cmd/go/#hdr-Make_vendored_copy_of_dependencies) da documentação de dicas.

