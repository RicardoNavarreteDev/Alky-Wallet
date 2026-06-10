(function () {
    const app = window.BankApp;

    // Muestra el usuario logiado, el saldo actual y controla la navegación de los botones.
    function initMenu() {
        const $ = window.jQuery;

        if (sessionStorage.getItem('m2_logged_in') !== 'true') {
            window.location.href = 'login.html';
            return;
        }

        const $userEmailElement = $('#menuUserEmail');
        const $balanceElement = $('#menuBalance');
        const $logoutBtn = $('#logoutBtn');

        if ($userEmailElement.length) {
            $userEmailElement.text(sessionStorage.getItem('m2_user_email') || 'Usuario');
        }

        if ($balanceElement.length) {
            $balanceElement.text(app.formatCurrency(app.getBalance()));
        }

        if ($logoutBtn.length) {
            $logoutBtn.on('click', function () {
                sessionStorage.removeItem('m2_logged_in');
                sessionStorage.removeItem('m2_user_email');
                window.location.href = 'login.html';
            });
        }

        const navigationMap = [
            ['menuDepositBtn', 'deposit.html', 'depósito'],
            ['menuSendBtn', 'sendmoney.html', 'enviar dinero'],
            ['menuTransactionsBtn', 'transactions.html', 'últimos movimientos']
        ];

        navigationMap.forEach(function ([buttonId, target, label]) {
            const $button = $('#' + buttonId);

            if (!$button.length) {
                return;
            }

            $button.on('click', function () {
                window.location.href = target;
            });
        });
    }

    $(initMenu);
})();