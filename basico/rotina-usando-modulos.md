# Rotina usando módulos

Seu fluxo de trabalho para um dia típico:

* Adicione os imports nos seus arquivo `.go` conforme necessidade.
* Os comandos `go build` or `go test` adicionarão automaticamente as novas dependências para satisfazer os imports  \(atualizando automaticamente o arquivo `go.mod` e baixando as novas dependências\).

Haverá momentos onde será necessário escolher versões especificas da dependência. Em casos como esses deve ser usado o comando `go get`.

O formato do comando go get é `<nome-do-modulo>@<versão>`

```text
$ go get foo@v1.2.3 
```

{% hint style="warning" %}
Também é possível alterar o arquivo `go.mod` diretamente, caso necessário. Em todo caso, de preferência para que os comandos `go` façam as alterações no arquivo.
{% endhint %}



