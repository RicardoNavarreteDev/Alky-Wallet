(function () {
    const app = window.BankApp;

    function initTransactions() {
        const $ = window.jQuery;
        const $list = $('#transactionsList');
        const $filter = $('#transactionFilter');

        if (!$list.length) {
            return;
        }

        function mostrarUltimosMovimientos(filtro) {
            const transactions = app.getTransactions();
            const filteredTransactions = filtro && filtro !== 'all'
                ? transactions.filter(function (transaction) {
                    return getCanonicalTransactionType(transaction.type) === filtro;
                })
                : transactions;

            if (!filteredTransactions.length) {
                $list.html('<li class="list-group-item text-center text-muted">Aún no hay movimientos para este filtro.</li>');
                return;
            }

            $list.html(filteredTransactions.map(function (transaction) {
                const amountClass = transaction.amount >= 0 ? 'text-success' : 'text-danger';
                const amountLabel = transaction.amount >= 0 ? '+' : '-';
                const absoluteAmount = app.formatCurrency(Math.abs(transaction.amount));
                const dateLabel = new Date(transaction.date).toLocaleString('es-AR');

                return [
                    '<li class="list-group-item">',
                    '<div class="d-flex justify-content-between align-items-start gap-3">',
                    '<div>',
                    `<strong>${app.getTipoTransaccion(transaction.type)}</strong>`,
                    `<div class="transaction-meta">${transaction.detail}</div>`,
                    `<div class="transaction-meta">${dateLabel}</div>`,
                    '</div>',
                    '<div class="text-end">',
                    `<div class="${amountClass} fw-bold">${amountLabel} ${absoluteAmount}</div>`,
                    `<div class="transaction-meta">Saldo: ${app.formatCurrency(transaction.balanceAfter)}</div>`,
                    '</div>',
                    '</div>',
                    '</li>'
                ].join('');
            }).join(''));
        }

        $filter.on('change', function () {
            mostrarUltimosMovimientos($(this).val());
        });

        mostrarUltimosMovimientos($filter.val());
    }

    function getCanonicalTransactionType(type) {
        const normalized = String(type || '').trim().toLowerCase();

        if (normalized === 'depósito' || normalized === 'deposito' || normalized === 'deposit') {
            return 'deposit';
        }

        if (normalized === 'compra' || normalized === 'purchase') {
            return 'purchase';
        }

        if (normalized === 'transferencia recibida' || normalized === 'transfer_received') {
            return 'transfer_received';
        }

        if (normalized === 'transferencia enviada' || normalized === 'transferencia' || normalized === 'transfer_sent') {
            return 'transfer_sent';
        }

        if (normalized === 'saldo inicial' || normalized === 'initial') {
            return 'initial';
        }

        return normalized;
    }

    $(initTransactions);
})();