(function () {
    const app = window.BankApp;

    function initSendMoney() {
        const $ = window.jQuery;
        const $sendForm = $('#sendMoneyForm');
        const $contactSearchForm = $('#contactSearchForm');
        const $contactSearch = $('#contactSearch');
        const $contactsList = $('#contactsList');
        const $selectedContactBox = $('#selectedContactBox');
        const $sendMoneyBtn = $('#sendMoneyBtn');
        const $toggleContactFormBtn = $('#toggleContactFormBtn');
        const $contactForm = $('#contactForm');
        const $cancelContactBtn = $('#cancelContactBtn');
        const $cancelContactFormBtn = $('#cancelContactFormBtn');
        const $saveContactBtn = $('#saveContactBtn');
        const $sendConfirmationContainer = $('#sendConfirmationContainer');
        const contactModalElement = document.getElementById('newContactModal');
        const contactModal = contactModalElement && window.bootstrap
            ? window.bootstrap.Modal.getOrCreateInstance(contactModalElement)
            : null;

        if (!$sendForm.length) {
            return;
        }

        let selectedContactIndex = null;
        let currentSearch = '';

        function normalizeValue(value) {
            return String(value || '').trim().toLowerCase();
        }

        function getFilteredContacts() {
            const contacts = app.getContacts();
            const query = normalizeValue(currentSearch);

            if (!query) {
                return contacts.map(function (contact, index) {
                    return {
                        contact: contact,
                        index: index
                    };
                });
            }

            return contacts
                .map(function (contact, index) {
                    return {
                        contact: contact,
                        index: index
                    };
                })
                .filter(function (item) {
                    return normalizeValue(item.contact.name).includes(query) || normalizeValue(item.contact.alias).includes(query);
                });
        }

        function renderContacts() {
            const filteredContacts = getFilteredContacts();

            if (!filteredContacts.length) {
                $contactsList.html('<div class="list-group-item text-center text-muted">No hay contactos que coincidan con la búsqueda.</div>');
                selectedContactIndex = null;
                refreshSelection();
                return;
            }

            const selectedStillVisible = selectedContactIndex !== null && filteredContacts.some(function (item) {
                return item.index === selectedContactIndex;
            });

            if (!selectedStillVisible) {
                selectedContactIndex = null;
            }

            $contactsList.html(filteredContacts.map(function (item) {
                const contact = item.contact;
                const isSelected = selectedContactIndex === item.index;

                return [
                    `<button type="button" class="list-group-item list-group-item-action contact-item ${isSelected ? 'is-selected' : ''}" data-index="${item.index}">`,
                    '<div class="d-flex justify-content-between align-items-start gap-3">',
                    '<div>',
                    `<div class="fw-semibold">${contact.name}</div>`,
                    `<div class="contact-chip mt-2">@${contact.alias}</div>`,
                    `<div class="small text-muted mt-2">${contact.bank}</div>`,
                    '</div>',
                    '<div class="text-end small text-muted">',
                    `<div>CBU ${contact.cbu}</div>`,
                    isSelected ? '<div class="badge text-bg-success mt-2">Seleccionado</div>' : '',
                    '</div>',
                    '</div>',
                    '</button>'
                ].join('');
            }).join(''));
        }

        function refreshSelection() {
            const contacts = app.getContacts();
            const contact = selectedContactIndex !== null ? contacts[selectedContactIndex] : null;

            if (!contact) {
                $selectedContactBox.text('Selecciona un contacto para habilitar el envío.');
                $sendMoneyBtn.addClass('d-none');
                $contactsList.find('.contact-item').removeClass('is-selected');
                return;
            }

            $selectedContactBox.html(`<strong>${contact.name}</strong><br><span class="text-muted">@${contact.alias} · ${contact.bank}</span>`);
            $sendMoneyBtn.removeClass('d-none');
            $contactsList.find('.contact-item').removeClass('is-selected');
            $contactsList.find(`[data-index="${selectedContactIndex}"]`).addClass('is-selected');
        }

        function closeContactForm() {
            $contactForm.trigger('reset');
            if (contactModal) {
                contactModal.hide();
            }
        }

        function openContactForm() {
            if (contactModal) {
                contactModal.show();
                return;
            }

            $('#contactName').trigger('focus');
        }

        renderContacts();
        refreshSelection();

        if (contactModalElement) {
            contactModalElement.addEventListener('shown.bs.modal', function () {
                $('#contactName').trigger('focus');
            });

            contactModalElement.addEventListener('hidden.bs.modal', function () {
                $contactForm.trigger('reset');
            });
        }

        $contactSearch.on('input', function () {
            currentSearch = $contactSearch.val();
            renderContacts();
            refreshSelection();
        });

        $contactSearchForm.on('submit', function (event) {
            event.preventDefault();
            currentSearch = $contactSearch.val();
            renderContacts();
            refreshSelection();
        });

        $contactsList.on('click', '.contact-item', function () {
            selectedContactIndex = Number($(this).data('index'));
            refreshSelection();
        });

        $toggleContactFormBtn.on('click', function () {
            openContactForm();
        });

        $cancelContactBtn.on('click', closeContactForm);
        $cancelContactFormBtn.on('click', closeContactForm);

        $saveContactBtn.on('click', function () {
            const name = $('#contactName').val().trim();
            const cbu = $('#contactCbu').val().trim();
            const alias = $('#contactAlias').val().trim();
            const bank = $('#contactBank').val().trim();

            if (!name || !alias || !bank) {
                app.showBootstrapAlert('#alert-container', 'danger', 'Faltan datos', 'Completa todos los campos del nuevo contacto.');
                return;
            }

            if (!/^\d{22}$/.test(cbu)) {
                app.showBootstrapAlert('#alert-container', 'danger', 'CBU inválido', 'El número de CBU debe tener 22 dígitos.');
                return;
            }

            const contacts = app.getContacts();
            contacts.push({ name: name, cbu: cbu, alias: alias, bank: bank });
            app.saveContacts(contacts);

            $contactForm.trigger('reset');
            closeContactForm();
            selectedContactIndex = contacts.length - 1;
            currentSearch = '';
            $contactSearch.val('');
            renderContacts();
            refreshSelection();

            app.showBootstrapAlert('#alert-container', 'success', 'Contacto agregado', `Contacto ${name} agregado correctamente.`);
        });

        $sendForm.on('submit', function (event) {
            event.preventDefault();

            const contacts = app.getContacts();
            const contact = selectedContactIndex !== null ? contacts[selectedContactIndex] : null;
            const amount = app.parseAmount($('#sendAmount').val());

            if (!contact) {
                app.showBootstrapAlert('#alert-container', 'danger', 'Contacto no seleccionado', 'Selecciona un contacto para enviar dinero.');
                return;
            }

            if (!Number.isFinite(amount) || amount <= 0) {
                app.showBootstrapAlert('#alert-container', 'danger', 'Monto inválido', 'Ingresa un monto válido para enviar.');
                return;
            }

            const balance = app.getBalance();

            if (amount > balance) {
                app.showBootstrapAlert('#alert-container', 'danger', 'Saldo insuficiente', 'Saldo insuficiente para realizar la transferencia.');
                return;
            }

            const newBalance = balance - amount;
            app.setBalance(newBalance);
            app.addTransaction('transfer_sent', -amount, `Transferencia a ${contact.name} (${contact.alias})`, newBalance);

            $('#sendAmount').val('');
            app.showBootstrapAlert(
                '#sendConfirmationContainer',
                'success',
                'Transferencia enviada',
                `Se enviaron ${app.formatCurrency(amount)} a ${contact.name}. Nuevo saldo: ${app.formatCurrency(newBalance)}.`,
                { autoHide: false }
            );
        });
    }

    $(initSendMoney);
})();