/**
 * Maze
 * Nicholas Wright (http://www.nicholaswright.org/games/maze)
 * Created 12 / 03 / 2006
 */

function Player() {
    this.reset();
}

Player.prototype = {
    reset: function() {
        this.intRow = 0;
        this.intCol = 0;
    },
    moveLeft: function() {
        this.intCol--
    },
    moveRight: function() {
        this.intCol++
    },
    moveUp: function() {
        this.intRow--;
    },
    moveDown: function() {
        this.intRow++;
    }
}

function MazeElement( objParentNode, strType ) {
    this.objParentNode = objParentNode;
    this.boolVisited = false;
    this.create( strType );
}

MazeElement.prototype = {
    create: function( strType ) {
        this.objNode = document.createElement( strType );
        this.objParentNode.appendChild( this.objNode );
    },
    destroy: function() {
        Element.remove( this.objNode );
    },
    visit: function() {
        this.boolVisited = true;
    },
    visited: function() {
        return this.boolVisited;
    },
    getAttribute: function( strWhich ) {
        return this.objNode.getAttribute( strWhich );
    },
    setClass: function( strClassName ) {
        this.objNode.className = strClassName;
    },
    addClasses: function() {
        for (var i = 0; i < arguments.length; i++) {
            this.addClass( arguments[ i ] );
        }
    },
    addClass: function( strClassName ) {
        Element.addClassName( this.objNode, strClassName );
    },
    removeClass: function( strClassName ) {
        Element.removeClassName( this.objNode.id, strClassName );
    },
    hasClass: function( strClassName ) {
        return Element.hasClassName( this.objNode, strClassName );
    },
    styleExists: function( strKey ) {
        return this.objNode.style[ strKey ];
    },
    setStyle: function( strKey, strValue ) {
        this.objNode.style[ strKey ] = strValue;
    }, 
    getStyle: function( strKey, boolReturnNumber ) {
        var strValue = this.objNode.style[ strKey ];
        return (boolReturnNumber) ? Number( strValue.gsub( /[^\d]/, "" ) ) : strValue;
    },
    setColor: function( strColor ) {
        this.setStyle( "backgroundColor", strColor );
    },
    getColor: function() {
        return this.getStyle( "backgroundColor" );
    },
    setWidth: function( intWidth ) {
        this.setStyle( "width", intWidth + "px" );
    },
    setHeight: function( intHeight ) {
        this.setStyle("height", intHeight + "px" );
    },
    setDimensions: function( intWidth, intHeight, intRow, intCol ) {
        this.setWidth( intWidth ); 
        this.setHeight( intHeight ); 
        this.intRow = intRow;
        this.intCol = intCol;
        this.objNode.setAttribute( "id", "id_" + this.intRow + "_" + this.intCol );
    },
    getDimensions: function() {
        return [ this.getStyle( "width", true ), this.getStyle( "height", true ) ];
    }
};

function Maze() {
    this.objTbody = $( "maze_tbody" );
    this.objPlayer = new Player();
    this.setDifficulty( 2 );
    Event.observe( window || document, "keydown", this.move.bind( this ) ); 
}

Maze.prototype = {
    setDifficulty: function( intDifficulty ) {
        if (this.arrayCells instanceof Array) {
            this.clearTable();
        }
        switch ( intDifficulty ) {
            case 1:
                this.intRows = 10;
                this.intCols = 10;
                this.intHeight = 20;
                this.intWidth = 20;
                break;
            case 3:
                this.intRows = 20;
                this.intCols = 20;
                this.intHeight = 15;
                this.intWidth = 15;
                break;
            default:
                this.intRows = 15;
                this.intCols = 15;
                this.intHeight = 20;
                this.intWidth = 20;
                break;
        }
        this.arrayCells = [];
        this.arrayTmpCells = [];
        this.drawCells();
        this.carve( this.arrayCells[ Math.round( this.intRows / 2 ) ][ Math.round( this.intCols / 2 ) ] );
        this.objPlayer.reset();
    },
    clearTable: function() {
        for (var i = 0; i < this.arrayCells.length; i++) {
            for (var j = 0; j < this.arrayCells[ i ].length; j++) {
                if (this.arrayCells[ i ][ j ] instanceof MazeElement) {
                    this.arrayCells[ i ][ j ].destroy();
                }
            }
        }
    },
    move: function( e ) {
        var strClass = "";
        this.setHere();
        switch ( e.keyCode ) {
            case Event.KEY_UP:
                if (((this.objPlayer.intRow - 1) >= 0) && (this.validMove( "up" ))) {
                    this.objPlayer.moveUp();
                }
                break;
            case Event.KEY_DOWN:
                if (((this.objPlayer.intRow + 1) < this.intRows) && (this.validMove( "down" ))) {
                    this.objPlayer.moveDown();
                }
                break;
            case Event.KEY_LEFT:
                if (((this.objPlayer.intCol - 1) >= 0) && (this.validMove( "left" ))) {
                    this.objPlayer.moveLeft();
                }
                break;
            case Event.KEY_RIGHT:
                strClass = "right";
                if (((this.objPlayer.intCol + 1) < this.intCols) && (this.validMove( "right" ))) {
                    this.objPlayer.moveRight();
                }
                break;
        }
        this.updateColor();
        this.announceWinner();
    },
    setHere: function() {
        this.arrayCells[ this.objPlayer.intRow ][ this.objPlayer.intCol ].setColor( "#f6f6f6" );
    },
    updateColor: function() {
        this.arrayCells[ this.objPlayer.intRow ][ this.objPlayer.intCol ].setColor( "#336633" );
    },
    announceWinner: function() {
        if ((this.objPlayer.intRow == (this.intRows - 1)) && (this.objPlayer.intCol == (this.intCols - 1))) {
            alert( "CONGRATULATIONS! YOU'VE MADE IT OUT!\nTo play again simply select another difficulty." );
        }
    },
    validMove: function( strDirection ) {
        if (! this.arrayCells[ this.objPlayer.intRow ][ this.objPlayer.intCol ].hasClass( strDirection )) {
            return true;
        }
        return false;
    },
    drawCells: function() {
        for (var i = 0; i < this.intRows; i++) {
            var objTr = new MazeElement( this.objTbody, "tr" );
            this.arrayCells.push( [] );
            for (var j = 0; j < this.intCols; j++) {
                var objTd = new MazeElement( objTr.objNode, "td" )
                objTd.setDimensions( this.intHeight, this.intWidth, i, j );
                objTd.setColor( "#000000" );
                objTd.addClass( "up" );
                objTd.addClass( "left" );
                objTd.addClass( "right" );
                objTd.addClass( "down" );
                this.arrayCells.last().push( objTd );
            }
        }
        this.arrayCells[ 0 ][ 0 ].removeClass( "up" );
        this.arrayCells[ 0 ][ 0 ].removeClass( "left" );
        this.arrayCells.last().last().removeClass( "right" );
        this.arrayCells.last().last().removeClass( "down" );
        this.arrayCells[ 0 ][ 0 ].addClass( "start" );
        this.arrayCells.last().last().addClass( "stop" );
    },
    connect: function( objCurrentCell, objPreviousCell ) {
        if (objCurrentCell.intCol < objPreviousCell.intCol) {
            objCurrentCell.removeClass( "right" );
            objPreviousCell.removeClass( "left" );
        } else if (objCurrentCell.intCol > objPreviousCell.intCol) {
            objCurrentCell.removeClass( "left" );
            objPreviousCell.removeClass( "right" );
        } else if (objCurrentCell.intRow < objPreviousCell.intRow) {
            objCurrentCell.removeClass( "down" );
            objPreviousCell.removeClass( "up" );
        } else if (objCurrentCell.intRow > objPreviousCell.intRow) {
            objCurrentCell.removeClass( "up" );
            objPreviousCell.removeClass( "down" );
        }

    },
    visitNeighbors: function( objCurrentCell ) {
        var arrayCurrentCells = [];
        if (((objCurrentCell.intCol + 1) < this.intCols) &&
            (! this.arrayCells[ objCurrentCell.intRow ][ objCurrentCell.intCol + 1 ].visited())) {
            arrayCurrentCells.push( this.arrayCells[ objCurrentCell.intRow ][ objCurrentCell.intCol + 1 ] );
        }
        if (((objCurrentCell.intCol - 1) >= 0) &&
            (! this.arrayCells[ objCurrentCell.intRow ][ objCurrentCell.intCol - 1 ].visited())) {
            arrayCurrentCells.push( this.arrayCells[ objCurrentCell.intRow ][ objCurrentCell.intCol - 1 ] );
        }
        if (((objCurrentCell.intRow + 1) < this.intRows) &&
            (! this.arrayCells[ objCurrentCell.intRow + 1 ][ objCurrentCell.intCol ].visited())) {
            arrayCurrentCells.push( this.arrayCells[ objCurrentCell.intRow + 1 ][ objCurrentCell.intCol ] );
        }
        if (((objCurrentCell.intRow - 1) >= 0) &&
            (! this.arrayCells[ objCurrentCell.intRow - 1 ][ objCurrentCell.intCol ].visited())) {
            arrayCurrentCells.push( this.arrayCells[ objCurrentCell.intRow - 1 ][ objCurrentCell.intCol ] );
        }

        return arrayCurrentCells[ parseInt(Math.random() * arrayCurrentCells.length) ];
    },
    carve: function( objCurrentCell ) {
        objCurrentCell.visit();
        var objCell = this.visitNeighbors( objCurrentCell );
        if (objCell) {
            this.arrayTmpCells.push( objCurrentCell );
            this.connect( objCell, objCurrentCell );
        } else {
            this.arrayTmpCells.pop();
            var objCell = this.arrayTmpCells.last();
        }

        if (this.arrayTmpCells.length < 1) {
            return false;
        } else {
            this.carve( objCell );
        }
    }
};
