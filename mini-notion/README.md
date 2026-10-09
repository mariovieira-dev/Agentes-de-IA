# mini-notion

Um clone minimalista do Notion feito com **HTML, CSS e JavaScript puros** — sem frameworks, sem build, sem backend. Os dados são salvos automaticamente no `localStorage` do navegador.

## 🚀 Como abrir

1. Clone ou baixe este repositório
2. Abra o arquivo `index.html` diretamente no navegador (duplo clique ou arraste para a janela do browser)
3. Pronto! Não precisa de servidor local

> **Dica:** Para melhor experiência, use um servidor local simples:
> ```bash
> # Python 3
> python -m http.server 8000
> 
> # Node.js (npx)
> npx serve
> 
> # PHP
> php -S localhost:8000
> ```
> Depois acesse `http://localhost:8000`

## ⌨️ Atalhos e Comandos

### Na barra lateral
| Ação | Atalho |
|------|--------|
| Buscar páginas | Digite no campo "Buscar páginas..." |
| Criar nova página | Clique em **+ Nova página** |
| Selecionar página | Clique na página na lista |
| Excluir página | Passe o mouse sobre a página e clique no 🗑️ |

### No editor de página
| Ação | Atalho |
|------|--------|
| Editar título | Clique no título da página |
| Criar novo bloco | **Enter** dentro de um bloco |
| Excluir bloco vazio | **Backspace** no início de um bloco vazio |
| Marcar/desmarcar tarefa | Clique no ☐ ou **Enter/Espaço** no checkbox |

### Tipos de bloco (digite no início da linha)
| Atalho | Tipo | Exemplo |
|--------|------|---------|
| `# ` | Título (H1) | `# Meu Título` |
| `[] ` | Lista de tarefas | `[] Comprar leite` |
| `- ` | Lista com marcadores | `- Item da lista` |
| (nada) | Parágrafo | `Texto normal...` |

> **Nota:** O tipo do bloco muda **automaticamente** assim que você digita o atalho no início da linha.

## 🎨 Recursos

- ✅ **Tema escuro** elegante e moderno
- ✅ **Layout responsivo** — funciona no mobile e desktop
- ✅ **Persistência local** — tudo salvo no `localStorage`
- ✅ **Busca em tempo real** — filtra páginas pelo título
- ✅ **Blocos flexíveis** — parágrafo, título, tarefas, lista
- ✅ **Acessibilidade** — navegação por teclado, ARIA labels
- ✅ **Zero dependências** — roda em qualquer navegador moderno

## 📁 Estrutura do projeto

```
mini-notion/
├── index.html    # Estrutura HTML
├── style.css     # Estilos (tema escuro, responsivo)
├── app.js        # Lógica da aplicação
└── README.md     # Este arquivo
```

## 💾 Onde os dados ficam?

Os dados são armazenados no `localStorage` do seu navegador com as chaves:
- `mini-notion-pages` — array de páginas com blocos
- `mini-notion-current-page` — ID da página aberta
- `mini-notion-block-counter` — contador para IDs únicos

Para limpar os dados, abra o DevTools (F12) → Application → Local Storage → clique com botão direito → Clear.

## 🔧 Personalização

### Cores (CSS Variables em `style.css`)
```css
:root {
    --bg-primary: #0d0d0d;      /* Fundo principal */
    --bg-secondary: #1a1a1a;    /* Sidebar */
    --accent: #3b82f6;          /* Cor de destaque (azul) */
    --danger: #ef4444;          /* Vermelho (excluir) */
    /* ... mais variáveis */
}
```

### Adicionar novos tipos de bloco
1. Adicione o tipo em `BLOCK_TYPES` no `app.js`
2. Adicione o atalho em `BLOCK_SHORTCUTS`
3. Adicione o placeholder em `BLOCK_PLACEHOLDERS`
4. Crie o case no `renderBlock()`
5. Adicione estilos no `style.css`

## 📝 Licença

MIT — Use livremente para estudos, projetos pessoais ou como base para algo maior.

---

**Feito com ❤️ usando apenas tecnologias nativas da web**