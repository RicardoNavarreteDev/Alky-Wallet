(function () {
    const app = window.BankApp;

    // Valida el acceso y redirige al menú principal.
    function initLogin() {
        const $ = window.jQuery;
        const $form = $('#loginForm');

        if (!$form.length) {
            return;
        }

        $form.on('submit', function (event) {
            event.preventDefault();

            const email = $('#email').val().trim();
            const password = $('#password').val().trim();

            if (email === app.constants.DEMO_EMAIL && password === app.constants.DEMO_PASSWORD) {
                sessionStorage.setItem('m2_logged_in', 'true');
                sessionStorage.setItem('m2_user_email', email);
                app.ensureState();
                app.showBootstrapAlert('#alert-container', 'success', 'Inicio de sesión exitoso', 'Redirigiendo al menú principal.');

                window.setTimeout(function () {
                    window.location.href = 'menu.html';
                }, 1400);
                return;
            }

            app.showBootstrapAlert('#alert-container', 'danger', 'Credenciales incorrectas', 'Verifica el email y la contraseña.');
        });
    }

    $(initLogin);
})();