(function(){
__jah__.resources["/main.js"] = {data: function (exports, require, module, __filename, __dirname) {
"use strict"  // Use strict JavaScript mode

// Pull in the modules we're going to use
var cocos  = require('cocos2d')   // Import the cocos2d module
  , nodes  = cocos.nodes          // Convenient access to 'nodes'
  , events = require('events')    // Import the events module
  , geo    = require('geometry')  // Import the geometry module
  , ccp    = geo.ccp              // Short hand to create points

// Convenient access to some constructors
var Layer    = nodes.Layer
  , Scene    = nodes.Scene
  , Label    = nodes.Label
  , Director = cocos.Director
  , Texture2D = cocos.Texture2D
  
// galagasheet.png
var galagaTexture = new Texture2D({ file: '/resources/galagasheet.png' })
var s
var scoreLabel
function CreatePlane(x, y)
{
	var myPlane_frames = [ new cocos.SpriteFrame
								({ texture: galagaTexture, rect: new geo.Rect(184, 55, 15, 17) }) ] 
	var myplane = new nodes.Sprite({ frame: myPlane_frames[0] })  
	myplane.scale = 2
	myplane.position = ccp(x, y)
	
	return myplane 
}

function CreateEnemy(x, y, type)
{ 
	var enemyPoint = 10
	var enemy_frames =  [ new cocos.SpriteFrame
								({ texture: galagaTexture, rect: new geo.Rect(161, 103, 15, 16) }),
							 new cocos.SpriteFrame
								({ texture: galagaTexture, rect: new geo.Rect(185, 103, 15, 16) }) ] 
	if(type == "type2")
	{
		enemyPoint = 20
		var enemy_frames =  [ new cocos.SpriteFrame
								({ texture: galagaTexture, rect: new geo.Rect(161, 127, 15, 16) }),
							 new cocos.SpriteFrame
								({ texture: galagaTexture, rect: new geo.Rect(185, 127, 15, 16) }) ] 
	}
	
	var enemy = new nodes.Sprite({ frame: enemy_frames[0] })
	enemy.scale = 2
	enemy.position = ccp(x, y)
	
	var animation = new cocos.Animation({
							frames: enemy_frames, delay: 0.4 })
	var animate = new cocos.actions.Animate({ animation: animation})
	enemy.runAction(new cocos.actions.RepeatForever(animate)) 
	
	var res = [enemy, enemyPoint]
	return res
} 

function Missile (position)
{
	var missile_frames = [ new cocos.SpriteFrame({ texture: galagaTexture, rect: new geo.Rect(374, 51, 3, 8) })]
	var missile = new nodes.Sprite({ frame: missile_frames[0] })
	missile.scale = 2
	missile.position = ccp(position.x, position.y + 20)
	
	missile.runAction(new cocos.actions.MoveBy({ duration:1.5, position: ccp(0, 1000) }) )
	
	return missile
}

function EnemyMissile (position)
{
	var missile_frames = [ new cocos.SpriteFrame({ texture: galagaTexture, rect: new geo.Rect(366, 195, 3, 8) })]
	var missile = new nodes.Sprite({ frame: missile_frames[0] })
	missile.scale = 2
	missile.position = ccp(position.x, position.y)
	
	missile.runAction(new cocos.actions.MoveBy({ duration:1.5, position: ccp(0, -1000) }) )
	
	return missile
}

function pickOut(array, idx)
{
	var array1 = array.slice(0, idx)
	var array2 = array.slice(idx+1, array.length)
	
	return array1.concat(array2)
}

function Explosion(position, type, parent)
{
	var explosion_frames = [ new cocos.SpriteFrame({ texture: galagaTexture, rect: new geo.Rect( 208, 47, 32, 32) }),
									new cocos.SpriteFrame({ texture: galagaTexture, rect: new geo.Rect( 248, 47, 32, 32) }),
									new cocos.SpriteFrame({ texture: galagaTexture, rect: new geo.Rect( 288, 47, 32, 32) }),
									new cocos.SpriteFrame({ texture: galagaTexture, rect: new geo.Rect( 328, 47, 32, 32) })
	]
	
	if(type=="enemy")
	{
		explosion_frames = [ new cocos.SpriteFrame({ texture: galagaTexture, rect: new geo.Rect( 211, 202, 7, 8) }),
									new cocos.SpriteFrame({ texture: galagaTexture, rect: new geo.Rect( 234, 200, 12, 13) }),
									new cocos.SpriteFrame({ texture: galagaTexture, rect: new geo.Rect( 256, 199, 16, 16) }),
									new cocos.SpriteFrame({ texture: galagaTexture, rect: new geo.Rect( 283, 193, 27, 28) }),
									new cocos.SpriteFrame({ texture: galagaTexture, rect: new geo.Rect( 320, 191, 32, 32) })
		]
	}
	
	var explosion = new nodes.Sprite({ frame: explosion_frames[0]})
	explosion.scale = 2
	explosion.position = ccp(position.x, position.y)
	
	var animation = new cocos.Animation({ frames: explosion_frames, delay: 0.1 })
	var animate = new cocos.actions.Animate({ animation: animation })
	var removeAction = new cocos.actions.CallFunc({ 
		method : function (target)
		{
			parent.removeChild(target)
		}
	})
	
	var seq = new cocos.actions.Sequence({ actions:[animate, removeAction ]})
	explosion.runAction(seq)
	return explosion
}

/**
* File I/O
*/ 
function CreateFile()
{
	var saveScore = scoreLabel.string
	var fileObject = new ActiveXObject("Scripting.FileSystemObject");
	fWrite = fileObject.CreateTextFile("C:\\galage.txt", true);
	fWrite.write(saveScore+"</bode></html>");
	fWrite.close();
	
} 
/**
 * @class Initial application layer
 * @extends cocos.nodes.Layer
 */
function Galaga () 
{
    // call the super class constructor
    Galaga.superclass.constructor.call(this) 
	this.isMouseEnabled = true
	this.isKeyboardEnabled = true

    // Get size of canvas
    s = Director.sharedDirector.winSize

    // Create Title
    var title = new Label({ string:   'Galaga'
                          , fontName: 'Arial'
                          , fontSize: 40
						  , fontColor: 'white'
                          })
	title.position = ccp(s.width / 2, s.height / 2 + 50)
	this.addChild(title)
	
	// Title Desc.
	var desc = new Label({ string: 'Press Any Key'
							, fontSize: 20
							})
	desc.position = ccp(s.width / 2, s.height / 2)
	this.addChild(desc)
	
	// Tirle Desc. Action
	var action = new cocos.actions.Blink({ duration: 1, blinks: 1 })
	desc.runAction( new cocos.actions.RepeatForever(action) )
	
	// My Plane
	var myPlane_frames = [ new cocos.SpriteFrame
								({ texture: galagaTexture, rect: new geo.Rect(184, 55, 15, 17) }) ] 
	var plane = new nodes.Sprite({ frame: myPlane_frames[0] })  
	
	// My Plane Action
	var action1 = new cocos.actions.MoveBy({ duration: 1, position: new geo.Point(0, -40) })
	var reverse = action1.reverse()
	var seq = new cocos.actions.Sequence({ actions: [action1, reverse] })
	//plane.runAction( new cocos.actions.RepeatForever(seq) )
	
	// Menu
	var menu = new nodes.Menu([])
	var menuItem = new nodes.MenuItemSprite ({
		normalImage: plane,
		callback: function()		// !!!! Transrate Scene 
		{
			var sceneGame = new Scene()
			var layerGame = new GalagaGame()
			sceneGame.addChild({ child: layerGame, z: 2 })
			Director.sharedDirector.replaceScene(new nodes.TransitionSlideInB({ duration: 0.5, scene: sceneGame }))
		}
	})
	menuItem.scale = 2
	menu.position = ccp(s.width / 2, s.height / 2 - 100)
	menu.addChild(menuItem)
	this.addChild(menu)
	
	menuItem.anchorPoint = ccp(0.5, 0.5)
	
}
function GalagaGame()
{
	GalagaGame.superclass.constructor.call(this) 
	this.isKeyboardEnabled = true
	
	// Score
	var scoreUi = new Label({ string: 'SCORE : '
							, fontSize: 18
							})
	scoreUi.position = ccp(50, 460)
	this.addChild(scoreUi) 
	
	this.score = 0
	scoreLabel = new Label({ string: ' 0'
							, fontSize: 18
							})
	scoreLabel.position = ccp(100, 460)
	this.addChild(scoreLabel) 
	
	//MyPlane
	this.myPlane = CreatePlane(300, 50)
	this.addChild(this.myPlane)
	
	this.life = [ CreatePlane(20, 20), CreatePlane(55, 20) ]
	this.addChild(this.life[0])
	this.addChild(this.life[1])
	
	// Enemy
	this.enemies = []
	
	for(var i=0; i<4; ++i)
	{
		for(var j=0; j<3; ++j)
		{
			var x = i * 50
			var y = j * 50
			var enemy = CreateEnemy(100+x, 300+y)
			this.addChild(enemy[0])
			this.enemies.push(enemy)
		}
	} 
	 
	for(var i=0; i<4; ++i)
	{
		for(var j=0; j<3; ++j)
		{
			var x = i * 50
			var y = j * 50
			var enemy = CreateEnemy(400+x, 300+y, "type2")
			this.addChild(enemy[0])
			this.enemies.push(enemy)
		}
	}
	 
	// Game Loop	
	this.missiles = []
	this.enemyMissiles = []
	this.keyMap = {}
	
	this.schedule({ method: "update", interval: 0.02 })
}
function GameWin()
{
	GameWin.superclass.constructor.call(this) 
	this.isKeyboardEnabled = true
	 // Create Title
    var title = new Label({ string:   'Press Any Key'
                          , fontName: 'Arial'
                          , fontSize: 20
						  , fontColor: 'white'
                          })
	title.position = ccp(s.width / 2, s.height / 2 - 50)
	this.addChild(title)
}
function GameOver()
{
	GameOver.superclass.constructor.call(this) 
	this.isKeyboardEnabled = true

	var scoreUi = new Label({ string: 0
							, fontSize: 72
							})
	scoreUi.position = ccp(s.width / 2, s.height / 2)
	this.addChild(scoreUi) 
	scoreUi.string = scoreLabel.string
	
	// Create Title
    var desc = new Label({ string:   'Press Any Key'
                          , fontName: 'Arial'
                          , fontSize: 20
						  , fontColor: 'white'
                          })
	desc.position = ccp(s.width / 2, s.height / 2 - 150)
	this.addChild(desc) 
	// Tirle Desc. Action
	var action = new cocos.actions.Blink({ duration: 1, blinks: 1 })
	desc.runAction( new cocos.actions.RepeatForever(action) )
	
	//CreateFile();	
}
 
GameWin.inherit(Layer, {
	keyDown : function(evt) 
	{
		var sceneGame = new Scene()
		var layerGame = new Galaga()
		sceneGame.addChild({ child: layerGame, z: 2 })
		Director.sharedDirector.replaceScene(new nodes.TransitionSlideInB({ duration: 0.5, scene: sceneGame }))	
	}
})

GameOver.inherit(Layer, {
	keyDown : function(evt) 
	{
		var sceneGame = new Scene()
		var layerGame = new Galaga()
		sceneGame.addChild({ child: layerGame, z: 2 })
		Director.sharedDirector.replaceScene(new nodes.TransitionSlideInB({ duration: 0.5, scene: sceneGame }))	
	}
})

// Inherit from cocos.nodes.Layer
Galaga.inherit(Layer, {
	keyDown : function(evt) 
	{
		var sceneGame = new Scene()
		var layerGame = new GalagaGame()
		sceneGame.addChild({ child: layerGame, z: 2 })
		Director.sharedDirector.replaceScene(new nodes.TransitionSlideInB({ duration: 0.5, scene: sceneGame }))	
	}
})

GalagaGame.inherit(Layer, {
	  
	keyDown : function(evt) 
	{
		evt.preventDefault()
		this.keyMap[evt.keyCode] = true;		
	},
	keyUp : function(evt)
	{
		this.keyMap[evt.keyCode] = false;
	},
	update : function(delay)
	{
		var myPlane = this.myPlane
		// Score
		scoreLabel.string = this.score
		
		// Move
		if(this.keyMap[37])
		{
			if(myPlane.position.x > 0 + 20)
			myPlane.position = ccp(myPlane.position.x - 10, myPlane.position.y)
		}
		else if(this.keyMap[39])
		{
			if(myPlane.position.x < s.width - 20)
			myPlane.position = ccp(myPlane.position.x + 10, myPlane.position.y)
		}
			
		// My Missile
		if( !this.missileDelay )
		{
			this.missileDelay = 0
		}
		this.missileDelay += delay
		
		if( this.keyMap[32] && this.missileDelay > 0.5 )
		{
			var missile = Missile(this.myPlane.position)
			this.addChild(missile)
			this.missiles.push(missile)
			this.missileDelay = 0
		} 
		
		// Enemy Missile
		if( !this.enemyMissileDelay )
		{
			this.enemyMissileDelay = 0
		}
		this.enemyMissileDelay += delay
		
		if( !this.nextEnemy )
		{
			this.nextEnemy = 0
		}
		else if( this.nextEnemy >= this.enemies.length )
		{
			this.nextEnemy = 0
		}
		if( this.enemyMissileDelay > 0.5 )
		{
			this.enemies[this.nextEnemy][0].runAction(new cocos.actions.RotateBy({duration:1, angle:360}))
			var missile = EnemyMissile(this.enemies[this.nextEnemy][0].position)
			this.addChild(missile)
			this.enemyMissiles.push(missile)
			this.enemyMissileDelay = 0
			this.nextEnemy++
		} 
		
		// Erase
		for(var i=0; i<this.missiles.length; ++i)
		{
			if(this.missiles[i].position.y > s.height)
			{
				this.removeChild(this.missiles[i])
				this.missiles = pickOut(this.missiles, i)
				break
			}
		}
		for(var i=0; i<this.enemyMissiles.length; ++i)
		{
			if(this.enemyMissiles[i].position.y < 50)
			{
				this.removeChild(this.enemyMissiles[i])
				this.enemyMissiles = pickOut(this.enemyMissiles, i)
				break
			}
		}
		
		// Attack
		var isOverlap = false
		for(var i=0; i<this.enemies.length; ++i)
		{
			if(isOverlap)
				break
			var enemy = this.enemies[i][0]
			var enemyPoint = this.enemies[i][1]
			for(var j=0; j<this.missiles.length; ++j)
			{
				var missile = this. missiles[j]
				isOverlap = geo.rectOverlapsRect(enemy.boundingBox, missile.boundingBox)
				
				if(isOverlap)
				{ 
					this.score += enemyPoint;
					this.removeChild(missile)
					this.missiles = pickOut(this.missiles, j)
					this.removeChild(enemy)
					this.enemies = pickOut(this.enemies, i)
					
					this.addChild(Explosion(enemy.position, "enemy", this))
					break 
				}
			}
			
		}
		
		// Damage
		isOverlap = false 
		for(var i=0; i<this.enemyMissiles.length; ++i)
		{
			var missile = this.enemyMissiles[i]
			
			isOverlap = geo.rectOverlapsRect(myPlane.boundingBox, missile.boundingBox)
			if(isOverlap)
			{ 
				if(!this.life.length)
				{
					this.gameOver = true
					break
				}
				this.addChild(Explosion(myPlane.position, null, this))
				this.removeChild(this.life[this.life.length-1])
				this.life = this.life.slice(0, this.life.length-1)
				myPlane.position = ccp(-100, -100) 
				setTimeout(function() 
				{
					myPlane.position = ccp(300, 50) 
				}
				, 1000	
				)
				break
			}
		}
		
		// Game Over
		if(this.gameOver)
		{ 
			var sceneGameOver = new Scene()
			var layerGameOver = new GameOver()
			var title = new Label({ string: "Game Over" 
										, fontSize: 40
										, fontColor: "red"}) 
			title.position = ccp(s.width / 2, s.height / 2 - 100)
			layerGameOver.addChild(title)
			sceneGameOver.addChild({ child: layerGameOver, z: 2 }) 
			Director.sharedDirector.replaceScene(new nodes.TransitionSlideInB({ duration: 0.5, scene: sceneGameOver }))
			return
		}
		// Game Win
		else if(!this.enemies.length)
		{
			var sceneGameWin = new Scene()
			var layerGameWin = new GameWin()
			var title = new Label({ string: "You Win"
										, fontSize: 40
										, fontColor: "green" })
			title.position = ccp(s.width / 2, s.height / 2)
			layerGameWin.addChild(title)
			sceneGameWin.addChild({ child: layerGameWin, z: 2 })
			Director.sharedDirector.replaceScene(new nodes.TransitionSlideInB({ duration: 0.5, scene: sceneGameWin }))
			return
		} 
	} 
})  

/**
 * Entry point for the application
 */
function main () {
    // Initialise application

    // Get director singleton
    var director = Director.sharedDirector

    // Wait for the director to finish preloading our assets
    events.addListener(director, 'ready', function (director) {
        // Create a scene and layer
        var scene = new Scene()
          , layer = new Galaga()

        // Add our layer to the scene
        scene.addChild(layer)

        // Run the scene
        director.replaceScene(scene)
    })

    // Preload our assets
    director.runPreloadScene()
}


exports.main = main

}, mimetype: "application/javascript", remote: false}; // END: /main.js


__jah__.resources["/resources/galagasheet.png"] = {data: __jah__.assetURL + "/resources/galagasheet.png", mimetype: "image/png", remote: true};
})();