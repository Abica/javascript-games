/**
 * Paint
 * Nicholas Wright (http://www.nicholaswright.org/games/paint)
 * Created 10 / 8 / 2006
 */
function Paint(arrayColors) {
       this.arrayColorPalette = arrayColors;
       this.strCurrentColor = arrayColors.first();
       this.boolDrawStateActive = false;
       this.intPenSize = 8;
       this.arrayHistory = [];
       this.intHistoryLocation = 0;
       this.hashReferences = {};
       this.objCanvas = $('paint_canvas');
       Event.observe(this.objCanvas, "mousedown", this.observeMouseMove.bind(this));
       Event.observe(this.objCanvas, "mouseup", this.clearMouseMove.bind(this));
       this.strCurrentColorDisplay = $('paint_current_color_display');
       this.strCurrentMethod = 'draw';
       this.intCurrentX = 0;
       this.intCurrentY = 0;
}

Paint.prototype = {
    snapshotAttributes: function() {
        return {
            objCurrentPixel: this.objCurrentPixel,
            strCurrentColor: this.strCurrentColor,
            intPenSize: this.intPenSize,
            intCurrentX: this.currentX,
            intCurrentY: this.currentY
        };
    },
    restoreAttributes: function() {
        var arrayAttributes = this.arrayHistory[this.intHistoryLocation].last();
        for (record in arrayAttributes) {
            this[record] = arrayAttributes[record];
        }
    },
    storeHistory: function(strMethod) {
        if (this.arrayHistory.length > this.intHistoryLocation) {
            var arrayTmpHistory = [];
            for (var i = 0; i <= this.intHistoryLocation; i++) {
                arrayTmpHistory.push(this.arrayHistory[i]);
            }
            delete this.arrayHistory;
            this.arrayHistory = arrayTmpHistory;
            delete this.arrayTmpHistory;
        }
        this.arrayHistory.push([strMethod, this.snapshotAttributes]);
        this.intHistoryLocation++;
    },
    doUndo: function() {
        if (this.intHistoryLocation > 0) {
            this.intHistoryLocation--;
            this.restoreAttributes();
            this[this.arrayHistory[this.intHistoryLocation].first()]();
        }
    },
    doRedo: function() {
        if (this.intHistoryLocation < (this.arrayHistory.length - 1)) {
            this.intHistoryLocation++;
            this.restoreAttributes();
            this[this.arrayHistory[this.intHistoryLocation].first()]();
        }
    },
    changeColor: function(strColor) {
        if (this.arrayColorPalette.include(strColor)) {
            this.strCurrentColor = strColor;
            this.updateCurrentColorDisplay();
            this.setOrDefaultCurrentMethod('draw');
        } 
    },
    updateCurrentColorDisplay: function() {
        this.strCurrentColorDisplay.style.backgroundColor = this.strCurrentColor;
    },
    floodFillBg: function() { 
        this.objCanvas.style.backgroundColor = this.strCurrentColor; 
        this.storeHistory('floodFillBg');
    },
    setCurrentMethod: function(strMethod) {
        this.strCurrentMethod = strMethod;
    },
    setOrDefaultCurrentMethod: function(strMethod) {
        if (this.strCurrentMethod) {
            return true;
        }
        this.setCurrentMethod(strMethod);
    },
    increasePenSize: function() {
        this.intPenSize++;
        this.setOrDefaultCurrentMethod('draw');
        this.storeHistory('increasePenSize');
    },
    decreasePenSize: function() {
        if (this.intPenSize > 0) {
            this.intPenSize--;
        }
        this.setOrDefaultCurrentMethod('draw');
        this.storeHistory('decreasePenSize');
    },
    drawPixel: function() {
        var intDivId = this.generateId();
        if (this.hashReferences[intDivId]) {
            $(intDivId).style.backgroundColor = this.strCurrentColor;
        } else {
            this.objCurrentPixel = document.createElement('div');
            this.objCurrentPixel.setAttribute('id', intDivId);
            this.objCurrentPixel.setAttribute('style', 'position:absolute;top:' + this.intCurrentY +
                                              'px;left:' + this.intCurrentX + 
                                              'px;height:' + this.intPenSize +
                                              'px;width:' + this.intPenSize + 'px;background:' + this.strCurrentColor);
            Event.observe(this.objCurrentPixel, "mouseover", this.existingPixel.bind(this)); 
            this.hashReferences[intDivId] = 100.0;
            this.objCanvas.appendChild(this.objCurrentPixel);
        }
        this.storeHistory('drawPixel');
    },
    existingPixel: function(e) {
        this.objCurrentPixel = $((e.target) ? e.target.id : e.srcElement.id);
        if (this.boolDrawStateActive) {
            if (this.strCurrentMethod == 'draw') {
                this.editPixel();
            } else {
                this[this.strCurrentMethod + 'Pixel']();
            }
        }
    },
    editPixel: function() {
        this.objCurrentPixel.style.backgroundColor = this.strCurrentColor;
        this.storeHistory('editPixel');
    },
    sprayPixel: function() {
        var intStartX = this.intCurrentX;
        var intStartY = this.intCurrentY;
        this.drawPixel();
        for (var i = 0; i <= 5; i++) {
            switch(i % 5) {
                case 0:
                    this.intCurrentX = (intStartX - this.intPenSize) + i - Math.random();
                    this.intCurrentY = (intStartY + this.intPenSize) + i - Math.random();
                    break;
                case 1:
                    this.intCurrentX = (intStartX - this.intPenSize) + i - Math.random();
                    this.intCurrentY = (intStartY - this.intPenSize) + i - Math.random();
                    break;
                case 2:
                    this.intCurrentX = (intStartX + this.intPenSize) + i - Math.random();
                    this.intCurrentY = (intStartY + this.intPenSize) + i - Math.random();
                    break;
                case 3:
                    this.intCurrentX = (intStartX - this.intPenSize) + i - Math.random();
                    this.intCurrentY = (intStartY + this.intPenSize) + i - Math.random();
                    break;
                case 4:
                    this.intCurrentX = (intStartX + this.intPenSize) + i + Math.random();
                    this.intCurrentY = (intStartY - this.intPenSize) - i - Math.random();
                    break;
                default:
                    break;
            }
            this.drawPixel();
        }
    },
    smudgePixel: function() {
        if (this.hashReferences[this.objCurrentPixel.id] > 0) {
            this.hashReferences[this.objCurrentPixel.id] -= 10;
            var intOpacity = this.hashReferences[this.objCurrentPixel.id];
            if (this.objCurrentPixel.style.filter) {
                this.objCurrentPixel.style.filter.alpha.opacity = intOpacity;
            } else {
                this.objCurrentPixel.style.opacity = intOpacity * 0.01;
                this.objCurrentPixel.style.MozOpacity = intOpacity * 0.01;
                this.objCurrentPixel.style.KhtmlOpacity = intOpacity * 0.01;
            }
        } else {
            this.erasePixel();        
        }
        this.storeHistory('smudgePixel');
    },
    erasePixel: function() {
        if ((this.objCurrentPixel) && ($(this.objCurrentPixel.id))) {
            delete this.hashReferences[this.objCurrentPixel.id]; 
            this.objCanvas.removeChild(this.objCurrentPixel);
        }
        this.storeHistory('erasePixel');
    },
    clearCanvas: function() {
        for (key in this.hashReferences) {
            this.objCanvas.removeChild($(key));
            delete this.hashReferences[key]; 
        }
        this.storeHistory('clearCanvas');
    },
    generateId: function() {
        return 'paint_div_' + this.intCurrentX + '_' + this.intCurrentY; 
    },
    mouseX: function(e) {
        var intX = e.pageX || (event.clientX + document.body.scrollLeft)
        this.intCurrentX = (intX <= 0) ? 0 : intX; 
    },
    mouseY: function(e) {
        var intY = e.pageY || (event.clientY + document.body.scrollTop)
        this.intCurrentY = (intY <= 0) ? 0 : intY; 
    },
    observeMouseMove: function(e) {
        Event.observe(this.objCanvas, "mousemove", this.observeCanvas.bind(this));
        this.boolDrawStateActive = true;
    },
    clearMouseMove: function(e) {
        this.boolDrawStateActive = false;
    },
    observeCanvas: function(e) {
        this.mouseX(e);
        this.mouseY(e);
        if ((Position.within(this.objCanvas, this.intCurrentX + this.intPenSize, this.intCurrentY + this.intPenSize)) && 
            (this.boolDrawStateActive)) {
            if (this[this.strCurrentMethod + 'Pixel']) {
                this[this.strCurrentMethod + 'Pixel']();
            }
        }
    }
};
