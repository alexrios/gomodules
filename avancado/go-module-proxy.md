# Go Module Proxy

O [Go Team](http://golang.org) provê alguns serviços através do Google, como um mirror para acelerar o download, um banco
de dados com checksums para validação do conteúdo dos módulos e um indice para descoberta de novos módulos.

## O que é um Go Proxy?
É qualquer servidor que aceite uma requisição GET no padrão esperado. um exemplo seria:
```http request
GET  $GOPROXY/<module>/@v/list
```
Irá retornar uma lista com as versões conhecidas do modulo, sendo uma por linha, veja aqui um exemplo:  
https://proxy.golang.org/rsc.io/quote/@v/list

### mod
Agora um ponto interessante a ser analisado é o `.mod` da dependência, que pode ser acessado seguindo o padrão: 
```http request
 GET $GOPROXY/<module>/@v/<version>.mod 
```
Como, por exemplo:
https://proxy.golang.org/rsc.io/quote/@v/v1.5.1.mod

### zip
O download do pacote pode ser feito diretamente através do:
```http request
 GET $GOPROXY/<module>/@v/<version>.zip
```
Como, por exemplo:
https://proxy.golang.org/rsc.io/quote/@v/v1.5.1.zip


## Para que serve o proxy?
Do ponto de vista de uso, o go build irá realizar as operações da sessão anterior automaticamente.
Então temos uma situação interessante, o proxy armazena versões de cada pacote, ou seja, se por ventura o pacote original 
sair do ar, suas dependências não irão quebrar e caso alguém injete código malicioso a versão do proxy não é afetada!


## Configurando o proxy
Por padrão o go irá utilizar o repositório [oficial](https://index.golang.org/index), porém é possivel configurar outros repositórios conforme a sua necessidade.
Um exemplo seria um desenvolvedor utilizando o proxy chinês, para go 1.13 ou superior:
```shell script
$ go env -w GO111MODULE=on
$ go env -w GOPROXY=https://goproxy.cn,direct
```

Em caso de versões anteriores é preciso trabalhar com variáveis de ambiente:
```shell script
export GO111MODULE="on"
export GOPROXY="https://goproxy.cn"
```

Outro ponto de atenção é caso você tenha a necessidade de utilizar um repositório privado, o Go permite o uso da variavel
`GOPRIVATE`:
```shell script
go env -w GOPRIVATE="minhaempresa.com"
```


## Mais informações
```shell script
# Mais informações sobre o proxy
go help goproxy

#Mais informações sobre as variáveis do go
go help environment
```
