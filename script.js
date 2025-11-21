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
    } };