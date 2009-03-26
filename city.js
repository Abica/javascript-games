/**
 * City
 * Nicholas Wright (http://www.nicholaswright.org/games/city)
 * Created 11 / 17 / 2006
 */
function CityElement( objParentNode, intX, intY, intHeight, intWidth, strColor ) {
    this.objParentNode = objParentNode;
    if (arguments.length > 1) {
        this.create( intX, intY, intHeight, intWidth, strColor );
    }
}

CityElement.prototype = {
    create: function( intX, intY, intHeight, intWidth, strColor ) {
        this.objNode = document.createElement( "div" );
        this.objNode.setAttribute( "id", 'city_element_' +  intX + '_' + intY );
        this.setColor( strColor );
        this.setWidth( intWidth );
        this.setHeight( intHeight );
        this.setStyle( "position", "absolute" );
        this.setPosition( intX, intY );
        this.objParentNode.appendChild( this.objNode );
    },

    wrap: function( strId ) {
        this.objNode = $( strId );
        return this;
    },

    destroy: function() {
        if (this.objParentNode) {
            this.objParentNode.removeChild( this.objNode );
        }
    },

    getAttribute: function( strWhich ) {
        return this.objNode.getAttribute( strWhich );
    },

    setClass: function( strClassName ) {
        this.objNode.className = strClassName;
    },

    styleExists: function( strKey ) {
        return this.objNode.style[ strKey ];
    },

    setContent: function( strContent ) {
        this.objNode.innerHTML = strContent;
    },

    setStyle: function( strKey, strValue ) {
        this.objNode.style[ strKey ] = strValue;
    }, 

    getStyle: function( strKey, boolReturnNumber ) {
        var strValue = this.objNode.style[ strKey ];
        return (boolReturnNumber) ? Number( strValue.gsub( /[^\d]/, "" ) ) : strValue;
    },

    moveHorizontal: function( intDx ) {
        this.setPosition( ( this.left() +  intDx ), null );
    },

    moveLeft: function( intCells ) {
        this.setPosition( ( this.left() - intCells ), null );
    },

    moveRight: function( intCells ) {
        this.setPosition( ( this.left() + intCells ), null );
    },

    moveDown: function( intCells ) {
        this.setPosition( null, this.top() + ( this.getStyle( "height", true ) * intCells ) );
    },

    setColor: function( strColor ) {
        this.setStyle( "backgroundColor", strColor );
    },

    setWidth: function( intWidth ) {
        this.intWidth = intWidth;
        this.setStyle( "width", intWidth + "px" );
    },

    setHeight: function( intHeight ) {
        this.intHeight = intHeight;
        this.setStyle("height", intHeight + "px" );
    },

    setDimensions: function( intWidth, intHeight ) {
        this.setWidth( intWidth ); 
        this.setHeight( intHeight ); 
    },

    getOffsets: function() {
        return Position.cumulativeOffset( this.objNode );
    },

    left: function() {
        return this.getOffsets()[ 0 ];
    },

    top: function() {
        return this.getOffsets()[ 1 ];
    },

    getDimensions: function() {
        return [ this.getStyle( "width", true ), this.getStyle( "height", true ) ];
    },

    setPosition: function( intX, intY ) {
        if (intX) {
            this.setStyle( "left", intX + "px" );
        }
        if (intY) {
            this.setStyle( "top", intY + "px" );
        }
    }
};

function Status( objParentNode, intX, intY ) {
    this.objParentNode = objParentNode;
    this.objStatus = new CityElement( objParentNode, intX + 4, intY + 2, 10, 280 );
    this.objStatus.setClass( "city_status" );
}

Status.prototype = {
     write: function( strMessage, intDelay ) {
         this.objStatus.setContent( strMessage ); 
         setTimeout( ( function() { this.applyDelay() } ).bind( this ), intDelay * 1000 );
     },

     queue: function( intDelay, arrayMessages ) {
         if (arrayMessages.length) {
             this.objStatus.setContent( arrayMessages.shift() );
             setTimeout( ( function() { this.queue( intDelay, arrayMessages ) } ).bind( this ), intDelay * 1000 );
         } else {
             setTimeout( ( function() { this.applyDelay() } ).bind( this ), intDelay * 1000 );
         }
     },

     applyDelay: function() {
         this.objStatus.setContent( "" ); 
     }
};

function Blimp( objParentNode, strId ) {
    this.objBlimp = new CityElement( objParentNode ).wrap( strId );
    this.intWidth = 20;
    this.intHeight = 10;
    this.objBlimp.setDimensions( this.intWidth, this.intHeight );
    this.intDx = 2;
}

Blimp.prototype = {
    moveDown: function() {
        this.objBlimp.moveDown( 1 );
    },

    moveHorizontal: function() {
        this.objBlimp.moveHorizontal( this.intDx );
    },

    update: function( boolCollision ) {
        if ( boolCollision ) {
            this.intDx *= -1;
            this.moveDown();
        }
        this.moveHorizontal();
    }
};

function Bomb( objParentNode, intX, intY, intSpeed ) {
    this.objParentNode = objParentNode;
    this.intWidth = 5;
    this.intHeight = 10;
    this.objBomb = new CityElement( objParentNode, intX, intY, this.intWidth, this.intHeight );
    this.objBomb.setClass( "city_bomb" );
    this.intSpeed = intSpeed || 1;
}

Bomb.prototype = {
    moveDown: function() {
        this.objBomb.moveDown( this.intSpeed );
    },

    update: function() {
        this.moveDown();
    }
};

function Building( objParentNode, intX, intY, intWidth, intHeight, strColor ) {
    this.intX = intX;
    this.intY = intY;
    this.intWidth = intWidth;
    this.intHeight = intHeight;
    this.objParentNode = objParentNode;
    this.objLayer = new CityElement( objParentNode, this.intX, this.intY, this.intWidth, this.intHeight, strColor );
    this.objLayer.setClass( "city_building_layer" );
}

Building.prototype = { 
    hasCollidedWithBomb: function( objCityElement ) {
        return ( ( objCityElement.top() + objCityElement.intHeight ) >= this.intY );
    },

    hasCollidedWithBlimp: function( objCityElement ) {
        var intLeft = objCityElement.left();
        return ( ( ( objCityElement.top() + objCityElement.intHeight ) >= this.intY ) &&
                 ( ( ( intLeft + objCityElement.intWidth ) >= this.intX ) || ( intLeft <= ( this.intX + this.intWidth ) ) ) );
    }
};

function City() {
    this.objCanvas = new CityElement( $( "content" ) ).wrap( "city_canvas" );
    this.objCanvas.setDimensions( 300, 200 );
    this.arrayOffsets = this.objCanvas.getOffsets();
    this.intCanvasX = this.arrayOffsets[ 0 ];
    this.intCanvasY = this.arrayOffsets[ 1 ];
    this.blimpPlayer = new Blimp( this.objCanvas.objNode, "city_blimp" );
    this.statusContainer = new Status( this.objCanvas.objNode, this.intCanvasX, this.intCanvasY );
    this.pauseContainer = new Status( this.objCanvas.objNode, this.intCanvasX, this.intCanvasY + 20 );
    this.intLevel = 1;
    this.intLives = 3;
    this.intBuildingWidth = 25;
    this.intBuildingHeight = 15;
    this.intMaxBuildingsWide = ( this.objCanvas.getDimensions()[ 0 ] / this.intBuildingWidth ); 
    this.intMaxBuildingLayersHigh = ( this.objCanvas.getDimensions()[ 1 ] / this.intBuildingHeight ) / 2; 
    this.boolPaused = true;
    Event.observe( this.objCanvas.objNode, "click", this.dropBomb.bindAsEventListener( this ) );
    Event.observe( window || document, "keydown", this.mapKeys.bind( this ) );
    this.startGame();
}

City.prototype = {
    resetGame: function() {
        this.intLevel = 1;
        this.intLives = 3;
        this.startGame();
    },

    startGame: function() {
        this.blimpPlayer.objBlimp.setPosition( this.intCanvasX + 2, this.intCanvasY + 2 );
        this.boolPaused = false;
        this.handlePause();
        this.intAvailableLayers = this.intBuildingWidth + this.intBuildingHeight + ( ( this.intLevel + this.intLevel ) * 2 );
        this.intLayersLeft = this.intAvailableLayers;
        this.intBombsLeft = this.intLayersLeft + 3;
        this.bombCurrent = null;
        this.arrayBuildings = [];
        this.placeLayers();
        this.update();
    },

    continueGame: function() {
        this.blimpPlayer.objBlimp.setPosition( this.intCanvasX + 2, this.intCanvasY + 2 );
        this.intBombsLeft = this.intLayersLeft + 3;
        this.boolPaused = false;
        this.update();
    },

    placeLayers: function() {
        var i = 0;
        var intTmpAvailableLayers = this.intAvailableLayers;
        while ( intTmpAvailableLayers ) {
            if (this.arrayBuildings.length < this.intMaxBuildingsWide) {
                this.arrayBuildings.push( [] );
            }
            if ((this.arrayBuildings[ i ].length < this.intMaxBuildingLayersHigh) && (Math.round( Math.random() ))) {
                this.arrayBuildings[ i ].push( new Building(
                    this.objCanvas.objNode,
                    ( this.intCanvasX + ( i * this.intBuildingWidth ) ) + 2,
                    ( ( ( this.intCanvasY + this.objCanvas.getStyle( "height", true ) ) -
                        ( this.arrayBuildings[ i ].length * this.intBuildingHeight ) ) - this.intBuildingHeight ),
                    this.intBuildingHeight,
                    this.intBuildingWidth,
                    "#ffff00"
                ) );
                intTmpAvailableLayers--;
            }
            if ( i >= ( this.intMaxBuildingsWide - 1 )) {
                i = 0;
            } else {
                i++;
            }
        }
    },

    handlePause: function() {
        this.boolPaused = ! this.boolPaused;
        if ( this.gameIsActive() ) {
            this.pauseContainer.objStatus.setContent( "" );
            this.update();
         } else {
            this.pauseContainer.objStatus.setContent( "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Paused" );
         }
    },

    handleDeath: function() {
        this.intLives--;
        this.blimpPlayer.objBlimp.setColor( "#ff0000" )
        this.boolPaused = true;
        if ( ! this.intLives ) {
            this.statusContainer.queue( 2, [ "GAME OVER", "Final level: " + this.intLevel ] );
        } else {
            this.statusContainer.queue( 1, [ "You were destroyed",
                                             "Lives now " + this.intLives,
                                             "Prepare Yourself" ] );
            setTimeout( ( function() {
                this.continueGame()
                this.blimpPlayer.objBlimp.setColor( "#00ffff" )
            } ).bind( this ), 5000 );
        }
    },

    gameIsActive: function() {
        return ! this.boolPaused;
    },

    mapKeys: function( e ) {
         switch ( e.keyCode ) {
            case 19, 80:
                this.handlePause();
                break;
            case 32:
                this.dropBomb();
                break;
        }
    },

    dropBomb: function() {
        if ( this.gameIsActive() ) {
            if ( ! this.intBombsLeft ) {
                this.statusContainer.write( "Out Of Bombs", 3 );
            } else if ( this.bombCurrent instanceof Bomb ) {
                this.statusContainer.write( "Already Awaiting Impact", 3 );
            } else {
                var arrayTmpOffsets = this.blimpPlayer.objBlimp.getOffsets();
                var intIndex = Math.round( ( this.arrayBuildings.length - ( ( this.objCanvas.intWidth + this.objCanvas.left() ) - arrayTmpOffsets[ 0 ] ) /  this.intBuildingWidth ) );
                this.bombCurrent = new Bomb(
                    this.objCanvas.objNode,
                    this.objCanvas.left() + ( ( intIndex - 1 ) * this.intBuildingWidth ) + ( this.intBuildingWidth / 2 ) + 20,
                    arrayTmpOffsets[ 1 ] + 10
                );
                this.intBombsLeft--;
                this.statusContainer.write( "Bomb Dropped, " + this.intBombsLeft + " left", 1 );
            }
        }
    },

    doesBuildingExist: function( intBuildingIndex ) {
        if ( ( ! this.arrayBuildings[ intBuildingIndex ] ) ||
             ( ! this.arrayBuildings[ intBuildingIndex ].length ) ||
             ( ! this.arrayBuildings[ intBuildingIndex ].last() instanceof Building ) ) {
            return false;
        } 
        return true;
    },

    checkForWin: function() {
        if ( ! this.intLayersLeft ) {
            this.boolPaused = true;
            if ( this.intLevel >= 11 ) {
                this.pauseContainer.objStatus.setContent( "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Game completed!" );
            } else {
                this.intLevel++;
                this.intLives++;
                this.statusContainer.queue( 1, ["Level Completed",
                                                "Lives increased to " + this.intLives,
                                                "Prepare for level " + this.intLevel + "!" ] );
                setTimeout( ( function() { this.startGame() } ).bind( this ), 5000 );
            }
            return true;
        }
        return false;
    },

    handleBombCollision: function( intBuildingIndex ) {
        if ( ! this.doesBuildingExist( intBuildingIndex ) ) {
            return false;
        }
        var objBuilding = this.arrayBuildings[ intBuildingIndex ].last();
        if ( objBuilding.hasCollidedWithBomb( this.bombCurrent.objBomb ) ) {
            objBuilding.objLayer.destroy();
            this.bombCurrent.objBomb.destroy();
            this.arrayBuildings[ intBuildingIndex ].pop();
            this.bombCurrent = null;
            this.intLayersLeft--;
            this.statusContainer.write( "BOOM", 3 );
            return true;
        }
        return false;
    },

    handleBlimpCollision: function( intLeft ) {
        var intIndex = Math.round( ( this.arrayBuildings.length - ( ( this.objCanvas.intWidth + this.objCanvas.left() ) - intLeft ) /  this.intBuildingWidth ) );
        var objBuilding = ( this.arrayBuildings[ intIndex ] && this.arrayBuildings[ intIndex ].last() );
        if ( objBuilding instanceof Building ) { 
            if ( objBuilding.hasCollidedWithBlimp( this.blimpPlayer.objBlimp ) ) {
                this.handleDeath();
                return true;
            }
        }
        return false;
    },

    moveBomb: function() {
        this.bombCurrent.update();
        if (( this.intCanvasY + this.objCanvas.intHeight ) <= this.bombCurrent.objBomb.top()) {
            this.bombCurrent.objBomb.destroy();
            this.bombCurrent = null;
        } else {
            var intIndex = Math.round( ( this.arrayBuildings.length - ( ( this.objCanvas.intWidth + this.objCanvas.left() ) - this.bombCurrent.objBomb.left() ) /  this.intBuildingWidth ) );
            if ( this.arrayBuildings[ intIndex ] ) {
                this.handleBombCollision( intIndex );
            }
        }
    },

    moveBlimp: function() {
        var arrayDimensions = this.blimpPlayer.objBlimp.getOffsets();
        var intLeft = arrayDimensions[ 0 ];
        if ( ( this.arrayOffsets[ 0 ] >= intLeft ) || ( ( ( this.arrayOffsets[ 0 ] + this.objCanvas.intWidth ) - this.blimpPlayer.objBlimp.intWidth ) <= intLeft ) ) {
            this.blimpPlayer.update( true );
        } else {
            this.blimpPlayer.update();
        }
        this.handleBlimpCollision( intLeft );
    },

    update: function() {
        this.checkForWin();
        if ( this.gameIsActive() ) {
            setTimeout( ( function() { this.update() } ).bind( this ), 20 );
            if (this.bombCurrent) {
                this.moveBomb();
            }
            this.moveBlimp();
        }
    }
};
