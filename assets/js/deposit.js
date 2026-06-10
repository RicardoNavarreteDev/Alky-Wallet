(function () {
    const app = window.BankApp;

    // Captura el depósito, actualiza el saldo y guarda el movimiento.
    function initDeposit() {
        const $ = window.jQuery;
        const $form = $('#depositForm');

        if (!$form.length) {
            return;
        }

        $('#currentBalance').text(app.formatCurrency(app.getBalance()));

        $form.on('submit', function (event) {
            event.preventDefault();

            const amount = app.parseAmount($('#depositAmount').val());

            if (!Number.isFinite(amount) || amount <= 0) {
                app.showBootstrapAlert('#alert-container', 'danger', 'Monto inválido', 'Ingresa un monto válido para depositar.');
                return;
            }

            const newBalance = app.getBalance() + amount;
            app.setBalance(newBalance);
            app.addTransaction('deposit', amount, `Depósito de ${app.formatCurrency(amount)}`, newBalance);

            $('#currentBalance').text(app.formatCurrency(newBalance));
            $('#depositLegend').html(`<div class="alert alert-info border-0 mb-0">Monto depositado: <strong>${app.formatCurrency(amount)}</strong></div>`);

            app.showBootstrapAlert('#alert-container', 'success', 'Depósito realizado', `Nuevo saldo: ${app.formatCurrency(newBalance)}.`);

            window.setTimeout(function () {
                window.location.href = 'menu.html';
            }, 2000);
        });
    }

    $(initDeposit);
})();