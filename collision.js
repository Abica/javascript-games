function Ball( intWidth ) {
    this.intWidth = intWidth || 20;
    this.intDegrees = 360;
    this.intRadius = this.intWidth / 2;
    this.intDampenCollision = 1;
}

Ball.prototype = {
    setPosition: function( intX, intY ) {
        this.intX = intX;
        this.intY = intY;
    },

    setVelocity: function( intVx, intVy ) {
        this.intVx = intVx || 5;
        this.intVy = intVy || 2;
    },

    positionRandomly: function( intScreenWidth, intScreenHeight ) {
        this.setPosition( this.random( intScreenWidth ), this.random( intScreenHeight ) );
        this.setVelocity( ( ( this.random( 1 ) == 0 ) ? -5 : 5 ),
                          ( ( this.random( 1 ) == 0 ) ? -2 : 2 ) );
    },

    drawBall: function( canvas ) {
        canvas.beginPath();
        canvas.arc( this.intX, this.intY, this.intRadius, 0, ( Math.PI / 180 ) * this.intDegrees, true );
        canvas.stroke();
    },

    moveBall: function( canvas ) {
        this.intX += this.intVx;
        this.intY += this.intVy;
    },

    random: function( intMaximum ) {
        return Math.round( Math.random() * intMaximum );
    },

    calculateAndSetVelocity: function( funcNegate, intDx, intDy, intMagnitude, intDistribution ) {
        var context = this;
        var partialVelocity =  function( intDirection ) {
            return context.impactVelocityOnCollision( funcNegate( intMagnitude * ( intDirection / intDistribution ) ) );
        };
        this.setVelocity( partialVelocity( intDx ), partialVelocity( intDy ) );
    },

    impactVelocityOnCollision: function( intValue ) {
        return intValue * this.intDampenCollision;
    },

    negate: function( intValue ) {
        return -( intValue );
    },

    wrapWithValue: function( intValue ) {
        return intValue;
    },

    magnitude: function() {
        return Math.sqrt( this.intVx * this.intVx + this.intVy * this.intVy );
    },

    collideWith: function( ballOther, intDx, intDy, intDistribution ) {
        ballOther.calculateAndSetVelocity( ballOther.wrapWithValue, intDx, intDy, this.magnitude(), intDistribution );
        this.calculateAndSetVelocity( this.negate, intDx, intDy, ballOther.magnitude(), intDistribution );
    }
};

function BallCannister() {
    this.arrayBalls = [];
}

BallCannister.prototype = {
    generateRandomBalls: function( intNumberOfBalls ) {
        for ( var i = 0; i < intNumberOfBalls; i++ ) {
            var ball = new Ball();
            ball.positionRandomly( 600, 300 );
            this.addBall( ball );
        }
    },

    generateBilliardsRack: function( intWidth, intX, intY ) {
        var intXOffset = 0;
        var intYOffset = 0;
        for ( var i = 5; i > 0; i-- ) {
            intYOffset = ( ( intWidth / 2 ) * ( 5 - i ) );
            for ( var j = i; j > 0; j-- ) {
                var ball = new Ball( intWidth );
                ball.setPosition( intX + intXOffset, intY + intYOffset );
                ball.setVelocity();
                this.addBall( ball );
                intYOffset += intWidth;
            }
            intXOffset += intWidth - ( intWidth / 10 );
        }
    },

    addBall: function( ball ) {
        this.arrayBalls.push( ball );
    },

    paintBalls: function( canvas ) {
        this.arrayBalls.each( function( ballCurrent ) {
            this.actOnWallCollision( ballCurrent );
            ballCurrent.moveBall( canvas );
            this.actOnBallCollision( ballCurrent );
            ballCurrent.drawBall( canvas );
        }.bind( this ) );
    },

    actOnWallCollision: function( ballCurrent ) {
        var intX = ballCurrent.intX;
        var intY = ballCurrent.intY;
        var intRadius = ballCurrent.intRadius;
        if ( ( intX + intRadius ) >= 600 ) {
            ballCurrent.intVx = -Math.abs( ballCurrent.intVx );
        } else if ( ( intX - intRadius ) <= 0 ) {
            ballCurrent.intVx = Math.abs( ballCurrent.intVx );
        } else if ( ( intY + intRadius ) >= 300 ) {
            ballCurrent.intVy = -Math.abs( ballCurrent.intVy );
        } else if ( ( intY - intRadius ) <= 0 ) {
            ballCurrent.intVy = Math.abs( ballCurrent.intVy );
        }
    },

    actOnBallCollision: function( ballCurrent ) {
        this.arrayBalls.each( function( ballOther ) {
            if ( ballCurrent != ballOther ) {
                var intDx = ballOther.intX - ballCurrent.intX;
                var intDy = ballOther.intY - ballCurrent.intY;
                var intDistribution = Math.sqrt( intDx * intDx + intDy * intDy );
                if ( intDistribution < ballCurrent.intWidth ) {
                    ballCurrent.collideWith( ballOther, intDx, intDy, intDistribution );
                }
            }
        } );
    }
};


function Scene( strCanvasId ) {
    this.elCanvas = $( strCanvasId );
    this.setup();
}

Scene.prototype = {
    setRefreshRate: function( intRefreshRate ) {
        this.intRefreshRate = intRefreshRate;
    },

    refreshRate: function() {
        // defaults to 30 fps
        return this.intRefreshRate || 33;
    },

    setup: function() {
        this.arrayPainterFuncs = [];
        if ( this.canvasSupported() ) {
            this.canvas = this.elCanvas.getContext( '2d' );
        }
    },

    run: function() {
        if ( this.canvasSupported() ) {
            setInterval( this.paintScreen.bind( this ), this.refreshRate() );
//this.paintScreen();
        }
    },

    canvasSupported: function() {
        if ( this.elCanvas.getContext ) {
            return true;
        }
        return false;
    },

    registerPainterFunc: function( klass, strPainterFuncName ) {
        var contextPainterFunc = function( c ) { klass[ strPainterFuncName ]( c ); }
        this.arrayPainterFuncs.push( contextPainterFunc );
    },

    clearScreen: function() {
        this.canvas.clearRect( 0, 0, 600, 300 )
    },

    paintScreen: function() {
        this.clearScreen();
        this.arrayPainterFuncs.each( function( painterFunc ) {
            painterFunc( this.canvas );
        }.bind( this ) );
    }
};
