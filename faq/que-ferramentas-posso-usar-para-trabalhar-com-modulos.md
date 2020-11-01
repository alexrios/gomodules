# Que ferramentas posso usar para trabalhar com módulos?

Muitas ferramentas começaram a ser construídas pela comunidade para trabalhar com módulos!
Alguns exemplos:

- [github.com/rogpeppe/gohack](https://github.com/rogpeppe/gohack)
    - Uma ferramenta para automatizar e simplificar o fluxo de trabalho com `replace` e múltiplos módulos, permite que você modifique as facilmente uma de suas dependências.
    - Por exemplo, `gohack example.com/some/dependency` automaticamente clona o repositório e adiciona as diretivas `replace` necessárias ao seu `go.mod`.
    - É possível remover todas declarações de `replace` com `gohack undo`.

- [github.com/marwan-at-work/mod](https://github.com/marwan-at-work/mod)
    - Ferramenta de linha de comando para automaticamente fazer _upgrade/downgrade_ de versões _major_ para módulos.
    - Automaticamente ajusta os arquivos `go.mod` e declarações de `import` relacionadas no código fonte.

- [github.com/akyoto/mgit](https://github.com/akyoto/mgit)
    - Permite que você visualize e controle as tags de versionamento semântico de todos os seus projetos locais.
    - Exibe commits sem tags associadas e permite que você aplique tags a todos de uma só vez (`mgit -tag +0.0.1`).

- [github.com/goware/modvendor](https://github.com/goware/modvendor)
    - Auxilia na cópia de arquivos adicionais para a pasta `vendor`, como shell scripts, arquivos .cpp e .proto, etc.

- [github.com/psampaz/go-mod-outdated](https://github.com/psampaz/go-mod-outdated)
    - Exibe dependências desatualizadas de uma forma amigável.
    - Permite filtrar dependências indiretas e sem updates.
    - Permite quebrar o _pipeline_ de integração contínua nos casos de dependências desatualizadas.
    
- [github.com/oligot/go-mod-upgrade](https://github.com/oligot/go-mod-upgrade)
    - Atualiza de forma interativa dependências desatualizadas.



