---
title: "Go Module Proxy"
slug: "avancado/go-module-proxy"
---

## Go Module Proxy

O [Go Team](http://golang.org) provê alguns serviços através do Google, como um mirror para acelerar o download, um banco de dados com checksums para validação do conteúdo dos módulos e um indice para descoberta de novos módulos.

### O que é um Go Proxy?

É qualquer servidor que aceite uma requisição GET no padrão esperado. um exemplo seria: 

```text
$ GET $GOPROXY/<module>/@v/list
```

Irá retornar uma lista com as versões conhecidas do modulo, sendo uma por linha, veja aqui um exemplo: [https://proxy.golang.org/rsc.io/quote/@v/list](https://proxy.golang.org/rsc.io/quote/@v/list)

#### mod

Agora um ponto interessante a ser analisado é o `.mod` da dependência, que pode ser acessado seguindo o padrão:

```text
$ GET $GOPROXY/<module>/@v/<version>.mod
```

Como, por exemplo: [https://proxy.golang.org/rsc.io/quote/@v/v1.5.1.mod](https://proxy.golang.org/rsc.io/quote/@v/v1.5.1.mod)

#### zip

O download do pacote pode ser feito diretamente através do:

```text
$ GET $GOPROXY/<module>/@v/<version>.zip
```

Como, por exemplo: [https://proxy.golang.org/rsc.io/quote/@v/v1.5.1.zip](https://proxy.golang.org/rsc.io/quote/@v/v1.5.1.zip)

### Para que serve o proxy? 

Do ponto de vista de uso, comandos como `go build` fazem os downloads necessários automaticamente quando os requisitos já estão no `go.mod`. O proxy armazena versões de módulos e pode continuar servindo uma versão mesmo quando o repositório original está indisponível. Isso depende da disponibilidade e da política do proxy.

Os hashes em `go.sum` e no [Checksum Database](/avancado/checksum-database/) permitem detectar alterações no conteúdo recebido. O cache de um proxy não garante que o código seja livre de vulnerabilidades.

### Configurando o proxy

Desde Go 1.13, o padrão é `https://proxy.golang.org,direct`. O [índice de módulos](https://index.golang.org/index) é um serviço separado, usado para descobrir versões publicadas.

```bash
go env GOPROXY

# Configurar outro proxy
go env -w GOPROXY=https://goproxy.cn,direct
```

Com uma vírgula, o Go tenta a próxima entrada apenas quando o proxy responde `404` ou `410`. Com `|`, tenta a próxima entrada em qualquer erro. `direct` significa buscar diretamente no repositório, usando um VCS permitido.

No Go 1.27, módulos são o padrão e não é preciso configurar `GO111MODULE=on`. O download direto via Bazaar (`bzr`) foi removido.

Outro ponto de atenção é caso você tenha a necessidade de utilizar um repositório privado, o go permite o uso da variavel:

```text
go env -w GOPRIVATE="minhaempresa.com"
```

### Mais informações

#### Mais informações sobre o proxy

```text
go help goproxy
```

#### Mais informações sobre as variáveis do go

```text
go help environment
```

