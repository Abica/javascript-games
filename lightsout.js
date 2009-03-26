/**
 * Lightsout
 * Nicholas Wright (http://www.nicholaswright.org/games/lightsout)
 * Created 10 / 8 / 2006
 */
function LightsOut() {
    this.intWins = 0;
    this.intTimesSurrendered = 0;
    this.intRemainingLightshowDuration = 20;
    this.strOffHexCode = "#737373";
    this.strOnHexCode = "#ffff00";
    this.strHoverHexCode = "#ff0000";
    this.objCurrentMoves = $("current_moves");
    this.objCurrentSurrenders = $("current_surrenders");
    this.objCurrentWins = $("current_wins");
    this.objWinner = $("lightsout_winner");
    this.resetGame(true);
}

LightsOut.prototype = {
    resetGame: function(boolOnInit) {
        if (!boolOnInit) {
            this.checkSurrender();
        }
        this.arrayGrid = [0, 0, 0, 0, 0,
                          0, 0, 0, 0, 0,
                          0, 0, 0, 0, 0,
                          0, 0, 0, 0, 0,
                          0, 0, 0, 0, 0];
        this.triggerLightShow();
        this.randomizeLights();
        this.intMoves = 0;
        this.objCurrentMoves.innerHTML = this.intMoves;
    },

    checkSurrender: function() {
        if ((this.intLightsOn > 0) || (this.intLightsOn < 24)) { 
            this.intTimesSurrendered++;
            this.objCurrentSurrenders.innerHTML = this.intTimesSurrendered;
        }
    },

    checkForWin: function() {
        if ((this.intLightsOn == 0) || (this.intLightsOn == 24)) {
            this.intWins++;
            this.objCurrentWins.innerHTML = this.intWins;
            this.notifyWinner();
            this.resetGame(true);
        }
    },

    hoverOn: function(objElement) {
        objElement.style.backgroundColor = this.strHoverHexCode; 
    },

    hoverOff: function(objElement) {
        this.drawLight(this.grabLightNumber(objElement));
    },

    random: function() {
        return (Math.random() > 0.5) ? 1 : 0;
    },

    randomizeLights: function() {
        for (var i = 0; i < 25; i++) {
            this.updateGridIndex(i, this.random());
        }
    },

    notifyWinner: function() {
        alert( "Congratulations! You've won!\n\nSince you've got skills why not try again?" );
        // this.objWinner.show();
    },

    hideNotifyWinner: function() {
        this.objWinner.hide();
    },

    grabLightNumber: function(objElement) {
        return Number(objElement.id.split("_").last());
    },

    triggerLightShow: function() {
        this.intRemainingLightshowDuration = 20;
        setInterval( this.displayLightShow.bind( this ), 100 );
    },

    displayLightShow: function() {
        if ( this.intRemainingLightshowDuration > 0 ) {
            this.randomizeLights();
            this.intRemainingLightshowDuration--;
        } else {
            clearInterval();
        }
    },

    updateLightsOn: function() {
        this.intLightsOn = 0;
        this.arrayGrid.each( function( n ) {
            this.intLightsOn += n
        }.bind( this ) );
        return this.intLightsOn;
    },

    updateGridIndex: function(intIndex, intFlipTo) {
        this.arrayGrid[intIndex] = intFlipTo;
        this.drawLight(intIndex);
    },

    toggleLightsForSelection: function(objElement) {
        var id = this.grabLightNumber(objElement);
        this.toggleLight(id - 5);
        this.toggleLight(id + 5);
        var left = id - 1;
        var right = id + 1;
        if (![4, 9, 14, 19, 24].include(left)) {
            this.toggleLight(left);
        }

        if ((right % 5) != 0) {
            this.toggleLight(right);
        }
        this.toggleLight(id);
        this.updateLightsOn();
        this.checkForWin();
        this.intMoves++;
        this.objCurrentMoves.innerHTML = this.intMoves;
    },

    toggleLight: function(intIndex) {
        if ((intIndex >= 0) && (intIndex <= 24)) {
            var intFlipTo = (this.arrayGrid[intIndex] == 0) ? 1 : 0;
            this.updateGridIndex(intIndex, intFlipTo);
            this.drawLight(intIndex);
            return true;
        }
        return false;
    },

    drawLights: function() {
        for (var i = 0; i < 25; i++) {
          this.drawLight(i);
        }
    },

    drawLight: function(strId) {
        $("square_" + strId).style.backgroundColor = (this.arrayGrid[strId] == 0) ? this.strOffHexCode : this.strOnHexCode; 
    }
};
