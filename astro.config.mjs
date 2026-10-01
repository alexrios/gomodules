import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://gomodules.alexrios.me',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Go Modules',
      description: 'Usos e configurações de Go Modules em português, atualizado até Go 1.27.',
      locales: { root: { label: 'Português', lang: 'pt-BR' } },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/alexrios/gomodules' }],
      editLink: { baseUrl: 'https://github.com/alexrios/gomodules/edit/master/' },
      sidebar: [
        {
          "label": "Boas-vindas",
          "link": "/"
        },
        {
          "label": "Básico",
          "items": [
            {
              "label": "O que é um módulo?",
              "link": "/basico/o-que-e-um-modulo/"
            },
            {
              "label": "Rotina usando módulos",
              "items": [
                {
                  "label": "Rotina usando módulos",
                  "link": "/basico/rotina-usando-modulos/"
                },
                {
                  "label": "Criando um novo módulo",
                  "link": "/basico/rotina-usando-modulos/criando-um-novo-modulo/"
                },
                {
                  "label": "Adicionando uma dependência",
                  "link": "/basico/rotina-usando-modulos/adicionando-uma-dependencia/"
                },
                {
                  "label": "Atualizando dependências",
                  "link": "/basico/rotina-usando-modulos/atualizando-dependencias/"
                },
                {
                  "label": "Adicionando uma dependência em uma nova versão principal (major)",
                  "link": "/basico/rotina-usando-modulos/adicionando-uma-dependencia-em-uma-nova-versao-principal-major/"
                }
              ]
            },
            {
              "label": "Comandos comuns",
              "link": "/basico/comandos-comuns/"
            }
          ]
        },
        {
          "label": "Novos conceitos",
          "items": [
            {
              "label": "Módulos",
              "link": "/novos-conceitos/modules/"
            },
            {
              "label": "go.mod",
              "link": "/novos-conceitos/go.mod/"
            },
            {
              "label": "Seleção de versão",
              "link": "/novos-conceitos/selecao-de-versao/"
            }
          ]
        },
        {
          "label": "Avançado",
          "items": [
            {
              "label": "Go Module Proxy",
              "link": "/avancado/go-module-proxy/"
            },
            {
              "label": "go.sum",
              "link": "/avancado/go.sum/"
            },
            {
              "label": "Checksum Database",
              "link": "/avancado/checksum-database/"
            },
            {
              "label": "Workspace Mode",
              "link": "/avancado/workspace-mode/"
            },
            {
              "label": "Lazy Loading e Graph Pruning",
              "link": "/avancado/lazy-loading/"
            },
            {
              "label": "Gerenciamento de Toolchains",
              "link": "/avancado/toolchain-management/"
            },
            {
              "label": "Module Retraction",
              "link": "/avancado/module-retraction/"
            },
            {
              "label": "Tool Dependencies",
              "link": "/avancado/tool-dependencies/"
            },
            {
              "label": "Security Features",
              "link": "/avancado/security-features/"
            }
          ]
        },
        {
          "label": "Tutoriais",
          "items": [
            {
              "label": "Como usar libs privadas?",
              "link": "/tutoriais/usando-libs-privadas/"
            },
            {
              "label": "Como usar libs privadas no Github Actions?",
              "link": "/tutoriais/como-usar-libs-privadas-no-github-actions/"
            }
          ]
        },
        {
          "label": "FAQ",
          "items": [
            {
              "label": "Devo fazer commit do arquivo 'go.sum'?",
              "link": "/faq/devo-fazer-commit-do-arquivo-go-sum/"
            },
            {
              "label": "Quando usar replace?",
              "link": "/faq/quando-usar-replace/"
            },
            {
              "label": "Posso trabalhar totalmente sem um versionador de código em meu sistema de arquivos local?",
              "link": "/faq/posso-trabalhar-totalmente-sem-um-versionador-de-codigo-em-meu-sistema-de-arquivos-local/"
            },
            {
              "label": "Como faço para usar a \"vendor\" com módulos?",
              "link": "/faq/como-faco-para-usar-a-vendor-com-modulos/"
            },
            {
              "label": "Que ferramentas posso usar para trabalhar com módulos?",
              "link": "/faq/que-ferramentas-posso-usar-para-trabalhar-com-modulos/"
            },
            {
              "label": "Devo adicionar um arquivo 'go.mod' mesmo que eu não tenha nenhuma dependência?",
              "link": "/faq/devo-adicionar-um-arquivo-go-mod/"
            }
          ]
        },
        {
          "label": "Releases",
          "items": [
            {
              "label": "1.13",
              "link": "/releases/1.13/"
            },
            {
              "label": "1.14",
              "link": "/releases/1.14/"
            },
            {
              "label": "1.15",
              "link": "/releases/1.15/"
            },
            {
              "label": "1.16-1.17: Lazy Loading Era",
              "link": "/releases/1.16-1.17/"
            },
            {
              "label": "1.18-1.21: Workspace & Toolchain Era",
              "link": "/releases/1.18-1.21/"
            },
            {
              "label": "1.22-1.25: Modern Features Era",
              "link": "/releases/1.22-1.25/"
            },
            {
              "label": "1.26-1.27: Compatibilidade e manutenção",
              "link": "/releases/1.26-1.27/"
            }
          ]
        }
      ],
    }),
  ],
});
