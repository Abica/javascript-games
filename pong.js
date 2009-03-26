/**
 * Pong
 * Nicholas Wright (http://www.nicholaswright.org/games/pong)
 * Created 10 / 13 / 2006
 */
function Pong() {
    this.objBoard = $('pong_board');
    this.objPlayer = $('pong_player');
    this.objPlayerScore = $('pong_player_score');
    this.objOpponent = $('pong_opponent');
    this.objOpponentScore = $('pong_opponent_score');
    this.objBall = $('pong_ball');
    this.objCenterLine = $('pong_center_line');


    this.intBoardX = Position.cumulativeOffset(this.objBoard).first();
    this.intBoardY = Position.cumulativeOffset(this.objBoard).last();
    this.intBoardWidth = 400;
    this.intBoardHeight = 300;
    this.intCenterLineHeight = this.intBoardHeight;
    this.intCenterLineWidth = 1;
    this.intCenterLineX = this.intBoardX + (this.intBoardWidth / 2);
    this.intPlayerScore = 0;
    this.intOpponentScore = 0;
    this.intPaddleHeight = 30;
    this.intPaddleHeightHalve = (this.intPaddleHeight / 2);
    this.intPaddleWidth = 5;
    this.intBallHeight = 5;
    this.intBallWidth = 5;

    this.setupBoard();
    Event.observe(this.objBoard, "click", this.startGame.bind(this)); 
    Event.observe(this.objBoard, "mousemove", this.observeBoard.bindAsEventListener(this));
}

Pong.prototype = {
    startGame: function(e) {
        if (this.boolGameEnded) {
            this.boolGameEnded = false;
            this.startTicker();
        } else if (this.boolPaused) {
            this.boolPaused = false;
            this.startTicker();
        } else {
            this.boolPaused = true;
            this.clearTicker();
        }
this.log( '      ' + this.intervalRunning.toSource() );
    },

    setupBoard: function(e) {
        this.setElementSize("Board");
        this.setElementSize("CenterLine");
        this.setElementSize("Player", "Paddle");
        this.setElementSize("Opponent", "Paddle");
        this.setElementSize("Ball");
        this.defaultGameElementPositions();
    },

    clearTicker: function() {
        this.intervalRunning = window.clearTimeout(this.intervalRunning);
    },

    startTicker: function() {
        this.intervalRunning = window.setTimeout(this.moveBall.bind(this), 10);
    },

    incScore: function(strWhich) {
        this["int" + strWhich + "Score"]++;
        this["obj" + strWhich + "Score"].innerHTML = this["int" + strWhich + "Score"];
    },

    incSpeed: function() {
        if ((this.intBallRelays > 5) && ((this.intBallRelays % 10) == 0)) {
            this.intBallDx += 1;
            this.intBallDY += 1;
        }
    },

    setElementSize: function(strWhich, strSecondary) {
        this["obj" + strWhich].style.height = this["int" + (strSecondary || strWhich) + "Height"] + "px"; 
        this["obj" + strWhich].style.width = this["int" + (strSecondary || strWhich) + "Width"] + "px"; 
    },

    defaultGameElementPositions: function() {
        this.positionGameElement("Player",
                                 (this.intBoardX + this.intPaddleWidth),
                                 ((this.intBoardY + this.intBoardHeight) / 2) + this.intPaddleHeight);
        this.positionGameElement("Opponent",
                                 (this.intBoardX + this.intBoardWidth) - (this.intPaddleWidth * 2),
                                 ((this.intBoardY + this.intBoardHeight) / 2) + this.intPaddleHeight);
        this.positionGameElement("CenterLine",
                                 this.intCenterLineX - (this.intCenterLineWidth / 2),
                                 this.intBoardY);
        this.positionGameElement("Ball",
                                 (this.intBoardWidth / 2) + this.intBoardX - (this.intBallWidth / 2),
                                 (this.intBoardHeight / 2) + this.intBoardY);

        this.intOpponentY = ((this.intBoardY + this.intBoardHeight) + this.intPaddleHeight) / 2; 
        this.intBallX = this.intCenterLineX;
        this.intBallY = (this.intBoardHeight / 2) + this.intBoardY;
        this.intBallRelays = 0;
        this.intCurrentX = 0;
        this.intCurrentY = 0;
        this.intBallDx = ((Math.random() < 0.5) ? 2 : -2);
        this.intBallDy = ((Math.random() < 0.5) ? 2 : -2);
        this.intervalRunning = null;
        this.boolPaused = false;
        this.boolGameEnded = true;
    },

    positionGameElement: function(strWhich, intX, intY) {
        if (intX) {
            this["obj" + strWhich].style.left = intX + "px"; 
        }
        if (intY) {
            this["obj" + strWhich].style.top = intY + "px"; 
        }
    },

    moveBall: function() {
        this.checkForWin();
        if (this.gameIsActive()) {
            this.opponentAI();
            this.actOnCollision();
            this.incSpeed();
            this.positionGameElement("Ball", this.intBallX, this.intBallY); 
            this.startTicker();
        }
    },

    opponentAI: function() {
        if (this.intBallDx > 0) { //&& (this.intBallX > this.intCenterLineX)) {
            intOpponentMaxDrop = (this.intBoardY + this.intBoardHeight) - this.intPaddleHeight;
            if ((this.intBallY >= this.intOpponentY) || (this.intBallY < this.intOpponentY)) {
                this.intOpponentY += this.intBallDy;
            }

            if ((this.intOpponentY > intOpponentMaxDrop) || (this.intBallY > intOpponentMaxDrop)) {
                this.intOpponentY = intOpponentMaxDrop;
            } 

            if (this.intOpponentY <= this.intBoardY) {
                this.intOpponentY = this.intBoardY;
            }

            this.positionGameElement("Opponent", null, this.intOpponentY);
        }
    },

    actOnCollision: function() {
        if ((this.intBallY <= this.intBoardY) || (this.intBallY >= (this.intBoardY + this.intBoardHeight))) {
            this.intBallDy *= -1;
        }
        if (Position.within(this.objPlayer, this.intBallX - 1, this.intBallY)) {
            this.intBallDx = Math.abs(this.intBallDx);
        } else if (Position.within(this.objOpponent, this.intBallX + this.intBallWidth, this.intBallY)) {
            this.intBallDx = -Math.abs(this.intBallDx);
        }
        this.intBallX += this.intBallDx;
        this.intBallY += this.intBallDy;
    },

    updateBoard: function() {
        this.updatePlayerPosition();
    },

    updatePlayerPosition: function() {
        if (((this.intPaddleHeight + this.intCurrentY) < (this.intBoardY + this.intBoardHeight)) && 
            (this.gameIsActive())) {
            this.positionGameElement("Player", null, this.intCurrentY); 
        }
    },

    gameIsActive: function() {
        return ((!this.boolPaused) && (!this.boolGameEnded));
    },

    checkForWin: function() {
        if (this.intBallX >= ((this.intBoardX + this.intBoardWidth) - this.intPaddleWidth)) {
            this.incScore("Player");
            this.boolGameEnded = true;
            this.setupBoard();
        } else if (this.intBallX <= (this.intBoardX + this.intPaddleWidth)) {
            this.incScore("Opponent");
            this.boolGameEnded = true;
            this.setupBoard();
        }        
    },

    mouseX: function(e) {
        var intX = e.pageX || (event.clientX + document.body.scrollLeft)
        this.intCurrentX = (intX <= 0) ? 0 : intX;
    },

    mouseY: function(e) {
        var intY = e.pageY || (event.clientY + document.body.scrollTop)
        this.intCurrentY = (intY <= 0) ? 0 : intY;
    },

    log: function( a ) {
        $( 'log' ).innerHTML = a;
    },

    observeBoard: function(e) {
        this.mouseX(e);
        this.mouseY(e);
        if (Position.within(this.objBoard, this.intCurrentX, this.intCurrentY)) {
            if (this.gameIsActive()) {
                this.updateBoard();
            }
        }
    }
};
