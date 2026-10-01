# Como usar libs privadas no Github Actions?

{% hint style="info" %}
Nesse tutorial vamos usar um repositorio privado ficticio chamado **github.com/alexrios/superlib** na versão **v1.1.0**
{% endhint %}

#### Historia

Durante o pipeline de integração continua executando `go mod tidy` acontecia o seguinte erro:

```text
go: github.com/alexrios/superlib@v1.1.0: reading github.com/alexrios/superlib/go.mod at revision v1.1.0: unknown revision v1.1.0
```

#### Por que?

Para entender como Go usa um SVC para lidar com dependências, recomendo o blog:[https://blog.golang.org/publishing-go-modules](https://blog.golang.org/publishing-go-modules)

#### Solução

Gere um token com permissão de leitura na **org** ou **usuario** do repositorio e configure a substituição no git.

Configure também `GOPRIVATE`, para que esses caminhos não sejam consultados no proxy e no checksum database públicos. O token precisa ter acesso aos repositórios das dependências; o `GITHUB_TOKEN` do workflow pode não ter acesso a outros repositórios privados.

É recomendavel usar os **secrets** do repositório para evitar a exposição de dados sensiveis, nesse caso, o token.

```yaml
- name: Granting private modules access
  env:
    GOPRIVATE: "github.com/alexrios/*"
    GO_MODULES_TOKEN: ${{ secrets.GO_MODULES_TOKEN }}
  run: |
    git config --global url."https://${GO_MODULES_TOKEN}:x-oauth-basic@github.com/alexrios/".insteadOf "https://github.com/alexrios/"
    go mod tidy
    go test ./...
```

para saber mais sobre declarar e usar secrets no github:  
[https://docs.github.com/pt/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions](https://docs.github.com/pt/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)


Veja também [Módulos privados na documentação do Go](https://go.dev/ref/mod#private-modules).
