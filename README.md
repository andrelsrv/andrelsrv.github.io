# andrelsrv.github.io

Portfólio pessoal de **André Luís Alves Carvalho** — estudante de Engenharia
Elétrica na Universidade Federal do Piauí, com foco em sistemas de potência,
proteção de linhas de transmissão e modelagem computacional de redes.

🔗 **https://andrelsrv.github.io**

## Sobre este repositório

Site estático de página única, sem framework, sem etapa de build. Publicado
automaticamente pelo GitHub Pages a cada push na branch `main`.

```
index.html   Página completa: HTML + CSS crítico inline
main.js      Aprimoramentos (animações, abas, compartilhar, analytics) — opcional
og.png       Imagem de pré-visualização ao compartilhar o link (1200×630)
favicon.svg  Monograma "AL" (adapta ao tema); favicon.ico como reserva
apple-touch-icon.png, icon-192.png, icon-512.png, manifest.webmanifest
             Ícones da tela inicial e manifest básico
.nojekyll    Desativa o processamento Jekyll do GitHub Pages
```

Testar localmente:

```bash
python -m http.server 8000
```

e abrir `http://localhost:8000`.

## Decisões técnicas

- **Mobile-first para o navegador do Instagram.** CSS base escrito para 360px,
  `min-width` para tablet/desktop, `100svh` (com reserva `100vh`),
  `viewport-fit=cover` + `safe-area-inset`, áreas de toque ≥ 44px,
  `backdrop-filter` só na nav, sem `target="_blank"` nem popups.
- **Funciona sem JavaScript.** Todo conteúdo e todos os números estão no HTML.
  Se `main.js` não carregar em 3 s, as animações de entrada são desligadas e
  tudo aparece. As abas “Arquitetura / Validação” viram dois cards.
- **Tema claro e escuro** seguem o sistema, com alternância manual guardada em
  `localStorage` (`theme-pref`) — único uso de armazenamento local.
- **`prefers-reduced-motion`** desliga reveal, contagem, parallax e a onda
  animada (fica um quadro estático).
- **Contraste AA** verificado nos dois temas (texto secundário ≥ 4,6:1,
  links ≥ 5,2:1 no claro e ≥ 5,6:1 no escuro).

## A linha de transmissão (hero)

Pulsos gaussianos viajam nas duas direções a partir do toque e refletem nas
extremidades em aberto (Γ = +1), com atenuação exponencial ao longo do
percurso. Sem interação, um pulso de demonstração é disparado a cada ~3 s.
Pausa fora da tela e com a aba oculta. Com `prefers-reduced-motion`, a linha
fica estática e um toque desenha o pulso em quadros discretos sobrepostos.
Sem JavaScript, um SVG estático mostra o pulso incidente e o refletido.

## Estatísticas de acesso (GoatCounter)

Contagem anônima, sem cookies e sem fingerprinting — compatível com a LGPD sem
banner de consentimento. Nenhum nome, e-mail, IP ou identificador é coletado.

### Configurar

1. Crie uma conta gratuita em <https://www.goatcounter.com/signup> e escolha
   um código (ex.: `andrelsrv` → `andrelsrv.goatcounter.com`).
2. Em `index.html`, procure `SEU_CODIGO` e troque pelo seu código:
   ```html
   <script id="gc" data-goatcounter="https://andrelsrv.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
   ```
3. Faça push. As visitas aparecem no painel do GoatCounter; os eventos
   aparecem como caminhos que começam com `evento/`.

Acessos a partir de `localhost` são ignorados pelo GoatCounter.

### Eventos registrados

| Evento | Quando |
| --- | --- |
| `evento/contato/email` | Clique em “Enviar e-mail” |
| `evento/contato/github` · `linkedin` · `instagram` | Clique nos ícones sociais |
| `evento/contato/compartilhar` | Botão Compartilhar / Copiar link |
| `evento/clique/orcamento` | “Quer um site assim? Fale comigo” |
| `evento/repo/classificador-faltas` | “Ver repositório” do Classificador de Faltas |
| `evento/onda/toque` | Primeiro toque na linha de transmissão do hero |
| `evento/detalhes/classificador` · `icv` · `experiencia` · `cursos` | Abertura dos blocos recolhidos |
| `evento/scroll/25` · `50` · `75` · `100` | Profundidade de rolagem (uma vez cada) |
| `evento/secao/perfil` · `experiencia` · `web` · `pesquisa` · `formacao` · `contato` | Seção vista (uma vez cada) — compare os totais para ver a mais visitada |
| `evento/tema/claro` · `escuro` | Troca manual de tema |
| `evento/origem/instagram-webview` | Acesso pelo navegador embutido do Instagram |
| `evento/origem/instagram` · `linkedin` · `cv` · `email` · `whatsapp` · `app` | Parâmetro `?ref=` da URL |
| `evento/publico/professor` · `recrutador` · `pesquisador` · `cliente` · `curiosidade` | Resposta opcional a “Como você chegou aqui?” |

Para marcar um novo elemento, basta `data-track="grupo/nome"` — um único
listener delegado em `main.js` cuida do resto. A função `track(nome)` é
segura: se o script estiver bloqueado (adblock), nada acontece.

### Links com `?ref=`

O navegador do Instagram costuma omitir o referrer, então use um link por canal:

| Canal | Link |
| --- | --- |
| Bio do Instagram | `https://andrelsrv.github.io/?ref=instagram` |
| LinkedIn | `https://andrelsrv.github.io/?ref=linkedin` |
| Currículo (PDF) | `https://andrelsrv.github.io/?ref=cv` |
| Assinatura de e-mail | `https://andrelsrv.github.io/?ref=email` |
| Status/mensagens do WhatsApp | `https://andrelsrv.github.io/?ref=whatsapp` |

Outros valores de `ref` são ignorados (lista fechada em `main.js`).

## Licença

[MIT](LICENSE)
