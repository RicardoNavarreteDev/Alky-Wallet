(function () {
    const STORAGE_KEYS = {
        balance: 'm2_balance',
        contacts: 'm2_contacts',
        transactions: 'm2_transactions'
    };

    const INITIAL_BALANCE = 500000;

    const DEFAULT_CONTACTS = [
        {
            name: 'María López',
            cbu: '0000003100000000000001',
            alias: 'maria.lopez',
            bank: 'Banco Nación'
        },
        {
            name: 'Juan Pérez',
            cbu: '0000003100000000000002',
            alias: 'juan.perez',
            bank: 'Banco Provincia'
        }
    ];

    const DEFAULT_TRANSACTIONS = [
        {
            id: Date.now() - 4000,
            type: 'initial',
            amount: 0,
            detail: 'Saldo inicial disponible en la cuenta',
            balanceAfter: INITIAL_BALANCE,
            date: new Date().toISOString()
        }
    ];

    // Lee un valor JSON guardado o devuelve un valor por defecto.
    function loadJSON(key, fallback) {
        const raw = localStorage.getItem(key);

        if (!raw) {
            return fallback;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            return fallback;
        }
    }

    // Guarda una estructura JSON en localStorage.
    function saveJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // Asegura que existan saldo, contactos y movimientos iniciales.
    function ensureState() {
        if (localStorage.getItem(STORAGE_KEYS.balance) === null) {
            localStorage.setItem(STORAGE_KEYS.balance, String(INITIAL_BALANCE));
        }

        if (localStorage.getItem(STORAGE_KEYS.contacts) === null) {
            saveJSON(STORAGE_KEYS.contacts, DEFAULT_CONTACTS);
        }

        if (localStorage.getItem(STORAGE_KEYS.transactions) === null) {
            saveJSON(STORAGE_KEYS.transactions, DEFAULT_TRANSACTIONS);
        }
    }

    // Devuelve el saldo actual de la cuenta.
    function getBalance() {
        return Number(localStorage.getItem(STORAGE_KEYS.balance) || INITIAL_BALANCE);
    }

    // Actualiza el saldo guardado.
    function setBalance(balance) {
        localStorage.setItem(STORAGE_KEYS.balance, String(balance));
    }

    // Obtiene la lista de movimientos guardados.
    function getTransactions() {
        return loadJSON(STORAGE_KEYS.transactions, []);
    }

    // Guarda la lista completa de movimientos.
    function saveTransactions(transactions) {
        saveJSON(STORAGE_KEYS.transactions, transactions);
    }

    // Obtiene la lista de contactos guardados.
    function getContacts() {
        return loadJSON(STORAGE_KEYS.contacts, []);
    }

    // Guarda la lista completa de contactos.
    function saveContacts(contacts) {
        saveJSON(STORAGE_KEYS.contacts, contacts);
    }

    // Formatea valores numéricos como moneda argentina.
    function formatCurrency(value) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(value);
    }

    // Convierte un valor del input a número.
    function parseAmount(value) {
        return Number(String(value).replace(/\./g, '').replace(/,/g, '.'));
    }

    // Agrega un nuevo movimiento al historial.
    function addTransaction(type, amount, detail, balanceAfter) {
        const transactions = getTransactions();

        transactions.unshift({
            id: Date.now(),
            type,
            amount,
            detail,
            balanceAfter,
            date: new Date().toISOString()
        });

        saveTransactions(transactions);
    }

    // Devuelve una etiqueta legible para cada tipo de transacción.
    function getTipoTransaccion(type) {
        const labels = {
            initial: 'Saldo inicial',
            deposit: 'Depósito',
            purchase: 'Compra',
            transfer_received: 'Transferencia recibida',
            transfer_sent: 'Transferencia enviada',
            transferencia: 'Transferencia enviada'
        };

        return labels[type] || type || 'Movimiento';
    }

    // Muestra una alerta de Bootstrap dentro del contenedor indicado.
    function showBootstrapAlert(containerSelector, variant, title, text, options) {
        const $ = window.jQuery;

        if (!$ || !containerSelector) {
            return;
        }

        const $container = $(containerSelector);

        if (!$container.length) {
            return;
        }

        const settings = options || {};
        const alertId = `alert-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const alertHtml = [
            `<div id="${alertId}" class="alert alert-${variant} alert-dismissible fade show shadow-sm mb-0" role="alert">`,
            title ? `<strong class="me-1">${title}</strong>` : '',
            text ? `<span>${text}</span>` : '',
            '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>',
            '</div>'
        ].join('');

        if (settings.replace !== false) {
            $container.empty();
        }

        $container.append(alertHtml);

        if (settings.autoHide === false) {
            return;
        }

        window.setTimeout(function () {
            const alertElement = document.getElementById(alertId);

            if (!alertElement) {
                return;
            }

            if (window.bootstrap && window.bootstrap.Alert) {
                window.bootstrap.Alert.getOrCreateInstance(alertElement).close();
                return;
            }

            alertElement.remove();
        }, settings.delay || 2500);
    }

    // Muestra mensajes usando SweetAlert2 y permite redirección opcional.
    function showMessage(options) {
        const settings = {
            icon: options.icon || 'info',
            title: options.title || '',
            text: options.text || '',
            confirmButtonText: options.confirmButtonText || 'Aceptar'
        };

        if (window.Swal && typeof window.Swal.fire === 'function') {
            return window.Swal.fire(settings).then(function () {
                if (options.redirectTo) {
                    window.location.href = options.redirectTo;
                }
            });
        }

        console.warn('SweetAlert2 no está disponible.');

        if (options.redirectTo) {
            window.location.href = options.redirectTo;
        }

        return Promise.resolve();
    }

    // Expone las utilidades para que las usen las páginas.
    window.BankApp = {
        ensureState,
        getBalance,
        setBalance,
        getTransactions,
        saveTransactions,
        getContacts,
        saveContacts,
        formatCurrency,
        parseAmount,
        addTransaction,
        getTipoTransaccion,
        showBootstrapAlert,
        showMessage,
        constants: {
            DEMO_EMAIL: 'ricardo@demo.com',
            DEMO_PASSWORD: '123456'
        }
    };
})();