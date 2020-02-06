/*
Game Creator: Cristian Cano
Coding & Graphics: Cristian Cano
Sounds: Pending...
*/

let gameStatus = "OFF" 	//indica si el juego esta en marcha "ON", no arrancado "OFF" o pausa "PAUSE"
let debug = false 		// Muestra labels para debugar y console logs...
let gameSpeed = 17 		// ms transcurridos los cuales se llama a un UpdateGame()

let lastCallTime_FPS 	// hora a la que se llam? por ultima vez al calculo de FPS
let fps					// FPS actuales del juego

// Variables ingame
let ticks = 0			// veces que se ha llamado a UpdateGame()
let score = 0			// puntuacion actual
let generatedID = 0		// Contador de ID's de enemigos generadas
let ComboSeconds = 0	// Tiempo restante en ms para seguir con el combo
let ComboMulti = 1		// Multiplicador de puntos segun el combo actual
let ComboTimer			// Timer que comprueba si el combo sigue vivo

let enemies = []		// array principal que guardar? los objetos enemigos creados


const SCREEN_WIDTH = 800 	// Constante del width del div #Game
const SCREEN_HEIGHT = 400	// Constante del height del div #Game

const WIDTH = 750			// Constante del width del div #GameBoundaries
const HEIGHT = 350			// Constante del height del div #GameBoundaries

$(function () {
	Init() // Se inicializa el juego
	
	$('head').append('<link rel="stylesheet" href="css/Game.css" type="text/css" />');

	// ----------  Eventos de la UI
		$("#Game").on("click", "#pause", function () {
			if (GetGameStatus() == "PAUSE")
				Resume()
			else
				if (GetGameStatus() =="ON")
					Pause()
		})
		
		$(window).on('resize', function () {
			CenterUI()
		})
		
		$("#Game").on("click", "[id^=enemy]", function () {
			if (GetGameStatus() == "ON") {
				enemyHitID = $(this).attr("id")
				if (debug) console.log(enemyHitID + " was hit!")
				KillEnemy(enemyHitID)
				ComboKill()

			}
			
		})

		// Ya que los enemigos son imagenes, se deshabilita el Drag 
		// de las imagenes para evitar problemas al jugar
		$("#Game").on("dragstart", "[id^=enemy]", function (e) {
			e.preventDefault()
		})

		/*$("#Game").on("mousemove", "#GameBoundaries", function (e) {
			// Offset para calcular la posicion relativa del raton dentro de Game
			let offset = $("#Game").offset();
			let relX = e.pageX - offset.left
			let relY = e.pageY - offset.top

			// Se le resta el tama?o del cursor para mostrarlo correctamente
			relX = relX - $("#crosshair").width()
			relY = relY - $("#crosshair").height()

			$('#crosshair').css({
				top: (relY) + 'px',
				left: (relX) + 'px'
			});
		});*/
	
	// ------------- Fin eventos UI
})

// Esta funcion controla todo el juego y todo se inicia desde aqui
function Init() {
	if (debug) console.log("Game Initializing...")
	
	LoadUI() 						// Se carga la UI
	LoadGraphics() 					// Preload de los enemigos

	gameStatus = "ON"

	setTimeout(function () { 		// Se establece un tiempo de 50ms para que cargue las imagenes
		PrintGameStatus()
		GenerateEnemy()
		GenerateEnemy()
		GenerateEnemy()
		GenerateEnemy()

		setInterval(function () { 	//Cada tick (gamespeed) se Actualiza el juego si no esta en PAUSE
			if (debug) {
				CalculateFPS()
				$("#fps").html(fps.toFixed(2))
			}
			if (gameStatus == "ON") { UpdateGame() }
		}, gameSpeed);	
	}, 50)
	
}

// Esta funcion genera enemigos b?sicos
function GenerateEnemy() {
	let preload_enemy_img = $("#preload_enemy_img")

	// Se calcula aletoriamente la X, la Y y la direccion Vertical y Horizontal del enemigo
	let newEnemy_X = Math.round(Math.random() * (WIDTH + 1))
	let newEnemy_Y = Math.round(Math.random() * ((HEIGHT - preload_enemy_img.height()) + 1))
	let newEnemy_Hgoing = Math.round(Math.random())
	let newEnemy_Vgoing = Math.round(Math.random())

	if (debug) console.log("Enemy created at: x=" + newEnemy_X + ":y=" + newEnemy_Y)

	// Se crea una instancia del enemigo y se pushea al array principal de enemigos
	let enemy = new Enemy(newEnemy_X, newEnemy_Y, newEnemy_Hgoing, newEnemy_Vgoing, "enemy" + generatedID++)
	enemies.push(enemy)

	// Parametros visuales del enemigo un DIV con una IMG dentro
	enemyString = "<div id='" + enemy.ID + "' style='width:" + enemy.size + "px; "
	enemyString = enemyString + "position:absolute; left: " + enemy.X + "px; "
	enemyString = enemyString + "top: " + enemy.Y + "px'>"
	enemyString = enemyString + "<img src = '" + enemy.src + "' width = '" + enemy.size + "' >"
	if (debug) enemyString = enemyString + "<label style='color:white; font-size:0.8em;' id=label" + enemy.ID + "></label>"
	enemyString = enemyString + "</div>"
	
	// Se añade a la ventana de juego
	$("#GameBoundaries").append(enemyString)
}

// Funcion para eliminar enemigos de pantalla (se llama desde onclick)
function KillEnemy(ID) {
	// Se captura referencia al elemento del array de enemies
	let enemy = $.grep(enemies, function (array) { return array.ID == ID })

	// Se actualiza la puntuacion segun el (valor del objetivo * Multiplicador de Combo)
	let enemyValue = enemy[0].score * ComboMulti
	score = score + (enemyValue)

	// Se llama a la función para que muestro el valor del objetivo en la posicion en la que ha muerto
	SpawnScore_AfterKill(enemyValue, enemy[0].X, enemy[0].Y,ID)

	// Se elimina el enemy del array de enemies y del DOM
	enemies = $.grep(enemies, function (array) { return array.ID != ID })
	$("#" + ID).remove()
}

// Funcion para mostrar el valor de un enemigo eliminado en el lugar donde murio
function SpawnScore_AfterKill(enemyScore, X, Y, ID) {
	// Se añade un label a GameBoundaries y se le hace crecer y encojerse, para despues hacer fadeOut
	$("#GameBoundaries").append("<label id='addScore" + ID + "' style='position:absolute; top:" + Y + "px;left:" + X + "px;'>" + enemyScore + "</label>")
	$("#addScore" + ID).animate({ fontSize: "1.5em" }, gameSpeed * 10, function () {
		$("#addScore" + ID).animate({ fontSize: "1em" }, gameSpeed * 10, function () {
			$("#addScore" + ID).fadeOut(gameSpeed * 100, function () {
				$(this).remove() // se elimina del DOM
			})
		})
	})
}

// Funcion que actualiza el estado del juego cada tick (gameSpeed)
function UpdateGame() {
	// Se actualizan los contadores
	ticks++
	GameTime = (ticks * gameSpeed) / 1000
	ComboSeconds = ComboSeconds - 1000
	
	// Se actualizan los labels
	$("#ticks").html(GameTime.toFixed(0))
	$ ("#score").html(score)

	// Se mueven los enemigos
	$.each(enemies, function (index, enemy) {
		enemy.move()
	})
}

// Preload de los graficos para poder hacer referencia a ellos y saber el tamaño antes de usarlos
function LoadGraphics() {
	$("#Game").append("<img src='assets/enemy.png' id='preload_enemy_img' width='50px' style='display:none;'>")
	/*$("#GameBoundaries").append("<img src='assets/crosshair.png' id='crosshair' style='position:absolute; z-index:1000'>")*/
	if (debug) console.log("Graphics appended.")
}

// Funcion para cargar la interfaz de usuaio
function LoadUI() {
	$("#Game").width(SCREEN_WIDTH)
	$("#Game").height(SCREEN_HEIGHT)
	$("#Game").append("<label id='score' class='score'>" + score + "</label>")
	$("#Game").append("<button id='pause' class='pause' >Pause</button>")
	$("#Game").append("<label id='ticks' class='ticks'>" + ticks + "</label>")
	if (debug) $("#Game").append("<br><label id='fps'>" + fps + "</label>")
	$("#Game").append("<div id='GameBoundaries'></div>")
	$("#GameBoundaries").css({
		width: WIDTH + "px",
		height: HEIGHT + "px",
		top: ((SCREEN_HEIGHT - HEIGHT) / 2) + "px",
		left: ((SCREEN_WIDTH - WIDTH) / 2) + "px",
		display: "inline-block",
		overflow: "hidden",
		position: "absolute",
		"background-image": "url('assets/background.jpg",
		"background-size": "cover"
	})
	$("#GameBoundaries").append("<label id='comboCounter'></label>")
	$("comboCounter").css({
		left: (SCREEN_WIDTH - 100) + "px",
		top: "20px",
		display: "none"
	})
	
	CenterUI() // Se centra en pantalla
	if (debug) console.log ("UI Loaded.")
}

// Funcion para centrar el div #Game (principal) en la pantalla
function CenterUI() {
	$("#Game").css({
		position: "relative",
		overflow: "hidden",
		top: Math.max(0, (($(window).height() - $("#Game").outerHeight()) / 2) + $(window).scrollTop()) + "px",
		left: Math.max(0, (($(window).width() - $("#Game").outerWidth()) / 2) + $(window).scrollLeft()) + "px",
		textAlign: "center"
	});
}

// funcion para calcular los FPS actuales
function CalculateFPS() {
	// Se guarda un tiempo de referencia
	if (!lastCallTime_FPS) {
		lastCallTime_FPS = $.now()
		fps = 0
		return;
	}
	// se calcula la diferencia entre la fecha anterior y la actual
	delta = ($.now() - lastCallTime_FPS) / 1000
	lastCallTime_FPS = $.now()
	fps = 1 / delta
}

// funcion para controlar los combos
function ComboKill() {

	// Si hay un comba mayor a uno se muestra el label con animación de crecer
	if (ComboMulti > 1){
		$("#comboCounter").show()
		$("#comboCounter").animate({ fontSize: "3em" }, gameSpeed * 10, function () {
			$("#comboCounter").html("x" + ComboMulti)
			$("#comboCounter").animate({ fontSize: "2em" }, gameSpeed * 10)
		})
	}

	// Se inicializa/resetea el combo
	ComboMulti++
	ComboSeconds = 3000
	clearInterval(ComboTimer) // se cancela el timer anterior si lo hay para refrescar el combo

	//TO-DO: Encontrar una manera de no perder el combo al poner PAUSE
	ComboTimer = setInterval(function () {
		if (GetGameStatus() == "ON"){
			if (ComboSeconds <= 0) {
				ComboSeconds = 0
				ComboMulti = 1
				$("#comboCounter").fadeOut()
			}
		}
	},ComboSeconds)
}

function Pause() {
	gameStatus = "PAUSE"
	PrintGameStatus()
}

function Resume() {
	gameStatus = "ON"
	PrintGameStatus()
}

function GetGameStatus() {
	return gameStatus
}

function PrintGameStatus() {
	if (debug) console.log("GameStatus: " + gameStatus)
}