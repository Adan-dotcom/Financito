// Gestión del estado de la aplicación
const AppState = {
    currentUser: null,
    currentScreen: 'login',
    users: JSON.parse(localStorage.getItem('users')) || [
        { phone: '1234567890', password: '123456', name: 'Usuario Demo', balance: 1000 }
    ],
    projects: [
        {
            id: 1,
            name: 'Panadería El Buen Trigo',
            budget: 5000,
            approvalRate: 75,
            votes: 120,
            userVote: null
        },
        {
            id: 2,
            name: 'Taller de Bicicletas Las Ruedas',
            budget: 3000,
            approvalRate: 85,
            votes: 95,
            userVote: null
        }
    ],
    notifications: [
        {
            id: 1,
            title: 'Próximo pago',
            message: '¡Recuerda que tu próximo pago es en 3 días!',
            date: '2024-01-15'
        },
        {
            id: 2,
            title: 'Recompensa cercana',
            message: '¡Estás a $500 de alcanzar tu próximo reward!',
            date: '2024-01-14'
        }
    ],
    transactions: [
        { type: 'deposit', amount: 500, date: '2024-01-10' },
        { type: 'withdrawal', amount: -200, date: '2024-01-12' }
    ]
};

// Funciones de utilidad
function saveToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(AppState.users));
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    document.getElementById(screenId + 'Screen').classList.remove('hidden');
    AppState.currentScreen = screenId;
    updateUI();
}

// Gestión de autenticación
function handleLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('phoneLogin').value;
    const password = document.getElementById('passwordLogin').value;
    const user = AppState.users.find(u => u.phone === phone && u.password === password);
    
    if (user) {
        AppState.currentUser = user;
        showScreen('home');
        updateHomeScreen();
    } else {
        document.getElementById('loginError').textContent = 'Teléfono o contraseña incorrectos';
    }
}

function handleSignup(e) {
    e.preventDefault();
    const newUser = {
        phone: document.getElementById('phoneSignup').value,
        password: document.getElementById('passwordSignup').value,
        name: document.getElementById('nameSignup').value + ' ' + document.getElementById('lastNameSignup').value,
        balance: 0
    };

    if (AppState.users.some(u => u.phone === newUser.phone)) {
        alert('Este número de teléfono ya está registrado');
        return;
    }

    AppState.users.push(newUser);
    saveToLocalStorage();
    showScreen('login');
}

function handleLogout() {
    AppState.currentUser = null;
    showScreen('login');
}

// Gestión de la pantalla Home
function updateHomeScreen() {
    if (!AppState.currentUser) return;

    // Actualizar balance
    document.getElementById('balanceAmount').textContent = 
        `$${AppState.currentUser.balance.toFixed(2)}`;

    // Actualizar barra de progreso
    const progress = (AppState.currentUser.balance / 5000) * 100;
    document.getElementById('rewardProgress').style.width = `${Math.min(progress, 100)}%`;
    document.getElementById('rewardAmount').textContent = 
        `$${(5000 - AppState.currentUser.balance).toFixed(2)} para siguiente recompensa`;

    updateTransactionHistory();
}

function updateTransactionHistory() {
    const historyContainer = document.getElementById('transactionsList');
    historyContainer.innerHTML = '';

    AppState.transactions.forEach(tx => {
        const txElement = document.createElement('div');
        txElement.className = `transaction-item ${tx.type}`;
        txElement.innerHTML = `
            <span>${tx.type === 'deposit' ? 'Depósito' : 'Retiro'}</span>
            <span>${tx.type === 'deposit' ? '+' : ''}${tx.amount}</span>
        `;
        historyContainer.appendChild(txElement);
    });
}

// Gestión de transacciones
function handleDeposit() {
    const amount = parseFloat(prompt('Ingrese la cantidad a depositar:'));
    if (isNaN(amount) || amount <= 0) {
        alert('Por favor ingrese una cantidad válida');
        return;
    }

    AppState.currentUser.balance += amount;
    AppState.transactions.unshift({
        type: 'deposit',
        amount: amount,
        date: new Date().toISOString().split('T')[0]
    });

    saveToLocalStorage();
    updateHomeScreen();
}

function handleWithdrawal() {
    const amount = parseFloat(prompt('Ingrese la cantidad a retirar:'));
    if (isNaN(amount) || amount <= 0 || amount > AppState.currentUser.balance) {
        alert('Cantidad inválida o saldo insuficiente');
        return;
    }

    AppState.currentUser.balance -= amount;
    AppState.transactions.unshift({
        type: 'withdrawal',
        amount: -amount,
        date: new Date().toISOString().split('T')[0]
    });

    saveToLocalStorage();
    updateHomeScreen();
}

// Gestión de notificaciones
function updateNotificationsScreen() {
    const container = document.getElementById('notificationsList');
    container.innerHTML = '';

    AppState.notifications.forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.className = 'notification-card';
        notificationElement.innerHTML = `
            <h3 class="notification-title">${notification.title}</h3>
            <p>${notification.message}</p>
            <span class="notification-date">${notification.date}</span>
        `;
        container.appendChild(notificationElement);
    });
}

// Gestión de votaciones
function updateVotingScreen() {
    const container = document.getElementById('projectsList');
    container.innerHTML = '';

    AppState.projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project-card';
        projectElement.innerHTML = `
            <h3 class="project-title">${project.name}</h3>
            <p>Presupuesto: $${project.budget}</p>
            <div class="progress-bar">
                <div class="progress" style="width: ${project.approvalRate}%"></div>
            </div>
            <p>${project.approvalRate}% aprobación (${project.votes} votos)</p>
            ${project.userVote === null ? `
                <div class="vote-buttons">
                    <button onclick="handleVote(${project.id}, true)" class="btn btn-primary">Sí</button>
                    <button onclick="handleVote(${project.id}, false)" class="btn btn-outline">No</button>
                </div>
            ` : ''}
        `;
        container.appendChild(projectElement);
    });
}

function handleVote(projectId, vote) {
    const project = AppState.projects.find(p => p.id === projectId);
    if (!project || project.userVote !== null) return;

    project.votes++;
    project.approvalRate = vote
        ? ((project.approvalRate * (project.votes - 1) + 100) / project.votes)
        : ((project.approvalRate * (project.votes - 1)) / project.votes);
    project.userVote = vote;

    updateVotingScreen();
}

// Inicialización y event listeners
function initializeApp() {
    // Event listeners para navegación
    document.getElementById('goToSignup').addEventListener('click', () => showScreen('signup'));
    document.getElementById('backToLogin').addEventListener('click', () => showScreen('login'));
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Event listeners para formularios
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);

    // Event listeners para acciones de Home
    document.getElementById('depositBtn').addEventListener('click', handleDeposit);
    document.getElementById('withdrawBtn').addEventListener('click', handleWithdrawal);
    document.getElementById('toggleHistory').addEventListener('click', () => {
        const history = document.getElementById('transactionHistory');
        history.classList.toggle('hidden');
    });

    // Event listeners para navegación principal
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const screen = btn.dataset.screen;
        if (screen) {
            btn.addEventListener('click', () => showScreen(screen));
        }
    });

    // Función general de actualización de UI
    function updateUI() {
        switch (AppState.currentScreen) {
            case 'home':
                updateHomeScreen();
                break;
            case 'notifications':
                updateNotificationsScreen();
                break;
            case 'voting':
                updateVotingScreen();
                break;
        }
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeApp);