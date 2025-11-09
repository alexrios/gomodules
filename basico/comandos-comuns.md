# Comandos comuns

## Gerenciamento de Dependências

### Comandos Básicos

* `go mod init <module-path>` — Inicializa um novo módulo no diretório atual
* `go mod tidy` — Adiciona dependências faltantes e remove dependências não utilizadas do `go.mod` e `go.sum`
* `go get <module>@<version>` — Adiciona, atualiza ou remove uma dependência
  * `go get foo@v1.2.3` — Versão específica
  * `go get foo@latest` — Última versão estável
  * `go get foo@none` — Remove a dependência (Go 1.17+)
  * `go get -u foo` — Atualiza para a versão minor ou patch mais recente
  * `go get -u ./...` — Atualiza todas as dependências diretas e indiretas

### Visualização e Inspeção

* `go list -m all` — Lista todos os módulos que são dependências do projeto atual
* `go list -u -m all` — Ver as atualizações minor e patch disponíveis para todas as dependências diretas ou indiretas
* `go list -m -versions <module>` — Lista todas as versões disponíveis de um módulo
* `go list -m -json all` — Exporta informações de módulos em formato JSON (Go 1.25+)
* `go mod graph` — Imprime o gráfico de dependências do módulo
* `go mod why -m <module>` — Explica por que um módulo é necessário

### Verificação e Download

* `go mod verify` — Verifica as dependências não foram modificadas desde o download
* `go mod download` — Baixa módulos para o cache local sem adicioná-los ao `go.mod`
* `go mod download -json <module>` — Baixa e retorna informações em JSON

## Workspace Mode (Go 1.18+)

* `go work init <módulos...>` — Inicializa um novo workspace com múltiplos módulos
* `go work use <diretório>` — Adiciona um módulo ao workspace
* `go work use -r .` — Adiciona recursivamente todos os módulos encontrados no diretório atual
* `go work edit` — Edita o arquivo go.work
* `go work sync` — Sincroniza as dependências do workspace com os módulos
* `go work vendor` — Cria o diretório vendor a partir do workspace (Go 1.22+)

## Build e Teste

* `go build ./...` — Build de todos os pacotes no módulo (a partir do diretório raiz)
* `go test ./...` — Executa testes de todos os pacotes no módulo
* `go build -o <output> <pacote>` — Build com nome de saída específico
* `go install <pacote>@<versão>` — Instala um programa em `$GOPATH/bin` (Go 1.16+)

{% hint style="info" %}
**Desde Go 1.16**, comandos de build (`go build`, `go test`) **não modificam mais** automaticamente o `go.mod`. Use `go mod tidy` ou `go get` para adicionar dependências.
{% endhint %}

## Vendoring

* `go mod vendor` — Cria o diretório `vendor` com as dependências
* `go build -mod=vendor` — Força o build a usar o diretório vendor
* `go mod vendor -e` — Continua mesmo se houver erros

## Limpeza e Manutenção

* `go clean -modcache` — Limpa o cache de módulos (`$GOPATH/pkg/mod`)
* `go mod edit -require=<module>@<versão>` — Edita o `go.mod` sem baixar o módulo
* `go mod edit -replace=<old>=<new>` — Adiciona uma diretiva replace
* `go mod edit -dropreplace=<old>` — Remove uma diretiva replace
* `go mod edit -exclude=<module>@<versão>` — Exclui uma versão específica de um módulo
* `go mod edit -retract=<versão>` — Retrai uma versão publicada (Go 1.16+)

## Documentação

* `go doc <pacote>` — Mostra a documentação de um pacote
* `go doc <pacote>.<symbol>` — Mostra documentação de um símbolo específico
* `go doc -http :8080` — Inicia um servidor de documentação local (Go 1.25+)

## Padrões de pacotes úteis

* `./...` — Todos os pacotes no módulo atual e subdiretórios
* `all` — Todos os pacotes em todos os módulos da build list (Go 1.16+: mudou comportamento)
* `work` — Todos os pacotes nos módulos do workspace (Go 1.25+)
* `std` — Todos os pacotes da biblioteca padrão

## Variáveis de ambiente importantes

* `GOPROXY` — URL do proxy de módulos (padrão: `https://proxy.golang.org,direct`)
* `GOPRIVATE` — Padrão de módulos privados (não usar proxy nem checksum database)
* `GOSUMDB` — Servidor do checksum database (padrão: `sum.golang.org`)
* `GOMODCACHE` — Localização do cache de módulos (padrão: `$GOPATH/pkg/mod`)
* `GOVCS` — Controla quais sistemas de controle de versão o Go pode usar (Go 1.16+)
* `GOAUTH` — Configuração de autenticação para módulos privados (Go 1.24+)
* `GOTOOLCHAIN` — Controla seleção automática de toolchain (Go 1.21+)

## Flags úteis

* `-mod=readonly` — Não permite modificações no `go.mod`
* `-mod=vendor` — Usa o diretório vendor ao invés de baixar dependências
* `-mod=mod` — Permite modificações no `go.mod` (comportamento padrão pré-1.16)
* `-json` — Saída em formato JSON (disponível em vários comandos desde Go 1.24+)
* `-modcacherw` — Deixa arquivos do cache de módulos com permissão de escrita
* `-modfile=<arquivo>` — Usa um arquivo go.mod alternativo

## Exemplos práticos

### Adicionar uma dependência

```bash
# Adiciona a versão mais recente
go get github.com/gin-gonic/gin@latest

# Atualiza go.mod e go.sum
go mod tidy
```

### Atualizar todas as dependências

```bash
# Ver atualizações disponíveis
go list -u -m all

# Atualizar todas para versões minor/patch
go get -u ./...

# Limpar dependências não utilizadas
go mod tidy
```

### Trabalhar com múltiplos módulos localmente

```bash
# Criar um workspace
go work init ./module1 ./module2

# Adicionar um módulo ao workspace
go work use ./module3

# Build usando o workspace
go build ./...
```

### Usar um fork ou versão local de uma dependência

```bash
# Via linha de comando
go mod edit -replace github.com/original/repo=github.com/myfork/repo@v1.2.3

# Ou para desenvolvimento local
go mod edit -replace github.com/original/repo=../path/to/local/repo

# Não esqueça de rodar
go mod tidy
```

### Verificar integridade das dependências

```bash
# Verifica checksums
go mod verify

# Baixa e verifica todas as dependências
go mod download
go mod verify
```

## Recursos adicionais

* [Documentação Oficial: go command](https://pkg.go.dev/cmd/go)
* [Go Modules Reference](https://go.dev/ref/mod)
* [Go Module Proxy](https://proxy.golang.org)
