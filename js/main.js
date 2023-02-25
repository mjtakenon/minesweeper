


window.addEventListener("load",() => {
    new MineSweeper();
})


class MineSweeper {

    CELL_COLOR = [
        "#EEEEEE",
        "blue",
        "green",
        "red",
        "darkblue",
        "maroon",
        "teal",
        "black",
        "gray",
    ]

    MAX_WIDTH = 50
    MAX_HEIGHT = 50
    MAX_MINES = 999

    MIN_WIDTH = 10
    MIN_HEIGHT = 10
    MIN_MINES = 10

    constructor() 
    {
        document.getElementById("reset_button").addEventListener("click", () => {
            this.init()
        })

        this.init()
    }

    init() 
    {
        this.reset()
        this.readParameter()
        this.validateParameter()
        this.create()
    }
    
    reset() 
    {
        let elements = ["field", "clear-notification", "gameover-notification"]
        for (let element of elements) {
            let el = document.getElementById(element)
            if (el !== null) {
                el.remove()
            }
        }
    }
    
    readParameter() 
    {
        let mines = document.getElementById("mines_input").value
        let width = document.getElementById("width_input").value
        let height = document.getElementById("height_input").value
        this.parameter = new FieldParameter(mines, width, height)
    }

    validateParameter()
    {
        let isInvalid = false
        if (this.parameter.width < this.MIN_WIDTH || this.parameter.width > this.MAX_WIDTH || Number.isNaN(this.parameter.width)) {
            alert("Invalid number of width.")
        }

        if (this.parameter.height < this.MIN_HEIGHT || this.parameter.height > this.MAX_HEIGHT || Number.isNaN(this.parameter.height)) {
            alert("Invalid number of height.")
        }

        if (this.parameter.mines < this.MIN_MINES || this.parameter.mines > this.MAX_MINES || Number.isNaN(this.parameter.mines)) {
            alert("Invalid number of mines.")
        }

        if (this.parameter.mines >= this.parameter.width * this.parameter.height) {
            alert("The number of mines must be less than cells.")
        }

        if (isInvalid) {
            throw new Error("Invalid Parameters.")
        }
    }
    
    create() 
    {
        let field = document.createElement("div")
        field.setAttribute("id", "field")
    
        let game = document.createElement("table")
        for (let y=0; y<this.parameter.height; y++) {
            let tr = document.createElement("tr")
            for (let x=0; x<this.parameter.width; x++) {
                let td = document.createElement("td")
                td.appendChild(document.createTextNode(""))
                td.setAttribute("class", "button cell")
                td.setAttribute("id", (new Point(x, y)).toString())
                td.addEventListener("click", (e) => {this.clickCell(e)})
                td.oncontextmenu = (e) => {this.rightClickCell(e); return false}
                tr.appendChild(td)
            }
            game.appendChild(tr)
        }
    
        field.appendChild(game)
        document.getElementById("game").appendChild(field)
    
        this.cells = this.generateCells(this.parameter)
        this.isOpened = this.generate2dArray(this.parameter.width, this.parameter.height, false)
        this.isFlagged = this.generate2dArray(this.parameter.width, this.parameter.height, false)
    }
    
    clickCell(e) 
    {
        let point = Point.fromString(e.target.getAttribute("id"))
        
        if (!this.isOpened.flat().includes(true)) {
            if (this.cells[point.y][point.x] === Cell.MINE) {
                let numberCells = []
                for (let y=0; y<this.cells.length; y++) {
                    for (let x=0; x<this.cells[y].length; x++) {
                        if (this.cells[y][x] !== Cell.MINE) {
                            numberCells.push(new Point(x, y))
                        }
                    }
                }
                let targetCell = numberCells[this.getRandomInt(numberCells.length)]
                this.cells[targetCell.y][targetCell.x] = Cell.MINE
                this.cells[point.y][point.x] = 0
                this.setNumbers(this.cells)
            }
        }

        if (this.isOpened[point.y][point.x]) {
            return
        }

        let openTargetCells = [point.toString()]
        this.openCells(openTargetCells)

        if (this.isCleared()) {
            this.clear()
        }
    }

    rightClickCell(e) 
    {
        let point = Point.fromString(e.target.getAttribute("id"))

        if (this.isOpened[point.y][point.x]) {
            return
        }

        if (this.isFlagged[point.y][point.x]) {
            this.clearCell(point)
            this.isFlagged[point.y][point.x] = false
        } else {
            this.setCellFlag(point)
        }
    }
    
    setCellFlag(point) {
        this.clearCell(point)        
        let cell = document.getElementById(point.toString())
        cell.appendChild(document.createTextNode("🚩"))
        this.isFlagged[point.y][point.x] = true
    }

    setCellString(point, str) {
        this.clearCell(point)
        let cell = document.getElementById(point.toString())
        cell.style.backgroundColor = "#EEEEEE"
        cell.appendChild(document.createTextNode(str))
    }
    
    clearCell(point) {
        let cell = document.getElementById(point.toString())
        let td = document.createElement("td")
        td.appendChild(document.createTextNode(""))
        td.setAttribute("class", "button cell")
        td.setAttribute("id", (new Point(point.x, point.y)).toString())
        td.addEventListener("click", (e) => {this.clickCell(e)})
        td.oncontextmenu = (e) => {this.rightClickCell(e); return false}
        cell.after(td)
        cell.remove()
    }

    openCells(openTargetCells) 
    {
        if (openTargetCells.length === 0) {
            return []
        }

        let point = Point.fromString(openTargetCells.pop())
        let cell = document.getElementById(point.toString())

        if (this.isFlagged[point.y][point.x]) {
            return openTargetCells = this.openCells(openTargetCells)
        }

        if (this.cells[point.y][point.x] === Cell.MINE) {
            cell.appendChild(document.createTextNode("💣"))
        } else {
            cell.appendChild(document.createTextNode(this.cells[point.y][point.x]))
        }
        cell.style.color = this.CELL_COLOR[this.cells[point.y][point.x]]
        cell.style.backgroundColor = "#EEEEEE"
        this.isOpened[point.y][point.x] = true

        if (this.cells[point.y][point.x] === Cell.MINE) {
            this.gameover()
            return []
        }

        if (this.cells[point.y][point.x] === "0") {
            for (let yy = point.y-1; yy <= point.y+1; yy++) {
                for (let xx = point.x-1; xx <= point.x+1; xx++) {
                    let p = new Point(xx, yy)
                    if (!this.isValidIndex(this.isOpened, p) 
                        || openTargetCells.includes(p.toString()) 
                        || this.isOpened[yy][xx]) {
                        continue
                    }

                    openTargetCells.push(p.toString())
                }
            }
        }

        return openTargetCells = this.openCells(openTargetCells)
    }

    generateCells() 
    {
        let cells = this.generate2dArray(this.parameter.width, this.parameter.height, 0)
        
        let mines = this.generateMines(this.parameter)
        cells = this.setMines(cells, mines)
        cells = this.setNumbers(cells)
        return cells
    }

    generateMines() 
    {
        let mines = []

        for (let n=0; n < this.parameter.mines; n++) {
            let point = null

            do {
                point = (new Point(this.getRandomInt(this.parameter.width), this.getRandomInt(this.parameter.height))).toString()
            } while((mines.includes(point)))

            mines.push(point)
        }

        return mines.map(m => Point.fromString(m))
    }

    setMines(cells, mines) 
    {
        for (let mine of mines) {
            cells[mine.y][mine.x] = Cell.MINE
        }

        return cells
    }
    
    setNumbers(cells)
    {
        for (let y=0; y<cells.length; y++) {
            for (let x=0; x<cells[y].length; x++) {
                if (cells[y][x] === Cell.MINE) {
                    continue
                }
                cells[y][x] = this.countMines(cells, x, y).toString()
            }
        }
        return cells
    }

    countMines(cells, x, y)
    {
        let count = 0
        for (let yy = y-1; yy <= y+1; yy++) {
            for (let xx = x-1; xx <= x+1; xx++) {
                let p = new Point(xx, yy)
                if (!this.isValidIndex(cells, p)) {
                    continue
                }

                if (cells[p.y][p.x] === Cell.MINE) {
                    count += 1
                }
            }
        }
        return count
    }
    
    getRandomInt(max) 
    {
        return Math.floor(Math.random() * max);
    }

    generate2dArray(x, y, val)
    {
        return Array.from(new Array(y), _ => new Array(x).fill(val));
    }

    isValidIndex(arr, point) 
    {
        return  point.x >= 0 
                && point.y >= 0 
                && point.x < arr[0].length
                && point.y < arr.length
    }

    isCleared() 
    {
        for (let y=0; y<this.cells.length; y++) {
            for (let x=0; x<this.cells[y].length; x++) {
                if (this.cells[y][x] !== Cell.MINE && !this.isOpened[y][x]) {
                    return false
                }
                if (this.cells[y][x] === Cell.MINE && this.isOpened[y][x]) {
                    return false
                }
            }
        }
        return true
    }

    clear()
    {
        for (let y=0; y<this.cells.length; y++) {
            for (let x=0; x<this.cells[y].length; x++) {
                if (this.cells[y][x] === Cell.MINE) {
                    this.setCellFlag(new Point(x, y))
                }
            }
        }

        this.isOpened = this.generate2dArray(this.cells[0].length, this.cells.length, true)

        this.showClearNotification()
    }

    gameover()
    {
        for (let y=0; y<this.cells.length; y++) {
            for (let x=0; x<this.cells[y].length; x++) {
                if (this.cells[y][x] === Cell.MINE && !this.isOpened[y][x] && !this.isFlagged[y][x]) {
                    this.setCellString(new Point(x, y), "💣")
                }

                if (this.cells[y][x] !== Cell.MINE && this.isFlagged[y][x]) {
                    this.setCellString(new Point(x, y), "❌")
                }
            }
        }

        this.isOpened = this.generate2dArray(this.cells[0].length, this.cells.length, true)
        
        this.showGameOverNotification()
    }

    showClearNotification()
    {
        let clearNotification = document.createElement("div")
        let deleteButton = document.createElement("button")
        deleteButton.setAttribute("class", "delete")
        deleteButton.addEventListener("click", (e) => {e.target.parentElement.remove()})
        clearNotification.appendChild(deleteButton)
        clearNotification.appendChild(document.createTextNode("🚩ゲームクリア！🚩"))
        clearNotification.setAttribute("class", "notification is-primary")
        clearNotification.setAttribute("id", "clear-notification")
        
        document.getElementById("form").after(clearNotification)
    }

    showGameOverNotification()
    {
        let clearNotification = document.createElement("div")
        let deleteButton = document.createElement("button")
        deleteButton.setAttribute("class", "delete")
        deleteButton.addEventListener("click", (e) => {e.target.parentElement.remove()})
        clearNotification.appendChild(deleteButton)
        clearNotification.appendChild(document.createTextNode("💣ゲームオーバー💣"))
        clearNotification.setAttribute("class", "notification is-danger")
        clearNotification.setAttribute("id", "gameover-notification")
        
        document.getElementById("form").after(clearNotification)
    }
}

class FieldParameter 
{
    constructor(mines, width, height) 
    {
        this.mines = parseInt(mines)
        this.width = parseInt(width)
        this.height = parseInt(height)
    }
}

class Field {

}

class Cell {
    MINE = "mine"
}

class Point {
    constructor(x,y) {
        this.x = x
        this.y = y
    }

    toString() {
        return this.x + "," + this.y
    }

    static toArray(str) {
        return str.split(",").map((s) => parseInt(s))
    }

    static fromString(str) {
        let point = Point.toArray(str)
        return new Point(point[0], point[1])
    }
}