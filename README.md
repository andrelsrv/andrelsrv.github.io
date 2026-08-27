# andrelsrv.github.io

Portfólio pessoal de **André Luís Alves Carvalho** — estudante de Engenharia
Elétrica na Universidade Federal do Piauí, com foco em sistemas de potência,
proteção de linhas de transmissão e modelagem computacional de redes.

🔗 **https://andrelsrv.github.io**

## Sobre este repositório

Site estático de página única, sem framework, sem etapa de build e sem
dependências além das fontes do Google Fonts. Publicado automaticamente pelo
GitHub Pages a cada push na branch `main`.

```
index.html   Página completa (HTML + CSS + JS embutidos)
og.png       Imagem de pré-visualização ao compartilhar o link
.nojekyll    Desativa o processamento Jekyll do GitHub Pages
```

## Decisões técnicas

- **Sem framework.** O conteúdo é essencialmente texto e um punhado de
  interações; qualquer framework aqui seria peso morto no carregamento.
- **Tema claro e escuro** seguem a preferência do sistema, com alternância
  manual persistida em `localStorage`.
- **Movimento é aprimoramento, não requisito.** Todo conteúdo e todos os
  números estão no HTML e permanecem corretos se o JavaScript não executar.
  As animações respeitam `prefers-reduced-motion`.
- **Prioridade para navegador móvel embutido** (Instagram, WhatsApp): meta
  tags Open Graph para a pré-visualização do link, `theme-color` para a barra
  do navegador, `svh` para evitar salto de layout quando a barra recolhe, e
  declarações de reserva para `color-mix` em WebKit mais antigo.
- **Contraste verificado** em ambos os temas: todos os textos ficam acima de
  4,5:1 (WCAG AA).

## Licença

[MIT](LICENSE)
