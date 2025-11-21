class TriviaGame {
    constructor() {
        this.configScreen = document.getElementById('config-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultsScreen = document.getElementById('results-screen');
        this.configForm = document.getElementById('config-form');
        this.loading = document.getElementById('loading');
        
        this.playerName = '';
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.timer = null;
        this.timeLeft = 20;
        this.totalTime = 0;
        this.startTime = 0;
        
        this.categories = [];
        
        this.init();
    }
    
    async init() {
        await this.loadCategories();
        this.setupEventListeners();
    }
    
    async loadCategories() {
        try {
            this.categories = [
                { id: 31, name: "Anime & Manga" },
                { id: 32, name: "Cartoons & Animacion" },
                { id: 29, name: "Comics" },
                { id: 14, name: "Television" },
                { id: 15, name: "Videojuegos" }
            ];
            
            this.populateCategorySelect();
        } catch (error) {
            console.error('Error loading Tematicas:', error);
            this.categories = [
                { id: 31, name: "Anime & Manga" },
                { id: 32, name: "Cartoons & Animacion" },
                { id: 29, name: "Comics" },
                { id: 14, name: "Television" },
                { id: 15, name: "Videojuegos" }
            ];
            this.populateCategorySelect();
        }
    }
    
    populateCategorySelect() {
        const categorySelect = document.getElementById('Tematica');
        categorySelect.innerHTML = '<option value="">Todas las Tematicas</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    
    setupEventListeners() {
        this.configForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.startGame();
        });
        
        document.getElementById('play-again').addEventListener('click', () => {
            this.playAgain();
        });
        
        document.getElementById('new-config').addEventListener('click', () => {
            this.showConfigScreen();
        });
        
        document.getElementById('player-name').addEventListener('input', (e) => {
            this.validateName(e.target.value);
        });
    }
    
    validateName(name) {
        const errorMsg = document.getElementById('name-error');
        if (name.length < 2 || name.length > 20) {
            errorMsg.textContent = 'El nombre debe tener entre 2 y 20 caracteres';
            return false;
        } else {
            errorMsg.textContent = '';
            return true;
        }
    }
    
    async startGame() {
        const playerName = document.getElementById('player-name').value;
        
        if (!this.validateName(playerName)) {
            return;
        }
        
        this.playerName = playerName;
        const questionCount = parseInt(document.getElementById('question-count').value);
        const difficulty = document.getElementById('difficulty').value;
        const category = document.getElementById('Tematica').value;
        
        this.showLoading();
        
        try {
            await this.fetchQuestions(questionCount, category, difficulty);
            this.hideLoading();
            this.showGameScreen();
            this.displayQuestion();
        } catch (error) {
            this.hideLoading();
            alert('Error al cargar las preguntas. Intenta nuevamente.');
            console.error('Error fetching questions:', error);
        }
    }
    
    async fetchQuestions(amount, category, difficulty) {
        let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
        
        if (category) {
            url += `&category=${category}`;
        }
        
        if (difficulty) {
            url += `&difficulty=${difficulty}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.response_code === 0) {
            this.questions = data.results;
        } else {
            throw new Error('No se pudieron cargar las preguntas');
        }
    }
    
    showLoading() {
        this.loading.classList.remove('hidden');
    }
    
    hideLoading() {
        this.loading.classList.add('hidden');
    }
    
    showGameScreen() {
        this.configScreen.classList.remove('active');
        this.resultsScreen.classList.remove('active');
        this.gameScreen.classList.add('active');
        
        document.getElementById('player-display').textContent = `Jugador: ${this.playerName}`;
        this.updateScoreDisplay();
    }
    
    showConfigScreen() {
        this.gameScreen.classList.remove('active');
        this.resultsScreen.classList.remove('active');
        this.configScreen.classList.add('active');
    }
    
    showResultsScreen() {
        this.gameScreen.classList.remove('active');
        this.resultsScreen.classList.add('active');
        this.displayResults();
    }
    
};