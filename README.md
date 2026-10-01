# Go Modules em português

Usos e configurações de módulos, com exemplos práticos e conteúdo atualizado até o **Go 1.27**.

Leia o livro em [gomodules.alexrios.me](https://gomodules.alexrios.me).

## Como editar e conferir o livro

O site usa Astro 7 e Starlight. Com [mise](https://mise.jdx.dev/) instalado:

```sh
mise install
pnpm install --frozen-lockfile
mise run dev
```

Abra o endereço mostrado no terminal. Os capítulos ficam em `src/content/docs/`; o texto de boas-vindas está em `src/content/docs/index.md`. A ordem do menu fica em `astro.config.mjs`.

Cada capítulo tem um `title` no frontmatter. O Starlight mostra esse título no início da página, então comece as seções do texto com `##`. Para notas e avisos, use os [blocos do Starlight](https://starlight.astro.build/guides/authoring-content/#asides).

Antes de enviar uma alteração:

```sh
mise run verify
pnpm preview
```

A verificação confere os tipos, gera o site e verifica os links e as âncoras internos. A prévia serve para conferir navegação, busca e leitura no navegador.

## Como publicar

O histórico, as contribuições e a publicação ficam no [repositório atual no GitHub](https://github.com/alexrios/gomodules).

Depois de revisar e integrar uma alteração em `master`, envie a revisão ao GitHub:

```sh
git push origin master
```

O GitHub Actions confere o livro antes de publicar `dist/` no GitHub Pages. Acompanhe o resultado na aba **Actions** e confira o capítulo alterado em `https://gomodules.alexrios.me`.

O subdomínio usa um CNAME para `alexrios.github.io`, sem proxy na Cloudflare. O domínio personalizado fica configurado em **Settings > Pages**. O certificado HTTPS é gerenciado pelo GitHub.

## Quer ajudar o projeto?

Mande seu Pull Request [aqui](https://github.com/alexrios/gomodules) ou entre em contato comigo. Correções, exemplos e sugestões são bem-vindos!

[MIT license](LICENSE.md)
