/**
 * Towers of hanoi
 * Nicholas Wright (www.nicholaswright.org/games/towers_of_hanoi)
 * Created 10 / 14 / 2006
 */
function TowersOfHanoi(intNumberOfDiscs) {
    this.objLeft = $('towers_of_hanoi_left');
    this.objPoleLeft = $('towers_of_hanoi_left_pole');
    this.objMiddle = $('towers_of_hanoi_middle');
    this.objPoleMiddle = $('towers_of_hanoi_middle_pole');
    this.objRight = $('towers_of_hanoi_right');
    this.objPoleRight = $('towers_of_hanoi_right_pole');
    this.objMoves = $('towers_of_hanoi_moves');
    this.objWins = $('towers_of_hanoi_wins');
    this.objPar = $('towers_of_hanoi_par');
    this.arrayObjects = [this.objLeft, this.objMiddle, this.objRight];
    this.intPoleWidth = 5;
    this.intPoleHeight = 283;
    this.intWins = 0;
    this.setNumberOfDiscs(intNumberOfDiscs);
    this.setPolePositions();
    this.resetGame();
}

TowersOfHanoi.prototype = {
    hashDraggableReferences: {},

    resetGame: function() {
        this.intMoves = 0;
        this.updateMoves();
        this.destroyAllDiscs();
        this.arrayDiscs = [[], [], []];
        this.createDiscs();
    },
    updatePar: function() {
        this.objPar.innerHTML = function(n) {
            if (n < 2) {
                return 1;
            } else {
                return n * arguments.callee(n - 1);
            }
        }(this.intNumberOfDiscs);
    },
    updateMoves: function() {
        this.objMoves.innerHTML = this.intMoves; 
    },
    updateWins: function() {
        this.objWins.innerHTML = this.intWins; 
    },
    setPolePositions: function() {
        var intColWidth = (Element.getDimensions(this.objLeft).width / 2);
        var arrayXY = Position.cumulativeOffset(this.objLeft);
        var arrayBoardXY = Position.cumulativeOffset(this.objLeft);

        this.objPoleLeft.style.left = ((arrayXY.first() + intColWidth) - (this.intPoleWidth / 2)) + "px";
        this.objPoleLeft.style.top = arrayXY.last() + "px";
        this.objPoleLeft.style.height = this.intPoleHeight +  "px";
        this.objPoleLeft.style.width = this.intPoleWidth +  "px";

        arrayXY = Position.cumulativeOffset(this.objMiddle);
        this.objPoleMiddle.style.left = ((arrayXY.first() + intColWidth) - (this.intPoleWidth / 2)) + "px";
        this.objPoleMiddle.style.top = arrayXY.last() + "px";
        this.objPoleMiddle.style.height = this.intPoleHeight +  "px";
        this.objPoleMiddle.style.width = this.intPoleWidth +  "px";

        arrayXY = Position.cumulativeOffset(this.objRight);
        this.objPoleRight.style.left = ((arrayXY.first() + intColWidth) - (this.intPoleWidth / 2)) + "px";
        this.objPoleRight.style.top = arrayXY.last() + "px";
        this.objPoleRight.style.height = this.intPoleHeight +  "px";
        this.objPoleRight.style.width = this.intPoleWidth +  "px";
    },
    setNumberOfDiscs: function(number_of_discs) {
        if ((number_of_discs >= 2) && (number_of_discs <= 9)) {
            this.intNumberOfDiscs = number_of_discs;
        } else {
            this.intNumberOfDiscs = 3;
        }
    },
    checkWin: function() {
        if (this.arrayDiscs.last().length >= this.intNumberOfDiscs) {
            if (this.intNumberOfDiscs >= 9) {
                alert("Wow, now that is impressive. Try again!");
            } else {
                alert("Congratulations! You won! Try the next level!");
                this.intNumberOfDiscs++;
            }
            this.intWins++;
            this.updateWins();
            this.resetGame();
            return true;
        }
        return false;
    },
    parseDiscSize: function(disc) {
        return disc.split("_").last();
    },
    createDiscs: function() {
        for (i = 0; i < this.intNumberOfDiscs; i++) {
            this.addDisc(0, "disc_" + i, (i == 0), true);
        }
    },
    addDisc: function(intStackNumber, strId, boolDraggable, boolInit) {
        var objTmpDiv = document.createElement("div");
        objTmpDiv.setAttribute("id", strId);
        objTmpDiv.style.width = (Number(this.parseDiscSize(strId) + "0") + 20) + "%";
        objTmpDiv.className = this.arrayObjects[intStackNumber].id;
        objTmpDiv.innerHTML = "&nbsp;";
        if (boolInit) {
            this.arrayObjects[intStackNumber].appendChild(objTmpDiv);
            this.arrayDiscs[intStackNumber].push(strId);
        } else {
            this.arrayObjects[intStackNumber].insertBefore(objTmpDiv, this.arrayObjects[intStackNumber].firstChild);
            this.arrayDiscs[intStackNumber].unshift(strId);
        }
        if (boolDraggable) {
            this.addDraggable(strId);
        }
    },
    removeDisc: function(intStackNumber, strId) {
        this.destroyDraggable(this.arrayDiscs[intStackNumber].first());
        Element.remove(strId);
        this.arrayDiscs[intStackNumber].shift();
        if (this.arrayDiscs[intStackNumber].length > 0) {
            this.addDraggable(this.arrayDiscs[intStackNumber].first());
        }
    },
    addDraggable: function(strId) {
        this.hashDraggableReferences[strId] = new Draggable(strId, {revert: true});
    },
    destroyDraggable: function(strId) {
        if (this.hashDraggableReferences[strId]) {
            this.hashDraggableReferences[strId].destroy();
            delete this.hashDraggableReferences[strId];
        }
    },
    destroyAllDiscs: function() {
        for (var i = 0; i < this.arrayObjects.length; i++) {
            while (this.arrayObjects[i].hasChildNodes()) {
                this.arrayObjects[i].removeChild(this.arrayObjects[i].firstChild);
            }
        }
        for (j in this.hashDraggableReferences) {
            this.destroyDraggable(j);
        }
    },
    moveSmallerDisc: function(objElement, intStackNumber) {
        if ((this.arrayDiscs[intStackNumber].length == 0) ||
            (this.parseDiscSize(this.arrayDiscs[intStackNumber].first()) > this.parseDiscSize(objElement.id))) {
            this.removeDisc(this.findPreviousStack(objElement.id, intStackNumber), objElement.id);
            this.destroyDraggable(this.arrayDiscs[intStackNumber].first());
            this.addDisc(intStackNumber, objElement.id, true);
            this.intMoves++;
            this.updateMoves();
            this.checkWin();
            return true;
        }
        return false;
    },
    findPreviousStack: function(strId, intStackNumber) {
        for (var i = 0; i < this.arrayDiscs.length; i++) {
            if ((i != intStackNumber) && ($A(this.arrayDiscs[i]).include(strId))) {
                return i;
            }
        }
    },
    pushOntoLeft: function(objElement) {
        this.moveSmallerDisc(objElement, 0);
    },
    pushOntoMiddle: function(objElement) {
        this.moveSmallerDisc(objElement, 1);
    },
    pushOntoRight: function(objElement) {
        this.moveSmallerDisc(objElement, 2);
    }
};
