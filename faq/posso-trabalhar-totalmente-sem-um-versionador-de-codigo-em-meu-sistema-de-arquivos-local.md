# Posso trabalhar totalmente sem um versionador de código em meu sistema de arquivos local?

Sim!

Nesse caso, você pode colocar a árvore de arquivos que contém o único `go.mod` em um local conveniente. Seu `go build`, `go test` e comandos semelhantes funcionarão mesmo se seu único módulo estiver fora do versionador de código \(sem exigir o uso de `replace` no `go.mod`\).

Se você deseja ter vários módulos inter-relacionados em seu disco local que deseja editar ao mesmo tempo, as diretivas `replace` são uma abordagem. Aqui está um `go.mod` de exemplo que usa um replace com um caminho relativo para apontar o módulo `hello` para a localização no disco do módulo `goodbye` \(sem depender de nenhum VCS\):

```text
module example.com/me/hello

require (
  example.com/me/goodbye v0.0.0
)

replace example.com/me/goodbye => ../goodbye
```

Conforme mostrado neste exemplo, se fora do versionador de código, você pode usar `v0.0.0` como a versão na diretiva `require`.

