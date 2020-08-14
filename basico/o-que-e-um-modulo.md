# O que é um módulo?

Um módulo é uma coleção de pacotes Go relacionados. Sendo uma unidade de código\(s\)-fonte versionável e intercambiavel.

Módulos tem 2 principais objetivos:

1. Manter os requisitos especificos das dependências.
2. Criar builds reproduziveis.

Na maioria das vezes, um repositório de controle de versão, como o GIT, contém exatamente um módulo definido na raiz do repositório. 

{% hint style="warning" %}
Vários módulos são suportados em um único repositório, mas normalmente isso resultaria em **mais trabalho** no dia-a-dia do que um único módulo por repositório.
{% endhint %}

Resumindo a relação entre repositórios, módulos e pacotes:

* **Um repositório contém um ou mais módulos.**
* **Cada módulo contém um ou mais pacotes Go.**
* **Cada pacote consiste de um ou mais arquivos Go em um único diretório.**



Módulos devem ser semanticamente versionados de acordo com [semver](https://semver.org/lang/pt-BR/), geralmente na forma **v\(major\).\(Minor\).\(Patch\)**, como v0.1.0, v1.2.3 ou v1.5.0-rc.1. **O v inicial é obrigatório**.   
  
Se estiver usando GIT, a versão estará associada as [tags](https://git-scm.com/book/pt-br/v2/Fundamentos-de-Git-Criando-Tags) do repositório.

{% hint style="info" %}
**Módulos substituem a antiga abordagem baseada em GOPATH para especificar quais arquivos de origem são usados em uma determinada compilação.**
{% endhint %}

