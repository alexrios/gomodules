# Como usar libs privadas?

1 - Configure o GIT \(~/.gitconfig\)

```text
[url "ssh://git@github.com/"]
    insteadOf = https://github.com/
```

2 - Adicione o endereço do repositorio privado na variável de ambiente GOPRIVATE

```text
go env -w GOPRIVATE="github.com/<org>/<project>"
```

2.1 - Você pode adicionar todos os repositorios de uma organização usando o  `*`

```text
go env -w GOPRIVATE="github.com/<org>/*"
```

