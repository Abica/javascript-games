/**
 * Simon
 * Nicholas Wright (http://www.nicholaswright.org/games/simon)
 * Created 12 / 05 / 2006
 */
function SimonElement( strClass ) {
    this.strClass = strClass;
    this.objNode = $( strClass );
    this.boolPlaying = false;
    this.intPlayTime = 100;
    this.lolite();
}

SimonElement.prototype = {
    togglePlaying: function() {
        this.boolPlaying = ! this.boolPlaying;
    },
    hilite: function() {
        this.objNode.className = this.strClass + "_" + "hilite";
    },
    lolite: function() {
        this.objNode.className = this.strClass;
    },
    play: function() {
        if (! this.boolPlaying) {
            setTimeout( ( function() { this.play() } ).bind( this ), this.intPlayTime );
            this.hilite();
            this.togglePlaying();
        } else {
            this.lolite();
            this.togglePlaying();
        }
    }
};

function Simon() {
    this.objYellow = new SimonElement( 'simon_yellow' );
    this.objGreen = new SimonElement( 'simon_green' );
    this.objBlue = new SimonElement( 'simon_blue' );
    this.objRed = new SimonElement( 'simon_red' );
    this.arrayObjects = [ this.objYellow, this.objGreen, this.objBlue, this.objRed ];
    this.arrayEvents = [];
}

Simon.prototype = {
    reset: function() {
        this.stopObserving();
        this.arraySequence = [];
        this.intIndex = 0;
        this.playSequence();
    },
    correctMove: function( intMove ) {
        if (this.arraySequence[ this.intIndex ] == intMove) {
            this.intIndex++;
            this.arrayObjects[ intMove ].play();
            if (this.intIndex == this.arraySequence.length) {
                this.intIndex = 0;
                this.stopObserving();
                setTimeout( ( function() { this.playSequence() } ).bind( this ), 1000 );
            }
            return true;
        }
        this.gameOver();
        return false;
    },
    chooseColor: function() {
        return Math.round( Math.random() * 3 );
    },
    gameOver: function() {
        alert( "Game Over! You survived " + this.arraySequence.length + " rotations");
    },
    playSequence: function() {
        if (this.intIndex < this.arraySequence.length) {
            this.arrayObjects[ this.arraySequence[ this.intIndex ] ].play();
            setTimeout( ( function() { this.playSequence() } ).bind( this ), 700 );
            this.intIndex++;
        } else {
            var intColor = this.chooseColor();
            this.arraySequence.push( intColor );
            this.arrayObjects[ intColor ].play();
            this.intIndex = 0;
            this.startObserving();
        }
    },
    // prototype has an awkward method for using 'stopObserving' which requires us to have a sort of pointer -
    // that's the reason for this lame (if redundant) workaround method.. the anonymous function approach was much nicer..
    moveBeforeMove: function( e ) {
        switch ( Event.element( e ).id ) {
            case "simon_yellow":
                this.correctMove( 0 );
                break;
            case "simon_green":
                this.correctMove( 1 );
                break;
            case "simon_blue":
                this.correctMove( 2 );
                break;
            case "simon_red":
                this.correctMove( 3 );
                break;
        }
    },
    startObserving: function() {
        for (var i = 0; i < this.arrayObjects.length; i++) {
            this.arrayEvents[i] = this.moveBeforeMove.bindAsEventListener( this );
            Event.observe( this.arrayObjects[ i ].objNode, "click", this.arrayEvents[ i ] );
        }
    },
    stopObserving: function() {
        for (var i = 0; i < this.arrayObjects.length; i++) {
            Event.stopObserving( this.arrayObjects[ i ].objNode, "click", this.arrayEvents[ i ] );
        }
    }
};
