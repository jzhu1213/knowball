// Fantasy Football Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize fantasy page
    initializeFantasyPage();
});

function initializeFantasyPage() {
    // Add event listeners for player interactions
    addPlayerInteractionListeners();
    
    // Initialize drag and drop for lineup management
    initializeDragAndDrop();
    
    // Add search functionality
    initializePlayerSearch();
    
    // Update projected totals
    updateProjectedTotals();
}

// Player Interaction Listeners
function addPlayerInteractionListeners() {
    // Swap button listeners
    const swapButtons = document.querySelectorAll('.swap-btn');
    swapButtons.forEach(button => {
        button.addEventListener('click', handlePlayerSwap);
    });
    
    // Start button listeners (bench to lineup)
    const startButtons = document.querySelectorAll('.start-btn');
    startButtons.forEach(button => {
        button.addEventListener('click', handleMoveToLineup);
    });
    
    // Add button listeners (available players)
    const addButtons = document.querySelectorAll('.add-btn');
    addButtons.forEach(button => {
        button.addEventListener('click', handleAddPlayer);
    });
    
    // Lineup slot click listeners
    const lineupSlots = document.querySelectorAll('.lineup-slot');
    lineupSlots.forEach(slot => {
        slot.addEventListener('click', handleLineupSlotClick);
    });
}

// Handle Player Swap
function handlePlayerSwap(event) {
    event.stopPropagation();
    const lineupSlot = event.target.closest('.lineup-slot');
    const position = lineupSlot.dataset.position;
    
    // Show available players for this position
    showPlayerSelectionModal(position, lineupSlot);
}

// Handle Move Player to Lineup
function handleMoveToLineup(event) {
    event.stopPropagation();
    const benchPlayer = event.target.closest('.bench-player');
    const playerName = benchPlayer.querySelector('.player-name').textContent;
    
    // Find compatible lineup slot
    const playerPosition = getPlayerPosition(benchPlayer);
    const availableSlot = findAvailableLineupSlot(playerPosition);
    
    if (availableSlot) {
        movePlayerToLineup(benchPlayer, availableSlot);
        showNotification(`${playerName} moved to lineup!`, 'success');
    } else {
        showNotification(`No available ${playerPosition} slots`, 'error');
    }
}

// Handle Add Player
function handleAddPlayer(event) {
    event.stopPropagation();
    const availablePlayer = event.target.closest('.available-player');
    const playerName = availablePlayer.querySelector('.player-name').textContent;
    
    // Add to bench
    addPlayerToBench(availablePlayer);
    showNotification(`${playerName} added to bench!`, 'success');
}

// Handle Lineup Slot Click
function handleLineupSlotClick(event) {
    const slot = event.target.closest('.lineup-slot');
    if (!slot.classList.contains('filled')) {
        const position = slot.dataset.position;
        showPlayerSelectionModal(position, slot);
    }
}

// Drag and Drop Functionality
function initializeDragAndDrop() {
    const draggableElements = document.querySelectorAll('.lineup-slot, .bench-player');
    const dropZones = document.querySelectorAll('.lineup-slot');
    
    draggableElements.forEach(element => {
        element.draggable = true;
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragend', handleDragEnd);
    });
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
    });
}

// Drag Event Handlers
function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', '');
    event.target.classList.add('dragging');
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDragEnter(event) {
    event.preventDefault();
    event.target.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.target.classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    event.target.classList.remove('drag-over');
    
    const dragging = document.querySelector('.dragging');
    const dropTarget = event.target.closest('.lineup-slot');
    
    if (dragging && dropTarget && canDropPlayer(dragging, dropTarget)) {
        swapPlayers(dragging, dropTarget);
    }
}

// Player Search Functionality
function initializePlayerSearch() {
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', handlePlayerSearch);
    }
}

function handlePlayerSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const availablePlayers = document.querySelectorAll('.available-player');
    
    availablePlayers.forEach(player => {
        const playerName = player.querySelector('.player-name').textContent.toLowerCase();
        const playerTeam = player.querySelector('.player-team').textContent.toLowerCase();
        
        if (playerName.includes(searchTerm) || playerTeam.includes(searchTerm)) {
            player.style.display = 'flex';
        } else {
            player.style.display = 'none';
        }
    });
}

// Utility Functions
function getPlayerPosition(playerElement) {
    const teamText = playerElement.querySelector('.player-team').textContent;
    const position = teamText.split(' - ')[1];
    return position || 'FLEX';
}

function findAvailableLineupSlot(position) {
    const slots = document.querySelectorAll(`[data-position="${position}"]`);
    for (let slot of slots) {
        if (!slot.classList.contains('filled')) {
            return slot;
        }
    }
    
    // Check FLEX slot if no position-specific slot available
    if (position === 'RB' || position === 'WR' || position === 'TE') {
        const flexSlot = document.querySelector('[data-position="FLEX"]');
        if (flexSlot && !flexSlot.classList.contains('filled')) {
            return flexSlot;
        }
    }
    
    return null;
}

function movePlayerToLineup(benchPlayer, lineupSlot) {
    // Create lineup player element
    const playerData = extractPlayerData(benchPlayer);
    populateLineupSlot(lineupSlot, playerData);
    
    // Remove from bench
    benchPlayer.remove();
    
    // Update projected totals
    updateProjectedTotals();
}

function addPlayerToBench(availablePlayer) {
    const benchContainer = document.querySelector('.bench-players');
    const playerData = extractPlayerData(availablePlayer);
    
    // Create bench player element
    const benchElement = createBenchPlayerElement(playerData);
    benchContainer.appendChild(benchElement);
    
    // Remove from available players
    availablePlayer.remove();
    
    // Add event listeners to new element
    const startBtn = benchElement.querySelector('.start-btn');
    startBtn.addEventListener('click', handleMoveToLineup);
}

function extractPlayerData(playerElement) {
    return {
        name: playerElement.querySelector('.player-name').textContent,
        team: playerElement.querySelector('.player-team').textContent,
        projected: playerElement.querySelector('.projected').textContent,
        image: playerElement.querySelector('img').src
    };
}

function populateLineupSlot(slot, playerData) {
    slot.classList.add('filled');
    
    // Update player info
    const img = slot.querySelector('.player-info img');
    const name = slot.querySelector('.player-name');
    const team = slot.querySelector('.player-team');
    const projected = slot.querySelector('.projected');
    
    if (img) img.src = playerData.image;
    if (name) name.textContent = playerData.name;
    if (team) team.textContent = playerData.team;
    if (projected) projected.textContent = playerData.projected;
    
    // Add playing status
    const status = slot.querySelector('.status');
    if (status) {
        status.textContent = 'Playing';
        status.className = 'status playing';
    }
}

function createBenchPlayerElement(playerData) {
    const benchPlayer = document.createElement('div');
    benchPlayer.className = 'bench-player';
    benchPlayer.innerHTML = `
        <img src="${playerData.image}" alt="Player">
        <div class="player-info">
            <span class="player-name">${playerData.name}</span>
            <span class="player-team">${playerData.team}</span>
        </div>
        <div class="player-stats">
            <span class="projected">${playerData.projected}</span>
            <button class="start-btn" title="Move to Lineup">
                <i class="fas fa-arrow-up"></i>
            </button>
        </div>
    `;
    return benchPlayer;
}

function canDropPlayer(dragging, dropTarget) {
    const draggingPosition = getPlayerPosition(dragging);
    const targetPosition = dropTarget.dataset.position;
    
    // Check if positions are compatible
    return (
        draggingPosition === targetPosition ||
        (targetPosition === 'FLEX' && ['RB', 'WR', 'TE'].includes(draggingPosition))
    );
}

function swapPlayers(player1, player2) {
    // Implementation for swapping players between slots
    showNotification('Players swapped!', 'success');
    updateProjectedTotals();
}

function updateProjectedTotals() {
    const projectedElements = document.querySelectorAll('.lineup-slot .projected');
    let total = 0;
    
    projectedElements.forEach(element => {
        const points = parseFloat(element.textContent) || 0;
        total += points;
    });
    
    const totalElement = document.querySelector('.projected-total .total');
    if (totalElement) {
        totalElement.textContent = total.toFixed(1);
    }
}

function showPlayerSelectionModal(position, slot) {
    // Create modal for player selection
    const modal = document.createElement('div');
    modal.className = 'player-selection-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Select ${position}</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="available-players-list">
                    <!-- Available players for this position -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add close functionality
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => modal.remove());
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.background = '#4CAF50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Real-time score updates (mock function)
function updateLiveScores() {
    // This would connect to real APIs in production
    const scores = document.querySelectorAll('.score');
    scores.forEach(score => {
        // Simulate score updates
        if (Math.random() < 0.1) { // 10% chance of update
            const currentScore = parseFloat(score.textContent);
            const newScore = currentScore + (Math.random() * 5);
            score.textContent = newScore.toFixed(1);
        }
    });
}

// Initialize periodic updates
setInterval(updateLiveScores, 30000); // Update every 30 seconds 