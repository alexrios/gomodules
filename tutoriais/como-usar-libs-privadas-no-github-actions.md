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

Dessa forma a autenticação será sempre utilizada.

É recomendavel usar os **secrets** do repositório para evitar a exposição de dados sensiveis, nesse caso, o token.

```text
- name: Granting private modules access
        run: |
          git config --global url."https://${{ secrets.GO_MODULES_TOKEN }}:x-oauth-basic@github.com/alexrios".insteadOf "https://github.com/alexrios"     
```

para saber mais sobre declarar e usar secrets no github:  
[https://help.github.com/pt/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets](https://help.github.com/pt/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets)

