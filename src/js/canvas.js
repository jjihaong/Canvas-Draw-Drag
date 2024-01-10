const cav = document.querySelector('#canvas')
const ctx = cav.getContext('2d')

const colorPicker = document.querySelector('input')
const rectGroups = []

cav.width = 600
cav.height = 600


class Rectangle {
    constructor(color, x, y) {
        this.color = color
        this.startX = x
        this.startY = y
        this.endX = x
        this.endY = y
    }

    get minX () {
        return Math.min(this.startX, this.endX)
    }

    get minY() {
        return Math.min(this.startY, this.endY)
    }

    get maxX() {
        return Math.max(this.startX, this.endX)
    }

    get maxY() {
        return Math.max(this.startY, this.endY)
    }

    draw() {
        ctx.beginPath()
        // 这里需要注意，canvas画图是永远从左上角开始，如果鼠标按下位置是右下角，向左上角移动，那么鼠标抬起时的位置是比起时位置小的
        // canvas左上角坐标是（0，0），鼠标起始位置（150， 150），鼠标抬起位置（50， 50），这个时候应该给canvas的起时坐标是（50， 50）而不是（150， 150）
        // 所以我们只需要取最小坐标就好了
        ctx.moveTo(this.minX, this.minY)
        ctx.lineTo(this.maxX, this.minY)
        ctx.lineTo(this.maxX, this.maxY)
        ctx.lineTo(this.minX, this.maxY)
        ctx.lineTo(this.minX, this.minY)
        ctx.fillStyle = this.color
        ctx.fill()

        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.lineCap = 'square'
        ctx.stroke()
    }

    
}
cav.onmousedown = (e) => {
    // 创建新的矩形对象
    const rect = new Rectangle(colorPicker.value, e.offsetX, e.offsetY)
    
    const bounding = cav.getBoundingClientRect()
    const mouseX = e.offsetX
    const mouseY = e.offsetY
    // 判断拖动
    const tgt = calculate(e.offsetX, e.offsetY)
    console.log('tgt', tgt);
    if( tgt ) {
        // console.log('拖动');
        const { startX, startY, endX, endY } = tgt
        window.onmousemove = (e) => {
            // const disX = e.offsetX - mouseX
            // const disY = e.offsetY - mouseY
            const disX = e.clientX - bounding.left - mouseX
            const disY = e.clientY - bounding.top - mouseY
            tgt.startX = startX + disX
            tgt.startY = startY + disY
            tgt.endX = endX + disX
            tgt.endY = endY + disY
        }
    } else {
        // console.log('画图');
        // 添加元素的时机非常重要，一定要放在这里
        rectGroups.push(rect)
        window.onmousemove = (e) => {
            rect.endX = e.clientX  - bounding.left
            rect.endY = e.clientY - bounding.top
            draw()
        }
    }
    
    window.onmouseup = () => {
        window.onmousemove = null
        window.onmouseup = null
    }
}


function calculate(x, y) {
    // filter返回所有符合条件的项集成在一个新的数组里面，这些项必然遵循原数组里面的顺序
    // 在这个例子里面，如果画了2个重合的图形，这里取值【0】就永远是最先画的矩形，我们要移动的应该最上层的，所以不能用filter方法
    // 判断鼠标点击的位置是否在已存在的矩形内
    // return rectGroups.filter((item) => {
    //     return item.minX <= x && item.minY <= y && item.maxX >= x && item.maxY >= y
    // })[0]
    for(let i = rectGroups.length -1; i >= 0; i--) {
        if(rectGroups[i].minX <= x && rectGroups[i].minY <= y && rectGroups[i].maxX >= x && rectGroups[i].maxY >= y) {
            return rectGroups[i]
        }
    }
}


function draw () {
    // 每一帧都画一遍，一定要，不然无法拖动
    requestAnimationFrame(draw)
    // 这里一定要清空当前的画布，否则会有重影
    ctx.clearRect(0, 0, cav.width, cav.height)
    for (const rect of rectGroups) {
        rect.draw()
        console.log(0);
    }
}


