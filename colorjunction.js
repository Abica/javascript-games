/**
 * ColorJunction
 * Nicholas Wright (http://www.nicholaswright.org/games/colorjunction)
 * Created 10 / 16 / 2006
 */

Array.prototype.blank = function() {
    if (!this.compact().length) {
        return true;
    }
    return false;
}

function Piece(objParentNode, intX, intY, intHeight, intWidth, arrayColor) {
    this.intColorType = arrayColor.first();
    this.objParentNode = objParentNode;
    this.create(intX, intY, intHeight, intWidth, arrayColor.last());
}

Piece.prototype = {
    create: function(intX, intY, intHeight, intWidth, strColor) {
        this.objPiece = document.createElement("div");
        this.objPiece.setAttribute("id", 'piece_' +  intX + '_' + intY);
        this.setColor(strColor);
        this.setWidth(intWidth);
        this.setHeight(intHeight);
        this.setStyle("position", "absolute");
        this.setPosition(intX, intY);
        this.objParentNode.appendChild(this.objPiece);
    },
    destroy: function() {
        this.objParentNode.removeChild(this.objPiece);
    },
    sameColor: function(intColor) {
        return (this.intColorType == intColor);
    },
    getAttribute: function(strWhich) {
        return this.objPiece.getAttribute(strWhich);
    },
    styleExists: function(strKey) {
        return this.objPiece.style[strKey];
    },
    setStyle: function(strKey, strValue) {
        this.objPiece.style[strKey] = strValue;
    }, 
    getStyle: function(strKey, boolReturnNumber) {
        var strValue = this.objPiece.style[strKey];
        return (boolReturnNumber) ? Number(strValue.gsub(/[^\d]/, "")) : strValue;
    },
    moveLeft: function(intCells) {
        this.setPosition(this.getPosition().first() - (this.getStyle("width", true) * intCells), null);
    },
    moveDown: function(intCells) {
        this.setPosition(null, this.getPosition().last() + (this.getStyle("height", true) * intCells));
    },
    setColor: function(strColor) {
        this.setStyle("backgroundColor", strColor);
    },
    setWidth: function(strWidth) {
        this.setStyle("width", strWidth + "px");
    },
    setHeight: function(strHeight) {
        this.setStyle("height", strHeight + "px");
    },
    getDimensions: function() {
        return [this.getStyle("width", true), this.getStyle("height", true)];
    },
    setPosition: function(intX, intY) {
        if (intX) {
            this.setStyle("left", intX + "px");
        }
        if (intY) {
            this.setStyle("top", intY + "px");
        }
    },
    getPosition: function() {
        return [this.getStyle("left", true), this.getStyle("top", true)];
    }
};

function ColorJunction() {
    this.objBoard = $('colorjunction_grid');
    this.objPiecesLeft = $('colorjunction_pieces_left');
    Event.observe(this.objBoard, "click", this.captureClicks.bind(this));
    this.arrayBoardOffsets = Position.cumulativeOffset(this.objBoard);
    this.arrayColorPalette = ['#ff0000', '#0000ff', '#336633', "#eeee00"];
    this.setDifficulty(2);
}

ColorJunction.prototype = {
    clearBoard: function() {
        if (this.arrayPieces) {
            for (var i = 0; i < this.arrayPieces.length; i++) {
                for (var j = 0; j < this.arrayPieces[i].length; j++) {
                    if (this.arrayPieces[i][j] instanceof Piece) {
                        this.arrayPieces[i][j].destroy();
                    }
                }
            }
        }
    },
    resetGame: function() {
        this.clearBoard();
        this.arrayPieces = [];
        this.drawBoard();
        this.intPiecesLeft = this.arrayCells.first() * this.arrayCells.last();
        this.updatePiecesLeftDisplay();
    },
    randomColor: function() {
        var intIndex = parseInt(Math.random() * this.arrayColorPalette.length);
        return [intIndex, this.arrayColorPalette[intIndex]];
    },
    setDifficulty: function(intDifficulty) {
        var intCellDimension = 5 << intDifficulty;
        this.intCellHeight = intCellDimension;
        this.intCellWidth = intCellDimension;
        var intNumberOfCells = (intDifficulty & 1) ? (intCellDimension * 2) : (intCellDimension / 2);
        this.arrayCells = [intNumberOfCells, intNumberOfCells];
        this.arrayBoardDimensions = [this.intCellWidth * this.arrayCells.first(),
                                     this.intCellHeight * this.arrayCells.last()];
        this.resetGame();
    },
    updatePiecesLeftDisplay: function() {
        this.objPiecesLeft.innerHTML = this.intPiecesLeft;
    },
    drawBoard: function() {
        var intX = this.arrayBoardOffsets.first(); 
        var intY = this.arrayBoardOffsets.last(); 
        for (var i = 0; i < this.arrayCells.first(); i++) {
            this.arrayPieces.push([]);
            for (var j = 0; j < this.arrayCells.last(); j++) {
                if (!j) {
                    var intY = this.arrayBoardOffsets.last(); 
                }
                this.arrayPieces.last().push(
                    new Piece(
                        this.objBoard,
                        intX,
                        intY,
                        this.intCellHeight,
                        this.intCellWidth,
                        this.randomColor()
                    )
                );
                if (this.arrayPieces.last().length == this.arrayCells.first()) {
                    intX += this.intCellWidth;
                } else {
                    intY += this.intCellHeight;
                }
            }
        }

        // hack to fix double long columns on bottom row in every developer's favorite browser 8|
        new Piece(
            this.objBoard,
            intX - this.arrayBoardDimensions.first(),
            intY + this.intCellHeight,
            1,
            this.arrayBoardDimensions.first(),
            [-1, "#CFE6DC"]
        );
    },
    toggleSurroundingCells: function(intColorType, intColumn, intRow) {
        if (intColumn) {
            this.checkCell(intColorType, intColumn - 1, intRow);
        }
        if (intColumn < (this.arrayCells.first() - 1)) {
            this.checkCell(intColorType, intColumn + 1, intRow);
        }
        if (intRow) {
            this.checkCell(intColorType, intColumn, intRow - 1);
        }
        if (intRow < (this.arrayCells.last() - 1)) {
            this.checkCell(intColorType, intColumn, intRow + 1);
        }
    },
    toggleCell: function(intColumn, intRow) {
        var objPiece = this.arrayPieces[intColumn][intRow];
        this.arrayPieces[intColumn][intRow] = null;
        this.toggleSurroundingCells(objPiece.intColorType, intColumn, intRow);
        objPiece.destroy();
        this.intPiecesLeft--;
        this.updatePiecesLeftDisplay();
    },
    checkCell: function(intColorType, intColumn, intRow) {
        if (!this.currentPath.include(intColumn + "_" + intRow)) {
            this.currentPath.push(intColumn + "_" + intRow);
            if ((this.arrayPieces[intColumn]) && (this.arrayPieces[intColumn][intRow] instanceof Piece)) {
                if (this.arrayPieces[intColumn][intRow].sameColor(intColorType)) {
                    this.toggleCell(intColumn, intRow);
                }
            }
        }
    },
    collapseRows: function() {
        var intEmptyCount = 0;
        for (var i in this.arrayPieces) {
            if ((this.arrayPieces[i].blank) && (this.arrayPieces[i].blank())) {
                this.arrayPieces[i] = null;
                intEmptyCount++;
            } else if (intEmptyCount) {
                for (var j in this.arrayPieces[i]) {
                    if (this.arrayPieces[i][j] instanceof Piece) {
                        this.arrayPieces[i][j].moveLeft(intEmptyCount);
                    }
                }
            }
        }
        this.arrayPieces = this.arrayPieces.compact();
    },
    collapseColumns: function() {
        var intBlankColumns = 0;
        for (var intColumn = 0; intColumn < this.arrayPieces.length; intColumn++) {
            var arrayCurrentColumn = this.arrayPieces[intColumn];
            var intCurrentCount = 0;
            var arrayTmp = [];
            for (var i = (arrayCurrentColumn.length - 1); i >= 0; i--) {
                if (!arrayCurrentColumn[i]) {
                    intCurrentCount++;
                    arrayTmp.push(null);
                } else if ((arrayCurrentColumn[i] instanceof Piece) && (intCurrentCount)) {
                    arrayCurrentColumn[i].moveDown(intCurrentCount);
                }
            } 
            this.arrayPieces[intColumn] = arrayTmp.concat(arrayCurrentColumn.compact());
            if (this.arrayPieces[intColumn].blank()) {
                intBlankColumns++;
            }
        }
        if (intBlankColumns) {
            this.collapseRows();
        }
    },
    captureClicks: function(e) {
        var intColumn = Math.ceil((Event.pointerX(e) - this.arrayBoardOffsets.first()) / this.intCellWidth) - 1;
        var intRow = Math.ceil((Event.pointerY(e) - this.arrayBoardOffsets.last()) / this.intCellHeight) - 1;
        if ((this.arrayPieces[intColumn]) && (this.arrayPieces[intColumn][intRow])) {
            this.currentPath = [];
            this.toggleSurroundingCells(this.arrayPieces[intColumn][intRow].intColorType, intColumn, intRow);
            this.collapseColumns();
        }
    }
};
