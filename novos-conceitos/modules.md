# Módulos

Um módulo é uma coleção de pacotes go relacionados que estão versionados juntos, em unidade.

Módulos registram com precisão os requisitos das dependências e criam _builds_ reproduzíveis.

Na maioria das vezes, um repositório com controle de versão contém exatamente um módulo definido na raiz.

Em suma, a relação entre repositórios, módulos e pacotes se dá da seguinte forma:
   - Um repositório contém um ou mais módulos Go.
   - Cada módulo contém um ou mais pacotes Go.
   - Cada pacote go consiste em um ou mais arquivos fonte Go em um diretório.

Módulos precisam ser versionados semanticamente de acordo com `semver`, geralmente na forma `v(major).(minor).(patch)`, como `v0.1.0`, `v1.2.3`, or `v1.5.0-rc.1`.
O "v" inicial é obrigatório. Se estiver utilizando _git_, adicione _tags_ de versão aos seus _commits_.
É possível utilizar repositórios privados, ver [Como usar libs privadas?](../tutoriais/como-usar-libs-privadas-no-github-actions.md).   


