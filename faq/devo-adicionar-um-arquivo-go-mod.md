# Devo adicionar um arquivo 'go.mod' mesmo que eu não tenha nenhuma dependência?

Sim!

Isso faz com que seja possível trabalhar fora do `GOPATH`, ajuda a comunicar ao ecossistema que você optou por utilizar módulos, e adicionalmente a diretiva `module` no seu arquivo `go.mod` serve como uma declaração definitiva da identidade do seu código (que é uma das principais razões pelas quais comentários de imports devem eventualmente virar `deprecated`).

Módulos estão disponíveis a partir da versão 1.11 de Go.

