# Comandos comuns

* `go list -u -m all` — Ver as as atualizações minor e patch disponíveis para todas as dependências diretas ou indiretas \([detalhes](../novos-conceitos/selecao-de-versao.md)\)
* `go get -u ./...` or `go get -u=patch ./...` \(no diretório raiz do módulo\) — Atualiza todas as dependências diretas e indiretas para a última atualização minor ou patch \(pre-releases são  ignoradas\) \([details](https://github.com/golang/go/wiki/Modules#how-to-upgrade-and-downgrade-dependencies)\)
* `go build ./...` or `go test ./...` \(from module root directory\) — Build or test de todos os pacotes no módulo \([details](https://github.com/golang/go/wiki/Modules#how-to-define-a-module)\)
* `go mod tidy` — Retira qualquer dependência que não é mais necessária do `go.mod` e adiciona as dependências necessárias para outras combinações de Sistema Operacional, arquitetura e build tags \([details](https://github.com/golang/go/wiki/Modules#how-to-prepare-for-a-release)\)
* `replace` directive or `gohack` — Usa um fork, cópia local ou uma versão exata da dependência \([details](https://github.com/golang/go/wiki/Modules#when-should-i-use-the-replace-directive)\)
* `go mod vendor` — Passo opcional para criar o diretório `vendor` \([details](https://github.com/golang/go/wiki/Modules#how-do-i-use-vendoring-with-modules-is-vendoring-going-away)\)

