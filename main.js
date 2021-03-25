const heartsPlace = document.querySelector(".hearts")
const scorePlace = document.querySelector(".score")
const heartsPlaceNumber = document.querySelector(".hearts span");
const scorePlaceNumber = document.querySelector(".score span");

const endPage = document.querySelector(".end");
const endScore = document.querySelector(".end .score");
const btn = document.querySelector(".end button");

const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const c = canvas.getContext("2d");

const mouse = {
    x: undefined,
    y: undefined,
}

const controller = {
    left: false,
    right: false,
    top: false,

    keyListener: (e)=>{
         keyState = (e.type=="keydown")?true:false;

         if(e.keyCode == 37 || e.keyCode == 65) controller.left = keyState
         if(e.keyCode == 38 || e.keyCode == 87) controller.top = keyState
         if(e.keyCode == 39 || e.keyCode == 68) controller.right = keyState
    }

}

let hearts = 5
let heartsRestart = hearts
let hurt = false
let score = 0
let end = false

heartsPlaceNumber.textContent = hearts
scorePlaceNumber.textContent = score


const endGame = ()=>{
    end = true
    endScore.textContent = score
    score = 0
    scorePlaceNumber.textContent = score
    

    endPage.style.display = "block"
    heartsPlace.style.display = "none"
    scorePlace.style.display = "none"
}

let floor = canvas.height-100
const gravitate = .2
const friction = .9
const jumpHeight = 15
const enemiesSpeed = .005
let backgroundColor = "rgba(0, 0, 0, 0.1)"

let jump = true

let bullet = {
    x: undefined,
    y: undefined,
    radius: 10,
    isshooted: false,
    velocityX: undefined,
    velocityY: undefined,
}

const bulletOff = ()=>{
    bullet.isshooted = false
    bullet.x = undefined
    bullet.y = undefined
}

const distance = (x1, x2, y1, y2) =>{
    const distanceX = x1-x2
    const distanceY = y1-y2
    const distance = Math.sqrt(Math.pow(distanceX, 2)+Math.pow(distanceY, 2))
    return distance
}

class Player{
    constructor(x, y, radius, color, velocityX, velocityY, floor){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocityX = velocityX
        this.velocityY = velocityY
        this.floor = floor

    }
    draw(){
        c.beginPath()
        c.fillStyle = this.color
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fill()
        c.closePath()

        c.beginPath()
        c.strokeStyle = "grey"
        c.moveTo(0, this.floor+this.radius)
        c.lineTo(canvas.width, this.floor+this.radius)
        c.stroke()
    }

    bullet(){
        c.beginPath()
        c.fillStyle = "red"
        c.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI*2, false)
        c.fill()
        c.closePath()
    }

    colorBack(){
        this.time = setTimeout(()=>{
            this.color = `hsl(${Math.random()*360}, 50%, 50%)`
        }, 500)
    }
    
    colorfull(){
        this.colorfullInterval = setInterval(()=>{
            this.color = this.color = `hsl(${Math.random()*360}, 50%, 50%)`
            controller.top = true
            this.velocityX+=1
        }, 10)
    }

    hurtColor = ()=>{
        this.hurtTime = setTimeout(()=>{
            backgroundColor = "rgba(0, 0, 0, 0.1)"
        }, 100)
    }

    update(){

        this.velocityY += 0.5
        this.x += this.velocityX
        this.y = this.y + this.velocityY
        this.velocityX *= friction
        if(controller.top&&jump==false){
            this.velocityY =- jumpHeight
            this.y -= .5
            jump = true
        }
        if(this.y>this.floor){
            this.y = this.floor
            this.velocityY = 0
            jump = false
        }
        if(controller.left){
            this.velocityX-=.9
        }
        if(controller.right){
            this.velocityX+=.9
        }

        if(this.x>canvas.width+this.radius) this.x = 0-this.radius
        if(this.x<0-this.radius) this.x = canvas.width+this.radius


        if(bullet.isshooted && end==false){
        this.bullet()
        bullet.x += bullet.velocityX
        bullet.y += bullet.velocityY
    }
        if(bullet.x>canvas.width || bullet.x<0 || bullet.y>canvas.height || bullet.y<0){
        bulletOff()
        }

        if(hurt){
            backgroundColor = "rgba(255, 0, 0, 0.05)"
            clearTimeout(this.hurtTime)
            this.hurtColor()
            hurt = false
            hearts--
            heartsPlaceNumber.textContent = hearts
            this.color = "red"
            clearTimeout(this.time)
            this.colorBack()
            if(hearts==0) {
                endGame()
                this.colorfull()
            }
        }

        this.draw()
    }

}


const radius = 25
const color = `hsl(${Math.random()*360}, 50%, 50%)`
const velocityX = 0
const velocityY = 0.1

let player

const plaierInit = ()=>{
    floor = canvas.height-100
    const x = canvas.width/2
    const y = canvas.height*.60
    player = new Player(x, y, radius, color, velocityX, velocityY, floor)
}
plaierInit()


class Enemy{
    constructor(x, y, radius, color, velocityY){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocityY = velocityY
    }
    draw(){
        c.beginPath()
        c.fillStyle = this.color
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fill()
        c.closePath()
    }
    update(){

        const newPlace = ()=>{
            this.y = 0-this.radius
            this.x = Math.floor(Math.random()*(canvas.width-radius+1)+radius)
            scorePlaceNumber.textContent = score
        }

        this.velocityY += enemiesSpeed
        this.y += this.velocityY
        if(this.y+this.radius/2>floor) newPlace()
        if((distance(this.x, bullet.x, this.y, bullet.y)-this.radius-bullet.radius)<0){
            bulletOff()
            score++
            newPlace()
        }
        if((distance(this.x, player.x, this.y, player.y)-this.radius-player.radius)<0){
            newPlace()
            hurt = true
        }

        this.draw()
    }
}
let enemies = []

const enemiesInit = ()=>{
    enemies = []
    for (let i = 0; i < 10; i++) {
        const radius = 50
        const x = Math.floor(Math.random()*(canvas.width-radius+1)+radius)
        const y = Math.floor(Math.random()*(0-400)-400)
        const color = "blue"
        const velocityY = 10
        
        enemies.push(new Enemy(x, y, radius, color, velocityY))
    }
}
enemiesInit()
    
const animate = () =>{
    requestAnimationFrame(animate)
    c.fillStyle = backgroundColor
    c.fillRect(0, 0, canvas.width, canvas.height)
        player.update()
        if(end==false){
            for (let i = 0; i < enemies.length; i++) {
                enemies[i].update()
            }
        }
}
animate()

window.addEventListener("keydown", controller.keyListener)
window.addEventListener("keyup", controller.keyListener)

window.addEventListener("click", (e)=>{
    mouse.x = e.clientX
    mouse.y = e.clientY

     bullet.x = player.x
    bullet.y = player.y
    bullet.isshooted = true
    const velocityX = (mouse.x-player.x)
    const velocityY = (mouse.y-player.y)
     bullet.velocityX = velocityX/10
    bullet.velocityY = velocityY/10
 })

 btn.addEventListener("click", ()=>{
    
    hurt = false
    end = false

    hearts = heartsRestart
    heartsPlaceNumber.textContent = hearts
    
    endPage.style.display = "none"
    heartsPlace.style.display = "block"
    scorePlace.style.display = "block"

    clearInterval(player.colorfullInterval)
    controller.left = false
    controller.top = false
    controller.right = false 

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].velocityY = 10
        enemies[i].y = Math.floor(Math.random()*(0-400)-400)
    }
})

window.addEventListener("resize", ()=>{
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    hearts = heartsRestart
    heartsRestart
    hurt = false
    score = 0
    end = false

    heartsPlaceNumber.textContent = hearts
    scorePlaceNumber.textContent = score
    endPage.style.display = "none"
    heartsPlace.style.display = "block"
    scorePlace.style.display = "block"

    plaierInit()
    enemiesInit()
    clearInterval(player.colorfullInterval)

    controller.left = false
    controller.top = false
    controller.right = false
})