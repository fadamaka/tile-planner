var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

//track mouse position on mousemove
var mousePosition;
//track state of mousedown and up
var isMouseDown;

//add listeners
document.addEventListener("mousemove", move, false);
document.addEventListener("mousedown", setDraggable, false);
document.addEventListener("mouseup", setDraggable, false);
document.addEventListener("contextmenu", flipRectangle, false);
document.body.onkeyup = function (e) {
  if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
    spawnNewRectangle(e);
  }
};
const snapRange = 20;
const scale = 2.5;
const tileW = 60 * scale;
const tileH = 40 * scale;
const r2 = 300 * scale;

//make some rectangles
var c1 = new Rectangle(50, 50, tileW, tileH, "grey", "black");
var c2 = new Rectangle(50, tileH + 100, tileW, tileH, "grey", "black");
var c3 = new Rectangle(50, tileH * 2 + 150, tileW, tileH, "grey", "black");
//make a collection of rectangles
var rectangles = [c1, c2, c3];

//main draw method
function draw() {
  //clear canvas
  ctx.clearRect(0, 0, c.width, c.height);
  drawRectangles();
}

function snapAdjust(key) {
  const instersectingRects = rectangles.filter((r) =>
    rectIntersect(rectangles[key], r)
  );
  const rectX = rectangles[key].x;
  const rectY = rectangles[key].y;
  let adjustedX = mousePosition.x;
  let adjustedY = mousePosition.y;
  console.log(
    "intersects",
    instersectingRects.filter(
      (r) => !(r.x === rectangles[key].x && r.y === rectangles[key].y)
    ).length
  );
  if (instersectingRects.length > 1) {
    // console.log(
    //   "x snap range",
    //   instersectingRects.filter(
    //     (r) =>
    //       Math.abs(rectangles[key].x + rectangles[key].w - r.x) < snapRange ||
    //       Math.abs(r.x + r.w - rectangles[key].x) < snapRange
    //   ).length
    // );
    instersectingRects
      .filter((r) => !(r.x === rectangles[key].x && r.y === rectangles[key].y))
      .forEach((r) => {
        if (Math.abs(mousePosition.x + rectangles[key].w - r.x) < snapRange) {
          adjustedX = r.x - rectangles[key].w;
        }
        if (Math.abs(r.x + r.w - mousePosition.x) < snapRange) {
          adjustedX = r.x + r.w;
        }

        if (Math.abs(mousePosition.y + rectangles[key].h - r.y) < snapRange) {
          adjustedY = r.y - rectangles[key].h;
        }
        if (Math.abs(r.y + r.h - mousePosition.y) < snapRange) {
          adjustedY = r.y + r.h;
        }
      });
  }
  rectangles[key].x = adjustedX;
  rectangles[key].y = adjustedY;
}

function spawnNewRectangle(e) {
  rectangles.push(
    new Rectangle(
      mousePosition.x,
      mousePosition.y,
      tileW,
      tileH,
      "grey",
      "black"
    )
  );
  draw();
  drawBigCircle();
}

function flipRectangle(e) {
  getMousePosition(e);
  //no rectangle currently focused check if rectangle is hovered
  for (var i = 0; i < rectangles.length; i++) {
    if (intersects(rectangles[i])) {
      let currentW = rectangles[focused.key].w;
      rectangles[focused.key].w = rectangles[focused.key].h;
      rectangles[focused.key].h = currentW;
      break;
    }
  }
  draw();
  drawBigCircle();
  return false;
}

//draw rectangles
function drawRectangles() {
  for (var i = rectangles.length - 1; i >= 0; i--) {
    rectangles[i].draw();
  }
}

//key track of rectangle focus and focused index
var focused = {
  key: 0,
  state: false,
};

//rectangle Object
function Rectangle(x, y, w, h, fill, stroke) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;

  this.fill = fill;
  this.stroke = stroke;

  this.draw = function () {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = this.fill;
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.strokeStyle = this.stroke;
    ctx.stroke();
  };
}

function move(e) {
  if (!isMouseDown) {
    getMousePosition(e);
    return;
  }
  getMousePosition(e);
  //if any rectangle is focused
  if (focused.state) {
    // rectangles[focused.key].x = mousePosition.x;
    // rectangles[focused.key].y = mousePosition.y;
    snapAdjust(focused.key);
    draw();

    drawBigCircle();
    return;
  }
  //no rectangle currently focused check if rectangle is hovered
  for (var i = 0; i < rectangles.length; i++) {
    if (intersects(rectangles[i])) {
      rectangles.move(i, 0);
      focused.state = true;
      break;
    }
  }
  draw();
  drawBigCircle();
}

//set mousedown state
function setDraggable(e) {
  var t = e.type;
  if (t === "mousedown") {
    isMouseDown = true;
  } else if (t === "mouseup") {
    isMouseDown = false;
    releaseFocus();
  }
}

function releaseFocus() {
  focused.state = false;
}

function getMousePosition(e) {
  var rect = c.getBoundingClientRect();
  mousePosition = {
    x: Math.round(e.x - rect.left),
    y: Math.round(e.y - rect.top),
  };
}

//detects whether the mouse cursor is between x and y relative to the radius specified
function intersects(rectangle) {
  return (
    rectangle.x <= mousePosition.x &&
    mousePosition.x <= rectangle.x + rectangle.w &&
    rectangle.y <= mousePosition.y &&
    mousePosition.y <= rectangle.y + rectangle.h
  );
}

function rectIntersect(currentRect, inspectedRect) {
  return (
    currentRect.x + currentRect.w >= inspectedRect.x &&
    currentRect.x < inspectedRect.x + inspectedRect.w &&
    currentRect.y + currentRect.h >= inspectedRect.y &&
    currentRect.y < inspectedRect.y + inspectedRect.h
  );
}

function drawBigCircle() {
  ctx.beginPath();
  ctx.arc(800, 450, r2 / 2, 0, 2 * Math.PI);
  ctx.stroke();
}

Array.prototype.move = function (old_index, new_index) {
  if (new_index >= this.length) {
    var k = new_index - this.length;
    while (k-- + 1) {
      this.push(undefined);
    }
  }
  this.splice(new_index, 0, this.splice(old_index, 1)[0]);
};
draw();
drawBigCircle();
