


window.addEventListener("load",() => {
    new MineSweeper();
})


class MineSweeper {

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
        let parameter = this.readParameter()
        this.create(parameter)
    }
    
    reset() 
    {
        let field = document.getElementById("field")
        if (field !== null) {
            field.remove()
        }
    }
    
    readParameter() 
    {
        let mines = document.getElementById("mines_input").value
        let width = document.getElementById("width_input").value
        let height = document.getElementById("height_input").value
        let parameter = new FieldParameter(mines, width, height)
        return parameter
    }
    
    create(parameter) 
    {
        let field = document.createElement("div")
        field.setAttribute("id", "field")
    
        let game = document.createElement("table")
        for (let y=0; y<parameter.height; y++) {
            let tr = document.createElement("tr")
            for (let x=0; x<parameter.width; x++) {
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
    
        this.cells = this.generateCells(parameter)
        this.isOpened = this.generate2dArray(parameter.width, parameter.height, false)
        this.isFlagged = this.generate2dArray(parameter.width, parameter.height, false)
    }
    
    clickCell(e) 
    {
        let point = Point.fromString(e.target.getAttribute("id"))
        
        if (this.isOpened[point.y][point.x]) {
            return
        }

        let openTargetCells = [point.toString()]
        this.openCells(openTargetCells)
    }

    rightClickCell(e) 
    {
        let point = Point.fromString(e.target.getAttribute("id"))

        if (this.isOpened[point.y][point.x]) {
            return
        }

        let cell = document.getElementById(point.toString())

        if (this.isFlagged[point.y][point.x]) {
            let td = document.createElement("td")
            let tr = cell.parentNode

            td.appendChild(document.createTextNode(""))
            td.setAttribute("class", "button cell")
            td.setAttribute("id", (new Point(point.x, point.y)).toString())
            td.addEventListener("click", (e) => {this.clickCell(e)})
            td.oncontextmenu = (e) => {this.rightClickCell(e); return false}
            cell.after(td)
            cell.remove()

            this.isFlagged[point.y][point.x] = false
        } else {
            cell.appendChild(document.createTextNode("🏁"))
            this.isFlagged[point.y][point.x] = true
        }
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

        cell.appendChild(document.createTextNode(this.cells[point.y][point.x]))
        
        this.isOpened[point.y][point.x] = true

        if (this.cells[point.y][point.x] === "m") {
            console.log("game over")
            // return
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

    generateCells(parameter) 
    {
        let cells = this.generate2dArray(parameter.width, parameter.height, 0)
        
        let mines = this.generateMines(parameter)
        cells = this.setMines(cells, mines)
        cells = this.setNumbers(cells)
        return cells
    }

    generateMines(parameter) 
    {
        if (parameter.mines > parameter.width * parameter.height) {
            throw new Error('mines number invalid');
        }

        let mines = []

        for (let n=0; n < parameter.mines; n++) {
            let point = null

            do {
                point = (new Point(this.getRandomInt(parameter.width), this.getRandomInt(parameter.height))).toString()
            } while((mines.includes(point)))

            mines.push(point)
        }

        return mines.map(m => Point.fromString(m))
    }

    setMines(cells, mines) 
    {
        for (let mine of mines) {
            cells[mine.y][mine.x] = "m"
        }

        return cells
    }
    
    setNumbers(cells)
    {
        for (let y=0; y<cells.length; y++) {
            for (let x=0; x<cells[y].length; x++) {
                if (cells[y][x] === "m") {
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

                if (cells[p.y][p.x] === "m") {
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

    isValidIndex(arr, point) {
        return  point.x >= 0 
                && point.y >= 0 
                && point.x < arr[0].length
                && point.y < arr.length
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