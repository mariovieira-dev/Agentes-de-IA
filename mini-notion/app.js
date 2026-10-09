/**
 * mini-notion - A simple Notion-like note taking app
 * Pure HTML, CSS, JavaScript with localStorage persistence
 */

// ============================================
// State Management
// ============================================
const state = {
    pages: [],
    currentPageId: null,
    searchQuery: '',
    blockIdCounter: 0
};

// ============================================
// DOM Elements
// ============================================
const elements = {
    sidebar: document.getElementById('sidebar'),
    pagesList: document.getElementById('pagesList'),
    btnNewPage: document.getElementById('btnNewPage'),
    searchInput: document.getElementById('searchInput'),
    editorPlaceholder: document.getElementById('editorPlaceholder'),
    pageEditor: document.getElementById('pageEditor'),
    pageTitle: document.getElementById('pageTitle'),
    pageContent: document.getElementById('pageContent')
};

// ============================================
// localStorage Keys
// ============================================
const STORAGE_KEYS = {
    PAGES: 'mini-notion-pages',
    CURRENT_PAGE: 'mini-notion-current-page',
    BLOCK_COUNTER: 'mini-notion-block-counter'
};

// ============================================
// Block Types
// ============================================
const BLOCK_TYPES = {
    PARAGRAPH: 'paragraph',
    HEADING: 'heading',
    TODO: 'todo',
    BULLET: 'bullet'
};

const BLOCK_SHORTCUTS = {
    '# ': BLOCK_TYPES.HEADING,
    '[] ': BLOCK_TYPES.TODO,
    '- ': BLOCK_TYPES.BULLET
};

const BLOCK_PLACEHOLDERS = {
    [BLOCK_TYPES.PARAGRAPH]: 'Digite / para comandos',
    [BLOCK_TYPES.HEADING]: 'Título',
    [BLOCK_TYPES.TODO]: 'Tarefa',
    [BLOCK_TYPES.BULLET]: 'Item da lista'
};

// ============================================
// Initialization
// ============================================
function init() {
    loadFromStorage();
    setupEventListeners();
    renderPagesList();
    restoreCurrentPage();
}

// ============================================
// Storage
// ============================================
function loadFromStorage() {
    try {
        const pagesData = localStorage.getItem(STORAGE_KEYS.PAGES);
        const currentPageData = localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE);
        const counterData = localStorage.getItem(STORAGE_KEYS.BLOCK_COUNTER);

        if (pagesData) {
            state.pages = JSON.parse(pagesData);
        }
        if (currentPageData) {
            state.currentPageId = currentPageData;
        }
        if (counterData) {
            state.blockIdCounter = parseInt(counterData, 10);
        }
    } catch (e) {
        console.error('Erro ao carregar do localStorage:', e);
        state.pages = [];
        state.currentPageId = null;
        state.blockIdCounter = 0;
    }
}

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(state.pages));
        localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, state.currentPageId || '');
        localStorage.setItem(STORAGE_KEYS.BLOCK_COUNTER, state.blockIdCounter.toString());
    } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
    }
}

// ============================================
// Page Management
// ============================================
function createPage() {
    const newPage = {
        id: generateId(),
        title: 'Sem título',
        blocks: [createBlock(BLOCK_TYPES.PARAGRAPH)],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    state.pages.unshift(newPage);
    state.currentPageId = newPage.id;
    saveToStorage();
    renderPagesList();
    renderPage(newPage);
    focusPageTitle();
    return newPage;
}

function deletePage(pageId) {
    const index = state.pages.findIndex(p => p.id === pageId);
    if (index === -1) return;

    state.pages.splice(index, 1);

    if (state.currentPageId === pageId) {
        state.currentPageId = state.pages[0]?.id || null;
    }

    saveToStorage();
    renderPagesList();

    if (state.currentPageId) {
        const page = state.pages.find(p => p.id === state.currentPageId);
        if (page) renderPage(page);
    } else {
        showPlaceholder();
    }
}

function updatePageTitle(pageId, title) {
    const page = state.pages.find(p => p.id === pageId);
    if (!page) return;

    page.title = title.trim() || 'Sem título';
    page.updatedAt = Date.now();
    saveToStorage();
    renderPagesList();
}

function getCurrentPage() {
    return state.pages.find(p => p.id === state.currentPageId) || null;
}

// ============================================
// Block Management
// ============================================
function createBlock(type = BLOCK_TYPES.PARAGRAPH, content = '') {
    state.blockIdCounter++;
    return {
        id: `block-${state.blockIdCounter}`,
        type,
        content,
        completed: false
    };
}

function addBlockAfter(pageId, blockId, type = BLOCK_TYPES.PARAGRAPH) {
    const page = state.pages.find(p => p.id === pageId);
    if (!page) return null;

    const index = page.blocks.findIndex(b => b.id === blockId);
    if (index === -1) return null;

    const newBlock = createBlock(type);
    page.blocks.splice(index + 1, 0, newBlock);
    page.updatedAt = Date.now();
    saveToStorage();
    return newBlock;
}

function deleteBlock(pageId, blockId) {
    const page = state.pages.find(p => p.id === pageId);
    if (!page) return;

    // Don't delete if it's the only block
    if (page.blocks.length <= 1) return;

    const index = page.blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;

    page.blocks.splice(index, 1);
    page.updatedAt = Date.now();
    saveToStorage();
}

function updateBlock(pageId, blockId, updates) {
    const page = state.pages.find(p => p.id === pageId);
    if (!page) return;

    const block = page.blocks.find(b => b.id === blockId);
    if (!block) return;

    Object.assign(block, updates);
    page.updatedAt = Date.now();
    saveToStorage();
}

function detectBlockType(text) {
    for (const [shortcut, type] of Object.entries(BLOCK_SHORTCUTS)) {
        if (text.startsWith(shortcut)) {
            return { type, content: text.slice(shortcut.length) };
        }
    }
    return { type: BLOCK_TYPES.PARAGRAPH, content: text };
}

// ============================================
// Rendering
// ============================================
function renderPagesList() {
    const filteredPages = state.pages.filter(page =>
        page.title.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    if (filteredPages.length === 0) {
        elements.pagesList.innerHTML = `
            <div class="no-pages">
                ${state.searchQuery ? 'Nenhuma página encontrada' : 'Nenhuma página ainda. Clique em "+ Nova página" para começar.'}
            </div>
        `;
        return;
    }

    elements.pagesList.innerHTML = filteredPages.map(page => `
        <div class="page-item ${page.id === state.currentPageId ? 'active' : ''}"
             data-page-id="${page.id}"
             tabindex="0"
             role="button"
             aria-label="${page.title}${page.id === state.currentPageId ? ' (atual)' : ''}"
             aria-pressed="${page.id === state.currentPageId}">
            <span class="page-item-title">${escapeHtml(page.title)}</span>
            <button class="page-item-delete" aria-label="Excluir página" data-page-id="${page.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `).join('');

    // Add click listeners
    elements.pagesList.querySelectorAll('.page-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.page-item-delete')) {
                const pageId = item.dataset.pageId;
                selectPage(pageId);
            }
        });

        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!e.target.closest('.page-item-delete')) {
                    const pageId = item.dataset.pageId;
                    selectPage(pageId);
                }
            }
        });
    });

    elements.pagesList.querySelectorAll('.page-item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const pageId = btn.dataset.pageId;
            if (confirm('Tem certeza que deseja excluir esta página?')) {
                deletePage(pageId);
            }
        });
    });
}

function renderPage(page) {
    if (!page) {
        showPlaceholder();
        return;
    }

    hidePlaceholder();
    elements.pageTitle.textContent = page.title;
    elements.pageTitle.dataset.pageId = page.id;

    elements.pageContent.innerHTML = page.blocks.map(block => renderBlock(block)).join('');

    setupBlockEventListeners(page.id);
}

function renderBlock(block) {
    const placeholder = BLOCK_PLACEHOLDERS[block.type] || '';
    const dragIcon = `
        <button class="block-drag" aria-label="Mover bloco" tabindex="-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="3.5" y1="9" x2="3.5" y2="15"></line>
                <line x1="10.5" y1="9" x2="10.5" y2="15"></line>
                <line x1="17.5" y1="9" x2="17.5" y2="15"></line>
                <line x1="3.5" y1="15" x2="17.5" y2="15"></line>
            </svg>
        </button>
    `;

    switch (block.type) {
        case BLOCK_TYPES.HEADING:
            return `
                <div class="block" data-type="${block.type}" data-block-id="${block.id}" tabindex="0">
                    ${dragIcon}
                    <div class="block-content"
                         contenteditable="true"
                         data-placeholder="${placeholder}"
                         spellcheck="true">${escapeHtml(block.content)}</div>
                </div>
            `;

        case BLOCK_TYPES.TODO:
            return `
                <div class="block ${block.completed ? 'completed' : ''}" data-type="${block.type}" data-block-id="${block.id}" tabindex="0">
                    ${dragIcon}
                    <button class="todo-checkbox ${block.completed ? 'checked' : ''}" aria-label="${block.completed ? 'Marcar como pendente' : 'Marcar como concluído'}" tabindex="0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </button>
                    <div class="block-content"
                         contenteditable="true"
                         data-placeholder="${placeholder}"
                         spellcheck="true">${escapeHtml(block.content)}</div>
                </div>
            `;

        case BLOCK_TYPES.BULLET:
            return `
                <div class="block" data-type="${block.type}" data-block-id="${block.id}" tabindex="0">
                    ${dragIcon}
                    <div class="block-content"
                         contenteditable="true"
                         data-placeholder="${placeholder}"
                         spellcheck="true">${escapeHtml(block.content)}</div>
                </div>
            `;

        default: // PARAGRAPH
            return `
                <div class="block" data-type="${block.type}" data-block-id="${block.id}" tabindex="0">
                    ${dragIcon}
                    <div class="block-content"
                         contenteditable="true"
                         data-placeholder="${placeholder}"
                         spellcheck="true">${escapeHtml(block.content)}</div>
                </div>
            `;
    }
}

function showPlaceholder() {
    elements.editorPlaceholder.hidden = false;
    elements.pageEditor.hidden = true;
}

function hidePlaceholder() {
    elements.editorPlaceholder.hidden = true;
    elements.pageEditor.hidden = false;
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
    // New page button
    elements.btnNewPage.addEventListener('click', createPage);

    // Search input
    elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderPagesList();
    });

    // Page title
    elements.pageTitle.addEventListener('input', debounce(() => {
        if (state.currentPageId) {
            updatePageTitle(state.currentPageId, elements.pageTitle.textContent);
        }
    }, 300));

    elements.pageTitle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            elements.pageTitle.blur();
            focusFirstBlock();
        }
    });

    // Block events are set up in setupBlockEventListeners
}

function setupBlockEventListeners(pageId) {
    const blocks = elements.pageContent.querySelectorAll('.block');

    blocks.forEach(blockEl => {
        const blockId = blockEl.dataset.blockId;
        const contentEl = blockEl.querySelector('.block-content');
        const checkbox = blockEl.querySelector('.todo-checkbox');

        // Input handling for block content
        contentEl.addEventListener('input', () => {
            updateBlock(pageId, blockId, { content: contentEl.textContent });
            checkBlockTypeChange(pageId, blockId, contentEl, blockEl);
        });

        // Keydown handling
        contentEl.addEventListener('keydown', (e) => handleBlockKeydown(e, pageId, blockId, blockEl, contentEl));

        // Checkbox handling
        if (checkbox) {
            checkbox.addEventListener('click', () => {
                const newCompleted = !blockEl.classList.contains('completed');
                blockEl.classList.toggle('completed', newCompleted);
                checkbox.classList.toggle('checked', newCompleted);
                checkbox.setAttribute('aria-label', newCompleted ? 'Marcar como pendente' : 'Marcar como concluído');
                updateBlock(pageId, blockId, { completed: newCompleted });
            });

            checkbox.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    checkbox.click();
                }
            });
        }

        // Prevent dragging from interfering with editing
        const dragHandle = blockEl.querySelector('.block-drag');
        dragHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
}

function handleBlockKeydown(e, pageId, blockId, blockEl, contentEl) {
    const block = getCurrentPage()?.blocks.find(b => b.id === blockId);
    if (!block) return;

    // Enter - create new block
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();

        // For todo, create new todo block
        const newType = block.type === BLOCK_TYPES.TODO ? BLOCK_TYPES.TODO : BLOCK_TYPES.PARAGRAPH;
        const newBlock = addBlockAfter(pageId, blockId, newType);

        if (newBlock) {
            renderPage(getCurrentPage());
            // Focus the new block
            setTimeout(() => {
                const newBlockEl = elements.pageContent.querySelector(`[data-block-id="${newBlock.id}"] .block-content`);
                if (newBlockEl) {
                    newBlockEl.focus();
                    placeCaretAtEnd(newBlockEl);
                }
            }, 0);
        }
        return;
    }

    // Backspace at start of empty block - delete block
    if (e.key === 'Backspace' && contentEl.textContent === '' && getCaretPosition(contentEl) === 0) {
        e.preventDefault();
        deleteBlock(pageId, blockId);
        renderPage(getCurrentPage());
        return;
    }

    // Tab / Shift+Tab for indentation (future enhancement)
    if (e.key === 'Tab') {
        // Could implement nesting here
    }
}

function checkBlockTypeChange(pageId, blockId, contentEl, blockEl) {
    const text = contentEl.textContent;
    const detected = detectBlockType(text);

    if (detected.type !== blockEl.dataset.type) {
        // Update block type
        updateBlock(pageId, blockId, {
            type: detected.type,
            content: detected.content
        });

        // Re-render page to show new block type
        const page = getCurrentPage();
        if (page) {
            const selection = window.getSelection();
            const hadFocus = document.activeElement === contentEl;

            renderPage(page);

            if (hadFocus) {
                setTimeout(() => {
                    const newContentEl = elements.pageContent.querySelector(`[data-block-id="${blockId}"] .block-content`);
                    if (newContentEl) {
                        newContentEl.focus();
                        placeCaretAtEnd(newContentEl);
                    }
                }, 0);
            }
        }
    }
}

// ============================================
// Selection & Focus Helpers
// ============================================
function getCaretPosition(element) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
}

function placeCaretAtEnd(element) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

function focusPageTitle() {
    setTimeout(() => {
        elements.pageTitle.focus();
        placeCaretAtEnd(elements.pageTitle);
    }, 0);
}

function focusFirstBlock() {
    const firstBlock = elements.pageContent.querySelector('.block-content');
    if (firstBlock) {
        firstBlock.focus();
        placeCaretAtEnd(firstBlock);
    }
}

function selectPage(pageId) {
    const page = state.pages.find(p => p.id === pageId);
    if (!page) return;

    state.currentPageId = pageId;
    saveToStorage();
    renderPagesList();
    renderPage(page);
}

function restoreCurrentPage() {
    if (state.currentPageId) {
        const page = state.pages.find(p => p.id === state.currentPageId);
        if (page) {
            renderPage(page);
            return;
        }
    }

    // If no current page or page not found, select first page or show placeholder
    if (state.pages.length > 0) {
        state.currentPageId = state.pages[0].id;
        saveToStorage();
        renderPage(state.pages[0]);
    } else {
        showPlaceholder();
    }
}

// ============================================
// Utility Functions
// ============================================
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

// ============================================
// Start the app
// ============================================
document.addEventListener('DOMContentLoaded', init);