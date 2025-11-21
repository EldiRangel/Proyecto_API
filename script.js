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
        
        this.categories = [
            { id: "general_knowledge", name: "Conocimiento General" },
            { id: "film_and_tv", name: "Cine y TV" },
            { id: "music", name: "Musica" },
            { id: "sport_and_leisure", name: "Deportes" },
            { id: "geography", name: "Geografia" },
            { id: "history", name: "Historia" },
            { id: "science", name: "Ciencia" },
            { id: "food_and_drink", name: "Comida y Bebida" }
        ];
        
        this.populateCategorySelect();
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
        }
    }
    
    async fetchQuestions(amount, category, difficulty) {
        
        let url = `https://the-trivia-api.com/v2/questions?limit=${amount}`;
        
        if (category) {
            url += `&categories=${category}`;
        }
        
        if (difficulty) {
            url += `&difficulties=${difficulty}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error en la API');
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            this.questions = data.map(item => {
                
                const allAnswers = [...item.incorrectAnswers, item.correctAnswer];
                this.shuffleArray(allAnswers);
                
                return {
                    question: item.question.text,
                    correct_answer: item.correctAnswer,
                    incorrect_answers: item.incorrectAnswers,
                    all_answers: allAnswers,
                    category: item.category,
                    difficulty: item.difficulty
                };
            });
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
    
    displayQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showResultsScreen();
            return;
        }
        
        const question = this.questions[this.currentQuestionIndex];
        const progress = document.getElementById('progress');
        const questionText = document.getElementById('question-text');
        const answersContainer = document.getElementById('answers-container');
        
        progress.textContent = `Pregunta ${this.currentQuestionIndex + 1} de ${this.questions.length}`;
        questionText.innerHTML = question.question;
        
        answersContainer.innerHTML = '';
        
        question.all_answers.forEach(answer => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.innerHTML = answer;
            button.addEventListener('click', () => this.selectAnswer(answer, question.correct_answer));
            answersContainer.appendChild(button);
        });
        
        this.startTimer();
        this.startTime = Date.now();
    }
    
    startTimer() {
        this.timeLeft = 20;
        this.updateTimerDisplay();
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const timeLeftElement = document.getElementById('time-left');
        const timerBar = document.getElementById('timer-bar');
        
        timeLeftElement.textContent = this.timeLeft;
        timerBar.style.width = `${(this.timeLeft / 20) * 100}%`;
        
        if (this.timeLeft <= 5) {
            timerBar.style.background = '#ff5252';
        } else {
            timerBar.style.background = '#6a0dad';
        }
    }
    
    handleTimeUp() {
        clearInterval(this.timer);
        this.incorrectAnswers++;
        this.totalTime += 20;
        this.currentQuestionIndex++;
        this.displayQuestion();
    }
    
    selectAnswer(selectedAnswer, correctAnswer) {
        clearInterval(this.timer);
        
        const timeSpent = (Date.now() - this.startTime) / 1000;
        this.totalTime += timeSpent;
        
        const answerButtons = document.querySelectorAll('.answer-btn');
        
        answerButtons.forEach(button => {
            if (button.innerHTML === correctAnswer) {
                button.classList.add('correct');
            } else if (button.innerHTML === selectedAnswer && selectedAnswer !== correctAnswer) {
                button.classList.add('incorrect');
            }
            button.disabled = true;
        });
        
        if (selectedAnswer === correctAnswer) {
            this.score += 10;
            this.correctAnswers++;
        } else {
            this.incorrectAnswers++;
        }
        
        this.updateScoreDisplay();
        
        setTimeout(() => {
            this.currentQuestionIndex++;
            this.displayQuestion();
        }, 2000);
    }
    
    updateScoreDisplay() {
        document.getElementById('score-display').textContent = `Puntos: ${this.score}`;
    }
    
    displayResults() {
        const resultsContent = document.getElementById('results-content');
        const totalQuestions = this.questions.length;
        const percentage = ((this.correctAnswers / totalQuestions) * 100).toFixed(1);
        const averageTime = (this.totalTime / totalQuestions).toFixed(1);
        
        resultsContent.innerHTML = `
            <p><strong>Jugador:</strong> ${this.playerName}</p>
            <p><strong>Puntuacion Total:</strong> ${this.score} puntos</p>
            <p><strong>Respuestas Correctas:</strong> ${this.correctAnswers} de ${totalQuestions}</p>
            <p><strong>Porcentaje de Aciertos:</strong> ${percentage}%</p>
            <p><strong>Tiempo Promedio por Pregunta:</strong> ${averageTime} segundos</p>
        `;
    }
    
    playAgain() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.totalTime = 0;
        
        this.showGameScreen();
        this.displayQuestion();
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TriviaGame();
});