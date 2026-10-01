---
title: "Devo fazer commit do arquivo 'go.sum'?"
slug: "faq/devo-fazer-commit-do-arquivo-go-sum"
---

Tipicamente seu arquivo `go.sum` deve ser _commitado_ junto com seu arquivo go.mod.

   - `go.sum` contém os _checksums_ criptográficos esperados do conteúdo de versões de módulos específicas.
   - Se alguém clonar seu repositório e fizer download das suas dependências utilizando o comando `go`, essa pessoa receberá um erro se houver alguma discrepância entre as cópias baixadas de suas dependências e as entradas correspondentes no arquivo `go.sum`.
   - Além disso, `go mod verify` verifica se as cópias cacheadas em disco dos downloads dos módulos ainda batem com os hashes registrados quando foram baixadas para o cache. Essa verificação detecta alterações locais nos arquivos zip e nos diretórios extraídos; a autenticação contra `go.sum` e o checksum database acontece durante o download.
   - Note que `go.sum` não é um arquivo de _lock_!


