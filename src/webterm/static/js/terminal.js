/**
 * WebTerm - xterm.js client with WebSocket connection
 */

// Theme definitions
const themes = {
    'catppuccin-mocha': {
        background: '#1e1e2e',
        foreground: '#cdd6f4',
        cursor: '#f5e0dc',
        cursorAccent: '#1e1e2e',
        selectionBackground: '#45475a',
        selectionForeground: '#cdd6f4',
        black: '#45475a',
        red: '#f38ba8',
        green: '#a6e3a1',
        yellow: '#f9e2af',
        blue: '#89b4fa',
        magenta: '#f5c2e7',
        cyan: '#94e2d5',
        white: '#bac2de',
        brightBlack: '#585b70',
        brightRed: '#f38ba8',
        brightGreen: '#a6e3a1',
        brightYellow: '#f9e2af',
        brightBlue: '#89b4fa',
        brightMagenta: '#f5c2e7',
        brightCyan: '#94e2d5',
        brightWhite: '#a6adc8',
    },
    'catppuccin-latte': {
        background: '#eff1f5',
        foreground: '#4c4f69',
        cursor: '#dc8a78',
        cursorAccent: '#eff1f5',
        selectionBackground: '#acb0be',
        selectionForeground: '#4c4f69',
        black: '#5c5f77',
        red: '#d20f39',
        green: '#40a02b',
        yellow: '#df8e1d',
        blue: '#1e66f5',
        magenta: '#ea76cb',
        cyan: '#179299',
        white: '#acb0be',
        brightBlack: '#6c6f85',
        brightRed: '#d20f39',
        brightGreen: '#40a02b',
        brightYellow: '#df8e1d',
        brightBlue: '#1e66f5',
        brightMagenta: '#ea76cb',
        brightCyan: '#179299',
        brightWhite: '#bcc0cc',
    },
    'dracula': {
        background: '#282a36',
        foreground: '#f8f8f2',
        cursor: '#f8f8f2',
        cursorAccent: '#282a36',
        selectionBackground: '#44475a',
        selectionForeground: '#f8f8f2',
        black: '#21222c',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#f8f8f2',
        brightBlack: '#6272a4',
        brightRed: '#ff6e6e',
        brightGreen: '#69ff94',
        brightYellow: '#ffffa5',
        brightBlue: '#d6acff',
        brightMagenta: '#ff92df',
        brightCyan: '#a4ffff',
        brightWhite: '#ffffff',
    },
    'nord': {
        background: '#2e3440',
        foreground: '#d8dee9',
        cursor: '#d8dee9',
        cursorAccent: '#2e3440',
        selectionBackground: '#434c5e',
        selectionForeground: '#d8dee9',
        black: '#3b4252',
        red: '#bf616a',
        green: '#a3be8c',
        yellow: '#ebcb8b',
        blue: '#81a1c1',
        magenta: '#b48ead',
        cyan: '#88c0d0',
        white: '#e5e9f0',
        brightBlack: '#4c566a',
        brightRed: '#bf616a',
        brightGreen: '#a3be8c',
        brightYellow: '#ebcb8b',
        brightBlue: '#81a1c1',
        brightMagenta: '#b48ead',
        brightCyan: '#8fbcbb',
        brightWhite: '#eceff4',
    },
    'tokyo-night': {
        background: '#1a1b26',
        foreground: '#c0caf5',
        cursor: '#c0caf5',
        cursorAccent: '#1a1b26',
        selectionBackground: '#33467c',
        selectionForeground: '#c0caf5',
        black: '#15161e',
        red: '#f7768e',
        green: '#9ece6a',
        yellow: '#e0af68',
        blue: '#7aa2f7',
        magenta: '#bb9af7',
        cyan: '#7dcfff',
        white: '#a9b1d6',
        brightBlack: '#414868',
        brightRed: '#f7768e',
        brightGreen: '#9ece6a',
        brightYellow: '#e0af68',
        brightBlue: '#7aa2f7',
        brightMagenta: '#bb9af7',
        brightCyan: '#7dcfff',
        brightWhite: '#c0caf5',
    },
};

// CSS variables for each theme (for UI elements)
const themeCssVars = {
    'catppuccin-mocha': {
        '--ctp-base': '#1e1e2e',
        '--ctp-mantle': '#181825',
        '--ctp-surface0': '#313244',
        '--ctp-surface1': '#45475a',
        '--ctp-surface2': '#585b70',
        '--ctp-text': '#cdd6f4',
        '--ctp-subtext0': '#a6adc8',
        '--ctp-blue': '#89b4fa',
        '--ctp-green': '#a6e3a1',
        '--ctp-yellow': '#f9e2af',
        '--ctp-red': '#f38ba8',
    },
    'catppuccin-latte': {
        '--ctp-base': '#eff1f5',
        '--ctp-mantle': '#e6e9ef',
        '--ctp-surface0': '#ccd0da',
        '--ctp-surface1': '#bcc0cc',
        '--ctp-surface2': '#acb0be',
        '--ctp-text': '#4c4f69',
        '--ctp-subtext0': '#6c6f85',
        '--ctp-blue': '#1e66f5',
        '--ctp-green': '#40a02b',
        '--ctp-yellow': '#df8e1d',
        '--ctp-red': '#d20f39',
    },
    'dracula': {
        '--ctp-base': '#282a36',
        '--ctp-mantle': '#21222c',
        '--ctp-surface0': '#343746',
        '--ctp-surface1': '#44475a',
        '--ctp-surface2': '#6272a4',
        '--ctp-text': '#f8f8f2',
        '--ctp-subtext0': '#bfbfbf',
        '--ctp-blue': '#bd93f9',
        '--ctp-green': '#50fa7b',
        '--ctp-yellow': '#f1fa8c',
        '--ctp-red': '#ff5555',
    },
    'nord': {
        '--ctp-base': '#2e3440',
        '--ctp-mantle': '#272c36',
        '--ctp-surface0': '#3b4252',
        '--ctp-surface1': '#434c5e',
        '--ctp-surface2': '#4c566a',
        '--ctp-text': '#eceff4',
        '--ctp-subtext0': '#d8dee9',
        '--ctp-blue': '#81a1c1',
        '--ctp-green': '#a3be8c',
        '--ctp-yellow': '#ebcb8b',
        '--ctp-red': '#bf616a',
    },
    'tokyo-night': {
        '--ctp-base': '#1a1b26',
        '--ctp-mantle': '#16161e',
        '--ctp-surface0': '#232433',
        '--ctp-surface1': '#33467c',
        '--ctp-surface2': '#414868',
        '--ctp-text': '#c0caf5',
        '--ctp-subtext0': '#a9b1d6',
        '--ctp-blue': '#7aa2f7',
        '--ctp-green': '#9ece6a',
        '--ctp-yellow': '#e0af68',
        '--ctp-red': '#f7768e',
    },
};

class WebTerminal {
    constructor() {
        this.terminal = null;
        this.fitAddon = null;
        this.webLinksAddon = null;
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000;
        this.statusElement = document.getElementById('connection-status');
        this.cpuElement = document.getElementById('cpu-usage');
        this.memElement = document.getElementById('mem-usage');
        this.gpuElement = document.getElementById('gpu-usage');
        this.themeSelect = document.getElementById('theme-select');
        this.currentTheme = localStorage.getItem('webterm-theme') || 'catppuccin-mocha';

        // PiP panel elements
        this.pipPanel = document.getElementById('stats-pip');
        this.pipClose = document.querySelector('.pip-close');
        this.pipCpuBar = document.getElementById('pip-cpu-bar');
        this.pipCpuCores = document.getElementById('pip-cpu-cores');
        this.pipMemBar = document.getElementById('pip-mem-bar');
        this.pipMemDetails = document.getElementById('pip-mem-details');
        this.pipProcesses = document.getElementById('pip-processes');
        this.pipVisible = false;

        // File explorer elements
        this.explorerToggle = document.getElementById('explorer-toggle');
        this.fileExplorer = document.getElementById('file-explorer');
        this.explorerPath = document.getElementById('explorer-path');
        this.fileList = document.getElementById('file-list');
        this.uploadBtn = document.getElementById('upload-btn');
        this.refreshBtn = document.getElementById('refresh-btn');
        this.backBtn = document.getElementById('back-btn');
        this.fileInput = document.getElementById('file-input');
        this.dropZone = document.getElementById('drop-zone');
        this.explorerVisible = false;
        this.currentPath = '~';
        this.pathHistory = [];
    }

    init() {
        // Set initial theme in selector
        this.themeSelect.value = this.currentTheme;

        // Initialize terminal with saved theme
        this.terminal = new Terminal({
            theme: themes[this.currentTheme],
            fontFamily: "'Menlo', 'Monaco', 'Consolas', monospace",
            fontSize: 14,
            lineHeight: 1.2,
            cursorBlink: true,
            cursorStyle: 'block',
            scrollback: 10000,
            convertEol: true,
            allowProposedApi: true,
        });

        // Apply CSS variables for current theme
        this.applyCssTheme(this.currentTheme);

        // Initialize addons
        this.fitAddon = new FitAddon.FitAddon();
        this.webLinksAddon = new WebLinksAddon.WebLinksAddon();

        this.terminal.loadAddon(this.fitAddon);
        this.terminal.loadAddon(this.webLinksAddon);

        // Load clipboard addon if available
        if (typeof ClipboardAddon !== 'undefined') {
            this.clipboardAddon = new ClipboardAddon.ClipboardAddon();
            this.terminal.loadAddon(this.clipboardAddon);
        }

        // Open terminal in container
        const container = document.getElementById('terminal');
        this.terminal.open(container);
        this.fitAddon.fit();

        // Set up clipboard support with keyboard shortcuts
        this.setupClipboard();

        // Handle input
        this.terminal.onData((data) => {
            this.send({ type: 'input', data: data });
        });

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
        this.terminal.onResize(({ rows, cols }) => {
            this.send({ type: 'resize', rows: rows, cols: cols });
        });

        // Handle theme change
        this.themeSelect.addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        // Handle PiP panel toggle
        this.cpuElement.addEventListener('click', () => this.togglePip());
        this.memElement.addEventListener('click', () => this.togglePip());
        this.pipClose.addEventListener('click', () => this.hidePip());

        // Make PiP draggable
        this.initPipDrag();

        // File explorer setup
        this.initFileExplorer();

        // Connect to WebSocket
        this.connect();
    }

    togglePip() {
        if (this.pipVisible) {
            this.hidePip();
        } else {
            this.showPip();
        }
    }

    showPip() {
        this.pipPanel.classList.remove('hidden');
        this.pipVisible = true;
        // Request detailed stats
        this.send({ type: 'stats_detail', enabled: true });
    }

    hidePip() {
        this.pipPanel.classList.add('hidden');
        this.pipVisible = false;
        // Disable detailed stats to reduce server load
        this.send({ type: 'stats_detail', enabled: false });
    }

    initPipDrag() {
        const header = this.pipPanel.querySelector('.pip-header');
        let isDragging = false;
        let startX, startY, startLeft, startBottom;

        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('pip-close')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = this.pipPanel.getBoundingClientRect();
            startLeft = rect.left;
            startBottom = window.innerHeight - rect.bottom;
            header.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const newLeft = Math.max(0, Math.min(window.innerWidth - this.pipPanel.offsetWidth, startLeft + dx));
            const newBottom = Math.max(40, Math.min(window.innerHeight - this.pipPanel.offsetHeight - 32, startBottom - dy));
            this.pipPanel.style.left = `${newLeft}px`;
            this.pipPanel.style.right = 'auto';
            this.pipPanel.style.bottom = `${newBottom}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            header.style.cursor = 'move';
        });
    }

    setupClipboard() {
        // Custom key event handler for clipboard operations
        this.terminal.attachCustomKeyEventHandler((event) => {
            // Ctrl+Shift+C: Copy
            if (event.ctrlKey && event.shiftKey && event.key === 'C') {
                if (event.type === 'keydown') {
                    const selection = this.terminal.getSelection();
                    if (selection) {
                        navigator.clipboard.writeText(selection).catch(err => {
                            console.error('Failed to copy:', err);
                        });
                    }
                }
                return false; // Prevent default
            }

            // Ctrl+Shift+V: Paste
            if (event.ctrlKey && event.shiftKey && event.key === 'V') {
                if (event.type === 'keydown') {
                    navigator.clipboard.readText().then(text => {
                        this.send({ type: 'input', data: text });
                    }).catch(err => {
                        console.error('Failed to paste:', err);
                    });
                }
                return false; // Prevent default
            }

            // Let other keys pass through
            return true;
        });

        // Right-click context menu for copy/paste
        this.terminal.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const selection = this.terminal.getSelection();
            if (selection) {
                // If there's a selection, copy it
                navigator.clipboard.writeText(selection).catch(err => {
                    console.error('Failed to copy:', err);
                });
            } else {
                // If no selection, paste
                navigator.clipboard.readText().then(text => {
                    this.send({ type: 'input', data: text });
                }).catch(err => {
                    console.error('Failed to paste:', err);
                });
            }
        });
    }

    setTheme(themeName) {
        if (!themes[themeName]) return;

        this.currentTheme = themeName;
        localStorage.setItem('webterm-theme', themeName);

        // Update terminal theme
        this.terminal.options.theme = themes[themeName];

        // Update CSS variables for UI
        this.applyCssTheme(themeName);
    }

    applyCssTheme(themeName) {
        const vars = themeCssVars[themeName];
        if (!vars) return;

        const root = document.documentElement;
        for (const [key, value] of Object.entries(vars)) {
            root.style.setProperty(key, value);
        }
    }

    handleResize() {
        if (this.fitAddon) {
            this.fitAddon.fit();
        }
    }

    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/terminal`;

        this.setStatus('connecting', 'Connecting...');
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            this.reconnectAttempts = 0;
            this.setStatus('connected', 'Connected');
            // Send initial resize
            const { rows, cols } = this.terminal;
            this.send({ type: 'resize', rows: rows, cols: cols });
        };

        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === 'output') {
                    this.terminal.write(message.data);
                } else if (message.type === 'error') {
                    console.error('Server error:', message.message);
                    this.terminal.write(`\r\n\x1b[31m[Error: ${message.message}]\x1b[0m\r\n`);
                } else if (message.type === 'stats') {
                    this.updateStats(message);
                } else if (message.type === 'cwd') {
                    // Received current working directory from terminal
                    this.loadDirectory(message.path);
                }
            } catch (e) {
                console.error('Failed to parse message:', e);
            }
        };

        this.socket.onclose = () => {
            this.setStatus('disconnected', 'Disconnected');
            this.attemptReconnect();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    updateStats(stats) {
        // Update header stats
        if (this.cpuElement && stats.cpu !== undefined) {
            this.cpuElement.textContent = `CPU: ${stats.cpu.toFixed(1)}%`;
        }
        if (this.memElement && stats.memory !== undefined) {
            this.memElement.textContent = `MEM: ${stats.memory.toFixed(1)}%`;
        }
        if (this.gpuElement && stats.gpu_name !== undefined) {
            this.gpuElement.style.display = 'flex';
            this.gpuElement.title = stats.gpu_name;
            if (stats.gpu !== null && stats.gpu !== undefined) {
                this.gpuElement.textContent = `GPU: ${stats.gpu.toFixed(1)}%`;
            } else {
                this.gpuElement.textContent = `GPU: N/A`;
            }
        }

        // Update PiP panel if visible and detailed stats available
        if (this.pipVisible) {
            this.updatePipPanel(stats);
        }
    }

    updatePipPanel(stats) {
        // Update CPU bar
        if (this.pipCpuBar && stats.cpu !== undefined) {
            const fill = this.pipCpuBar.querySelector('.pip-bar-fill');
            const text = this.pipCpuBar.querySelector('.pip-bar-text');
            fill.style.width = `${stats.cpu}%`;
            text.textContent = `${stats.cpu.toFixed(1)}%`;
        }

        // Update CPU cores
        if (this.pipCpuCores && stats.cpu_cores) {
            this.pipCpuCores.innerHTML = stats.cpu_cores.map((usage, i) => `
                <div class="pip-core">
                    <div class="pip-core-label">Core ${i}</div>
                    <div class="pip-core-value">${usage.toFixed(0)}%</div>
                </div>
            `).join('');
        }

        // Update memory bar
        if (this.pipMemBar && stats.memory !== undefined) {
            const fill = this.pipMemBar.querySelector('.pip-bar-fill');
            const text = this.pipMemBar.querySelector('.pip-bar-text');
            fill.style.width = `${stats.memory}%`;
            text.textContent = `${stats.memory.toFixed(1)}%`;
        }

        // Update memory details
        if (this.pipMemDetails && stats.mem_total_fmt) {
            this.pipMemDetails.innerHTML = `
                <div class="pip-detail-row">
                    <span>Used</span>
                    <span class="pip-detail-value">${stats.mem_used_fmt}</span>
                </div>
                <div class="pip-detail-row">
                    <span>Free</span>
                    <span class="pip-detail-value">${stats.mem_free_fmt}</span>
                </div>
                <div class="pip-detail-row">
                    <span>Cached</span>
                    <span class="pip-detail-value">${stats.mem_cached_fmt}</span>
                </div>
                <div class="pip-detail-row">
                    <span>Total</span>
                    <span class="pip-detail-value">${stats.mem_total_fmt}</span>
                </div>
            `;
        }

        // Update processes
        if (this.pipProcesses && stats.processes) {
            this.pipProcesses.innerHTML = stats.processes.map(proc => `
                <div class="pip-process">
                    <span class="pip-process-name" title="${proc.name}">${proc.name}</span>
                    <span class="pip-process-cpu">${proc.cpu.toFixed(1)}%</span>
                    <span class="pip-process-mem">${proc.mem.toFixed(1)}%</span>
                </div>
            `).join('');
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.setStatus('disconnected', 'Connection failed');
            this.terminal.write('\r\n\x1b[31m[Connection failed. Please refresh the page.]\x1b[0m\r\n');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        this.setStatus('connecting', `Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

        setTimeout(() => {
            if (this.socket.readyState === WebSocket.CLOSED) {
                this.connect();
            }
        }, Math.min(delay, 30000));
    }

    send(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }

    setStatus(state, text) {
        if (this.statusElement) {
            this.statusElement.textContent = text;
            this.statusElement.className = state;
        }
    }

    // File Explorer Methods
    initFileExplorer() {
        // Toggle button
        this.explorerToggle.addEventListener('click', () => this.toggleExplorer());

        // Upload button
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());

        // Refresh button
        this.refreshBtn.addEventListener('click', () => this.loadDirectory(this.currentPath));

        // Back button
        this.backBtn.addEventListener('click', () => this.goBack());

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.uploadFiles(e.target.files);
                e.target.value = ''; // Reset input
            }
        });

        // Drag and drop
        this.fileExplorer.addEventListener('dragenter', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('hidden');
        });

        this.dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            if (e.target === this.dropZone) {
                this.dropZone.classList.add('hidden');
            }
        });

        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('hidden');
            if (e.dataTransfer.files.length > 0) {
                this.uploadFiles(e.dataTransfer.files);
            }
        });
    }

    toggleExplorer() {
        if (this.explorerVisible) {
            this.hideExplorer();
        } else {
            this.showExplorer();
        }
    }

    showExplorer() {
        this.fileExplorer.classList.remove('hidden');
        this.explorerToggle.classList.add('active');
        this.explorerVisible = true;
        // Request current working directory from terminal
        this.send({ type: 'get_cwd' });
        // Refit terminal after layout change
        setTimeout(() => this.handleResize(), 50);
    }

    hideExplorer() {
        this.fileExplorer.classList.add('hidden');
        this.explorerToggle.classList.remove('active');
        this.explorerVisible = false;
        // Refit terminal after layout change
        setTimeout(() => this.handleResize(), 50);
    }

    async loadDirectory(path, addToHistory = true) {
        try {
            const url = path ? `/api/files?path=${encodeURIComponent(path)}` : '/api/files';
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to load directory: ${response.statusText}`);
            }

            const data = await response.json();

            // Add current path to history before changing (if not going back)
            if (addToHistory && this.currentPath && this.currentPath !== data.path) {
                this.pathHistory.push(this.currentPath);
            }

            this.currentPath = data.path;
            this.updateBackButton();
            this.renderFileList(data);
        } catch (error) {
            console.error('Failed to load directory:', error);
            this.fileList.innerHTML = `<div class="file-item" style="color: var(--ctp-red);">Error: ${error.message}</div>`;
        }
    }

    goBack() {
        if (this.pathHistory.length > 0) {
            const previousPath = this.pathHistory.pop();
            this.loadDirectory(previousPath, false);
        }
    }

    updateBackButton() {
        this.backBtn.disabled = this.pathHistory.length === 0;
    }

    renderFileList(data) {
        // Update path display
        const displayPath = data.path.replace(/^\/Users\/[^/]+/, '~');
        this.explorerPath.textContent = displayPath;
        this.explorerPath.title = data.path;

        let html = '';

        // Add parent directory link if not at root
        if (data.parent) {
            html += `
                <div class="file-item parent-dir" data-path="${this.escapeHtml(data.parent)}" data-is-dir="true">
                    <span class="file-icon folder">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3zm-8.322.12C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139z"/>
                        </svg>
                    </span>
                    <span class="file-name">..</span>
                </div>
            `;
        }

        // Add files and folders
        for (const item of data.items) {
            const icon = item.is_dir ? this.getFolderIcon() : this.getFileIcon(item.name);
            const size = item.is_dir ? '' : this.formatSize(item.size);

            html += `
                <div class="file-item" data-path="${this.escapeHtml(item.path)}" data-is-dir="${item.is_dir}">
                    <span class="file-icon ${item.is_dir ? 'folder' : 'file'}">${icon}</span>
                    <span class="file-name" title="${this.escapeHtml(item.name)}">${this.escapeHtml(item.name)}</span>
                    <span class="file-size">${size}</span>
                </div>
            `;
        }

        this.fileList.innerHTML = html;

        // Add click handlers
        this.fileList.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.dataset.path;
                const isDir = item.dataset.isDir === 'true';

                if (isDir) {
                    this.loadDirectory(path);
                } else {
                    this.downloadFile(path);
                }
            });
        });
    }

    getFolderIcon() {
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3zm-8.322.12C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139z"/>
        </svg>`;
    }

    getFileIcon(filename) {
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3z"/>
        </svg>`;
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    downloadFile(path) {
        const url = `/api/files/download?path=${encodeURIComponent(path)}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async uploadFiles(files) {
        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`/api/files/upload?path=${encodeURIComponent(this.currentPath)}`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.detail || 'Upload failed');
                }

                console.log(`Uploaded: ${file.name}`);
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
                alert(`Failed to upload ${file.name}: ${error.message}`);
            }
        }

        // Refresh file list after upload
        this.loadDirectory(this.currentPath);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const webterm = new WebTerminal();
    webterm.init();
});
