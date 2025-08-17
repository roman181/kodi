// Bruchsal Hustle - Game Logic
class BruchsalHustle {
    constructor() {
        this.gameState = {
            player: {
                name: "",
                character: "none",
                money: 50,
                health: 100,
                respect: 0,
                level: 1,
                currentLocation: "zentrum",
                inventory: {
                    weapons: [],
                    luxuryItems: [],
                    drugs: []
                },
                bodyguards: [],
                isWorking: false,
                workEndTime: null,
                lastMissionTime: 0
            },
            gameTime: {
                hours: 8,
                minutes: 0,
                day: 1
            },
            currentScreen: "character-selection",
            currentMission: null,
            policeHeat: 0
        };

        this.gameData = {
            locations: ["Bruchsal Zentrum", "Bahnhofsgebiet", "Industriegebiet", "Wohnviertel", "Stadtpark"],
            legalJobs: [
                {name: "Konstruktion", pay: 80, hours: 8},
                {name: "Spülen", pay: 60, hours: 8},
                {name: "LKW fahren", pay: 100, hours: 8},
                {name: "Müll sammeln", pay: 50, hours: 8}
            ],
            illegalMissions: [
                {type: "Autodiebstahl", reward: [150, 300], risk: "medium", time: 2},
                {type: "Taschendiebstahl", reward: [20, 50], risk: "low", time: 1},
                {type: "Einbruch", reward: [200, 500], risk: "high", time: 3},
                {type: "Drogenverkauf", reward: [100, 200], risk: "medium", time: 1}
            ],
            weapons: [
                {name: "Schlagring", price: 50, damage: 10},
                {name: "Messer", price: 100, damage: 20},
                {name: "Pistole", price: 500, damage: 50}
            ],
            luxuryItems: [
                {name: "Goldkette", price: 200, respect: 5},
                {name: "Luxusuhr", price: 500, respect: 10},
                {name: "Designerkleidung", price: 300, respect: 8}
            ],
            npcs: [
                {name: "Klaus", type: "dealer", location: "Zentrum"},
                {name: "Maria", type: "customer", location: "Bahnhof"},
                {name: "Viktor", type: "boss", location: "Industriegebiet"},
                {name: "Anna", type: "informant", location: "Park"},
                {name: "Tommy", type: "contact", location: "Wohnviertel"}
            ]
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.startGameLoop();
        this.showScreen("character-selection");
    }

    bindEvents() {
        // Character selection
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectCharacter(e));
        });

        document.getElementById('start-game').addEventListener('click', () => this.startGame());

        // Main game actions
        document.getElementById('smartphone-btn').addEventListener('click', () => this.openSmartphone());
        document.getElementById('close-phone').addEventListener('click', () => this.closeSmartphone());
        document.getElementById('legal-work-btn').addEventListener('click', () => this.showLegalWork());
        document.getElementById('street-deal-btn').addEventListener('click', () => this.generateStreetDeal());

        // App icons
        document.querySelectorAll('.app-icon').forEach(icon => {
            icon.addEventListener('click', (e) => this.openApp(e.currentTarget.dataset.app));
        });

        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => this.goBack());
        });

        // Mission actions
        document.getElementById('accept-mission').addEventListener('click', () => this.acceptMission());
        document.getElementById('decline-mission').addEventListener('click', () => this.declineMission());

        // Bodyguard hiring
        document.getElementById('hire-bodyguard').addEventListener('click', () => this.hireBodyguard());

        // Shop categories
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchShopCategory(e));
        });

        // Modal events
        document.getElementById('event-accept').addEventListener('click', () => this.handleEventAccept());
        document.getElementById('event-decline').addEventListener('click', () => this.handleEventDecline());
    }

    selectCharacter(e) {
        document.querySelectorAll('.character-card').forEach(card => card.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        this.gameState.player.character = e.currentTarget.dataset.character;
    }

    startGame() {
        const name = document.getElementById('player-name').value.trim();
        if (!name || this.gameState.player.character === "none") {
            this.showNotification("Bitte wähle einen Charakter und gib deinen Namen ein!", "error");
            return;
        }

        this.gameState.player.name = name;
        document.getElementById('player-name-display').textContent = name;
        this.showScreen("main-game");
        this.updateUI();
        this.showNotification(`Willkommen in Bruchsal, ${name}!`, "success");
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        this.gameState.currentScreen = screenId;
    }

    openSmartphone() {
        this.showScreen("smartphone-screen");
    }

    closeSmartphone() {
        this.showScreen("main-game");
    }

    openApp(appName) {
        switch(appName) {
            case 'hustlechat':
                this.openHustleChat();
                break;
            case 'maps':
                this.showScreen("maps-screen");
                break;
            case 'contacts':
                this.openContacts();
                break;
            case 'darkweb':
                this.openDarkweb();
                break;
            case 'security':
                this.openSecurity();
                break;
            case 'takko':
                this.openTakko();
                break;
        }
    }

    goBack() {
        if (this.gameState.currentScreen.includes('-screen') && this.gameState.currentScreen !== 'smartphone-screen') {
            this.showScreen("smartphone-screen");
        } else {
            this.showScreen("main-game");
        }
    }

    openHustleChat() {
        this.showScreen("hustlechat-screen");
        this.generateChatMission();
    }

    generateChatMission() {
        const missions = this.gameData.illegalMissions;
        const randomMission = missions[Math.floor(Math.random() * missions.length)];
        const npc = this.gameData.npcs[Math.floor(Math.random() * this.gameData.npcs.length)];
        
        const reward = Math.floor(Math.random() * (randomMission.reward[1] - randomMission.reward[0])) + randomMission.reward[0];
        
        const chatContainer = document.getElementById('chat-messages');
        chatContainer.innerHTML = `
            <div class="chat-message">
                <div class="chat-sender">${npc.name}</div>
                <div class="chat-text">Hey, ich hab einen Job für dich. ${randomMission.type} in ${this.gameData.locations[Math.floor(Math.random() * this.gameData.locations.length)]}. Zahlt €${reward}. Risiko: ${randomMission.risk}. Interessiert?</div>
            </div>
        `;

        this.gameState.currentMission = {
            ...randomMission,
            reward: reward,
            npc: npc.name
        };

        document.getElementById('accept-mission').style.display = 'inline-block';
        document.getElementById('decline-mission').style.display = 'inline-block';
    }

    acceptMission() {
        if (!this.gameState.currentMission) return;

        const mission = this.gameState.currentMission;
        const success = this.calculateMissionSuccess(mission);

        if (success) {
            this.gameState.player.money += mission.reward;
            this.gameState.player.respect += Math.floor(mission.reward / 50);
            this.showNotification(`Mission erfolgreich! +€${mission.reward}`, "success");
        } else {
            const damage = Math.floor(Math.random() * 30) + 10;
            this.gameState.player.health = Math.max(0, this.gameState.player.health - damage);
            this.showNotification(`Mission fehlgeschlagen! -${damage} Gesundheit`, "error");
            
            if (Math.random() < 0.3) {
                this.triggerPoliceEncounter();
            }
        }

        this.gameState.policeHeat += this.getRiskValue(mission.risk);
        this.gameState.currentMission = null;
        this.gameState.player.lastMissionTime = Date.now();
        
        document.getElementById('accept-mission').style.display = 'none';
        document.getElementById('decline-mission').style.display = 'none';
        
        this.updateUI();
        setTimeout(() => this.goBack(), 1500);
    }

    declineMission() {
        this.gameState.currentMission = null;
        document.getElementById('accept-mission').style.display = 'none';
        document.getElementById('decline-mission').style.display = 'none';
        this.showNotification("Mission abgelehnt", "info");
        this.goBack();
    }

    calculateMissionSuccess(mission) {
        let successChance = 0.7; // Base 70% success rate
        
        // Modify based on risk
        const riskModifiers = {
            "low": 0.2,
            "medium": 0,
            "high": -0.3
        };
        successChance += riskModifiers[mission.risk] || 0;
        
        // Modify based on weapons
        if (this.gameState.player.inventory.weapons.length > 0) {
            successChance += 0.1;
        }
        
        // Modify based on respect
        successChance += (this.gameState.player.respect / 1000);
        
        return Math.random() < Math.max(0.1, Math.min(0.95, successChance));
    }

    getRiskValue(risk) {
        const values = {"low": 1, "medium": 3, "high": 5};
        return values[risk] || 3;
    }

    showLegalWork() {
        if (this.gameState.player.isWorking) {
            const timeLeft = Math.ceil((this.gameState.player.workEndTime - Date.now()) / (1000 * 60 * 60));
            this.showNotification(`Du arbeitest bereits! Noch ${timeLeft} Stunden.`, "info");
            return;
        }

        const job = this.gameData.legalJobs[Math.floor(Math.random() * this.gameData.legalJobs.length)];
        
        this.showEventModal(
            `Arbeitsangebot: ${job.name}`,
            `Verdienst: €${job.pay} für ${job.hours} Stunden Arbeit. Annehmen?`,
            () => this.acceptWork(job),
            () => this.hideEventModal()
        );
    }

    acceptWork(job) {
        this.gameState.player.isWorking = true;
        this.gameState.player.workEndTime = Date.now() + (job.hours * 60 * 60 * 1000); // Real-time hours
        
        setTimeout(() => {
            this.gameState.player.money += job.pay;
            this.gameState.player.isWorking = false;
            this.gameState.player.workEndTime = null;
            this.showNotification(`Arbeit beendet! +€${job.pay}`, "success");
            this.updateUI();
        }, job.hours * 60 * 60 * 1000);

        this.showNotification(`Arbeit begonnen: ${job.name}`, "success");
        this.hideEventModal();
        this.updateUI();
    }

    generateStreetDeal() {
        if (Date.now() - this.gameState.player.lastMissionTime < 300000) { // 5 minute cooldown
            this.showNotification("Warte noch etwas, bevor du den nächsten Deal machst.", "warning");
            return;
        }

        const dealTypes = [
            "Ein Typ will Drogen kaufen",
            "Jemand bietet gestohlene Waren an",
            "Ein Tourist braucht 'Schutz'",
            "Illegales Glücksspiel läuft"
        ];

        const deal = dealTypes[Math.floor(Math.random() * dealTypes.length)];
        const reward = Math.floor(Math.random() * 100) + 30;

        this.showEventModal(
            "Straßengeschäft",
            `${deal}. Möglicher Verdienst: €${reward}. Risiko: Polizei könnte auftauchen.`,
            () => this.executeStreetDeal(reward),
            () => this.hideEventModal()
        );
    }

    executeStreetDeal(reward) {
        const success = Math.random() > 0.3;
        
        if (success) {
            this.gameState.player.money += reward;
            this.gameState.player.respect += 1;
            this.showNotification(`Deal erfolgreich! +€${reward}`, "success");
        } else {
            this.showNotification("Deal ist schiefgegangen!", "error");
            if (Math.random() < 0.5) {
                this.triggerPoliceEncounter();
            }
        }

        this.gameState.policeHeat += 2;
        this.gameState.player.lastMissionTime = Date.now();
        this.hideEventModal();
        this.updateUI();
    }

    triggerPoliceEncounter() {
        const scenarios = [
            "Die Polizei hält dich für eine Routinekontrolle an!",
            "Du wirst bei einer Razzia erwischt!",
            "Ein Undercover-Cop hat dich im Visier!",
            "Polizei-Sirenen! Sie sind dir auf der Spur!"
        ];

        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        this.showEventModal(
            "Polizei!",
            `${scenario} Was machst du?`,
            () => this.handlePoliceConfront(),
            () => this.handlePoliceRun()
        );
    }

    handlePoliceConfront() {
        const fine = Math.floor(Math.random() * 200) + 50;
        if (this.gameState.player.money >= fine) {
            this.gameState.player.money -= fine;
            this.showNotification(`Du zahlst €${fine} Strafe`, "warning");
        } else {
            const damage = Math.floor(Math.random() * 20) + 10;
            this.gameState.player.health = Math.max(0, this.gameState.player.health - damage);
            this.showNotification(`Du kannst nicht zahlen! -${damage} Gesundheit`, "error");
        }
        
        this.gameState.policeHeat = Math.max(0, this.gameState.policeHeat - 3);
        this.hideEventModal();
        this.updateUI();
    }

    handlePoliceRun() {
        const escapeSuccess = Math.random() > 0.4;
        
        if (escapeSuccess) {
            this.showNotification("Du bist entkommen!", "success");
        } else {
            const damage = Math.floor(Math.random() * 30) + 15;
            this.gameState.player.health = Math.max(0, this.gameState.player.health - damage);
            const fine = Math.floor(Math.random() * 300) + 100;
            this.gameState.player.money = Math.max(0, this.gameState.player.money - fine);
            this.showNotification(`Gefasst! -${damage} Gesundheit, -€${fine}`, "error");
        }
        
        this.gameState.policeHeat += 2;
        this.hideEventModal();
        this.updateUI();
    }

    openContacts() {
        this.showScreen("contacts-screen");
        this.renderContacts();
    }

    renderContacts() {
        const container = document.getElementById('contacts-list');
        container.innerHTML = this.gameData.npcs.map(npc => `
            <div class="contact-item">
                <div class="contact-name">${npc.name}</div>
                <div class="contact-type">${npc.type}</div>
                <div class="contact-location">${npc.location}</div>
            </div>
        `).join('');
    }

    openDarkweb() {
        this.showScreen("darkweb-screen");
        this.renderShop('weapons');
    }

    openTakko() {
        this.showScreen("takko-screen");
        this.renderLuxuryItems();
    }

    switchShopCategory(e) {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.renderShop(e.currentTarget.dataset.category);
    }

    renderShop(category) {
        const container = document.getElementById('shop-items');
        let items = [];

        switch(category) {
            case 'weapons':
                items = this.gameData.weapons;
                break;
            case 'items':
                items = [
                    {name: "Erste Hilfe Kit", price: 100, effect: "health"},
                    {name: "Energydrink", price: 20, effect: "energy"},
                    {name: "Hack-Tool", price: 300, effect: "success"}
                ];
                break;
            case 'services':
                items = [
                    {name: "Fake ID", price: 500, effect: "police"},
                    {name: "Informant", price: 200, effect: "info"},
                    {name: "Bodyguard (1 Tag)", price: 100, effect: "protection"}
                ];
                break;
        }

        container.innerHTML = items.map((item, index) => `
            <div class="shop-item">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">€${item.price}</div>
                    ${item.damage ? `<div class="item-stats">Schaden: ${item.damage}</div>` : ''}
                    ${item.effect ? `<div class="item-stats">Effekt: ${item.effect}</div>` : ''}
                </div>
                <button class="btn btn--primary btn--sm" onclick="game.buyItem('${category}', ${index})">
                    Kaufen
                </button>
            </div>
        `).join('');
    }

    renderLuxuryItems() {
        const container = document.getElementById('luxury-items');
        container.innerHTML = this.gameData.luxuryItems.map((item, index) => `
            <div class="shop-item">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">€${item.price}</div>
                    <div class="item-stats">Respekt: +${item.respect}</div>
                </div>
                <button class="btn btn--primary btn--sm" onclick="game.buyLuxuryItem(${index})">
                    Kaufen
                </button>
            </div>
        `).join('');
    }

    buyItem(category, index) {
        let item;
        switch(category) {
            case 'weapons':
                item = this.gameData.weapons[index];
                break;
            case 'items':
                item = [
                    {name: "Erste Hilfe Kit", price: 100, effect: "health"},
                    {name: "Energydrink", price: 20, effect: "energy"},
                    {name: "Hack-Tool", price: 300, effect: "success"}
                ][index];
                break;
            case 'services':
                item = [
                    {name: "Fake ID", price: 500, effect: "police"},
                    {name: "Informant", price: 200, effect: "info"},
                    {name: "Bodyguard (1 Tag)", price: 100, effect: "protection"}
                ][index];
                break;
        }

        if (this.gameState.player.money < item.price) {
            this.showNotification("Nicht genug Geld!", "error");
            return;
        }

        this.gameState.player.money -= item.price;
        
        if (category === 'weapons') {
            this.gameState.player.inventory.weapons.push(item);
        }

        this.showNotification(`${item.name} gekauft!`, "success");
        this.updateUI();
    }

    buyLuxuryItem(index) {
        const item = this.gameData.luxuryItems[index];
        
        if (this.gameState.player.money < item.price) {
            this.showNotification("Nicht genug Geld!", "error");
            return;
        }

        this.gameState.player.money -= item.price;
        this.gameState.player.respect += item.respect;
        this.gameState.player.inventory.luxuryItems.push(item);
        
        this.showNotification(`${item.name} gekauft! +${item.respect} Respekt`, "success");
        this.updateUI();
    }

    openSecurity() {
        this.showScreen("security-screen");
        this.renderSecurity();
    }

    renderSecurity() {
        const container = document.getElementById('bodyguards-list');
        if (this.gameState.player.bodyguards.length === 0) {
            container.innerHTML = `
                <p class="security-info">Keine Bodyguards angestellt</p>
                <button id="hire-bodyguard" class="btn btn--primary">Bodyguard anheuern (€1000)</button>
            `;
        } else {
            container.innerHTML = this.gameState.player.bodyguards.map((guard, index) => `
                <div class="bodyguard-item">
                    <div class="item-name">${guard.name}</div>
                    <div class="item-stats">Level: ${guard.level} | Sold: €${guard.salary}/Tag</div>
                </div>
            `).join('');
        }
    }

    hireBodyguard() {
        if (this.gameState.player.money < 1000) {
            this.showNotification("Nicht genug Geld für einen Bodyguard!", "error");
            return;
        }

        const names = ["Bruno", "Max", "Igor", "Klaus", "Viktor"];
        const name = names[Math.floor(Math.random() * names.length)];
        
        this.gameState.player.money -= 1000;
        this.gameState.player.bodyguards.push({
            name: name,
            level: 1,
            salary: 50,
            hired: Date.now()
        });

        this.showNotification(`${name} wurde angeheuert!`, "success");
        this.renderSecurity();
        this.updateUI();
    }

    showEventModal(title, description, acceptFn, declineFn) {
        document.getElementById('event-title').textContent = title;
        document.getElementById('event-description').textContent = description;
        document.getElementById('event-modal').classList.remove('hidden');
        
        this.currentEventHandlers = { accept: acceptFn, decline: declineFn };
    }

    hideEventModal() {
        document.getElementById('event-modal').classList.add('hidden');
        this.currentEventHandlers = null;
    }

    handleEventAccept() {
        if (this.currentEventHandlers && this.currentEventHandlers.accept) {
            this.currentEventHandlers.accept();
        }
    }

    handleEventDecline() {
        if (this.currentEventHandlers && this.currentEventHandlers.decline) {
            this.currentEventHandlers.decline();
        }
    }

    updateUI() {
        document.getElementById('money-display').textContent = `€${this.gameState.player.money}`;
        document.getElementById('health-display').textContent = this.gameState.player.health;
        document.getElementById('respect-display').textContent = this.gameState.player.respect;
        
        // Add animations for money changes
        const moneyElement = document.getElementById('money-display');
        moneyElement.classList.add('money-animation');
        setTimeout(() => moneyElement.classList.remove('money-animation'), 500);
    }

    updateTime() {
        this.gameState.gameTime.minutes += 1;
        
        if (this.gameState.gameTime.minutes >= 60) {
            this.gameState.gameTime.minutes = 0;
            this.gameState.gameTime.hours += 1;
        }
        
        if (this.gameState.gameTime.hours >= 24) {
            this.gameState.gameTime.hours = 0;
            this.gameState.gameTime.day += 1;
            this.dailyMaintenance();
        }
        
        const timeString = `${String(this.gameState.gameTime.hours).padStart(2, '0')}:${String(this.gameState.gameTime.minutes).padStart(2, '0')}`;
        document.getElementById('time-display').textContent = timeString;
        
        // Curfew system (9 PM - 6 AM)
        if (this.gameState.gameTime.hours >= 21 || this.gameState.gameTime.hours < 6) {
            this.gameState.policeHeat += 0.1;
        }
    }

    dailyMaintenance() {
        // Pay bodyguard salaries
        let totalSalaries = 0;
        this.gameState.player.bodyguards.forEach(guard => {
            totalSalaries += guard.salary;
        });
        
        if (totalSalaries > 0) {
            if (this.gameState.player.money >= totalSalaries) {
                this.gameState.player.money -= totalSalaries;
                this.showNotification(`Bodyguard Löhne bezahlt: €${totalSalaries}`, "info");
            } else {
                this.gameState.player.bodyguards = [];
                this.showNotification("Bodyguards verlassen dich - kein Geld für Löhne!", "error");
            }
        }
        
        // Random daily events
        if (Math.random() < 0.3) {
            this.generateRandomEvent();
        }
        
        // Decrease police heat over time
        this.gameState.policeHeat = Math.max(0, this.gameState.policeHeat - 5);
        
        this.updateUI();
    }

    generateRandomEvent() {
        const events = [
            {
                title: "Glücksfund",
                description: "Du findest eine Brieftasche mit Geld!",
                accept: () => {
                    const money = Math.floor(Math.random() * 100) + 20;
                    this.gameState.player.money += money;
                    this.showNotification(`Glück gehabt! +€${money}`, "success");
                    this.hideEventModal();
                    this.updateUI();
                }
            },
            {
                title: "Bandenkampf",
                description: "Eine rivalisierende Gang fordert dich heraus!",
                accept: () => {
                    if (Math.random() < 0.6) {
                        const reward = Math.floor(Math.random() * 200) + 100;
                        this.gameState.player.money += reward;
                        this.gameState.player.respect += 5;
                        this.showNotification(`Kampf gewonnen! +€${reward}, +5 Respekt`, "success");
                    } else {
                        const damage = Math.floor(Math.random() * 40) + 20;
                        this.gameState.player.health = Math.max(0, this.gameState.player.health - damage);
                        this.showNotification(`Kampf verloren! -${damage} Gesundheit`, "error");
                    }
                    this.hideEventModal();
                    this.updateUI();
                }
            }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        this.showEventModal(event.title, event.description, event.accept, () => this.hideEventModal());
    }

    showNotification(message, type = "info") {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.getElementById('notifications').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    startGameLoop() {
        // Update time every 2 seconds (accelerated time)
        setInterval(() => {
            this.updateTime();
        }, 2000);
        
        // Random events check
        setInterval(() => {
            if (Math.random() < 0.1 && this.gameState.policeHeat > 10) {
                this.triggerPoliceEncounter();
            }
        }, 30000);
    }
}

// Initialize game when DOM is loaded
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new BruchsalHustle();
});