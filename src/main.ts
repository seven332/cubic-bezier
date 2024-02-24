import { Point, Type, classify, computeQlQm } from "./loop-blinn";
import { Bezier } from "bezier-js";

let p0 = { x: 100, y: 100 };
let p1 = { x: 300, y: 100 };
let p2 = { x: 100, y: 700 };
let p3 = { x: 700, y: 700 };

const boardSvg = document.querySelector<HTMLElement>("#board")!;
const extensionPath = document.querySelector<SVGPathElement>(
  "#board > #extension"
)!;
const linesPath = document.querySelector<SVGPathElement>("#board > #lines")!;
const bezierPath = document.querySelector<SVGPathElement>("#board > #bezier")!;
const p0Circle = document.querySelector<SVGPathElement>("#board > #p0")!;
const p1Circle = document.querySelector<SVGPathElement>("#board > #p1")!;
const p2Circle = document.querySelector<SVGPathElement>("#board > #p2")!;
const p3Circle = document.querySelector<SVGPathElement>("#board > #p3")!;
const textSpan = document.querySelector<HTMLSpanElement>("#text")!;

function updateBorad() {
  const bezier = new Bezier(p0, p1, p2, p3);
  const left = bezier.split(-2).left;
  const right = bezier.split(3).right;
  extensionPath.setAttribute(
    "d",
    `M ${left.point(0).x} ${left.point(0).y} C ${left.point(1).x} ${
      left.point(1).y
    } ${left.point(2).x} ${left.point(2).y} ${left.point(3).x} ${
      left.point(3).y
    } M ${right.point(0).x} ${right.point(0).y} C ${right.point(1).x} ${
      right.point(1).y
    } ${right.point(2).x} ${right.point(2).y} ${right.point(3).x} ${
      right.point(3).y
    }`
  );

  linesPath.setAttribute(
    "d",
    `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} M ${p0.x} ${p0.y} L ${p2.x} ${p2.y} M ${p0.x} ${p0.y} L ${p3.x} ${p3.y} M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} M ${p1.x} ${p1.y} L ${p3.x} ${p3.y} M ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`
  );
  bezierPath.setAttribute(
    "d",
    `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`
  );
  p0Circle.setAttribute("cx", `${p0.x}`);
  p0Circle.setAttribute("cy", `${p0.y}`);
  p1Circle.setAttribute("cx", `${p1.x}`);
  p1Circle.setAttribute("cy", `${p1.y}`);
  p2Circle.setAttribute("cx", `${p2.x}`);
  p2Circle.setAttribute("cy", `${p2.y}`);
  p3Circle.setAttribute("cx", `${p3.x}`);
  p3Circle.setAttribute("cy", `${p3.y}`);
}

function updateText() {
  const classification = classify(p0, p1, p2, p3);
  textSpan.innerHTML =
    `p0: ${p0.x}, ${p0.y}<br/>` + //
    `p1: ${p1.x}, ${p1.y}<br/>` + //
    `p2: ${p2.x}, ${p2.y}<br/>` + //
    `p3: ${p3.x}, ${p3.y}<br/>` + //
    `classification: ${classification.type}<br/>` + //
    `d1: ${classification.d1}<br/>` + //
    `d2: ${classification.d2}<br/>` + //
    `d3: ${classification.d3}<br/>`;
  if (classification.type == Type.kLoop) {
    const qlqm = computeQlQm(classification);
    textSpan.innerHTML += `ql: ${qlqm[0]}<br/>qm: ${qlqm[1]}<br/>`;
  }
}

function update() {
  updateBorad();
  updateText();
}

function toPoint(event: MouseEvent): Point {
  return { x: event.clientX - 7, y: event.clientY - 7 };
}

function makeDraggable() {
  function isNear(p: Point, event: MouseEvent) {
    const r = 8;
    const e = toPoint(event);
    return p.x - r <= e.x && e.x <= p.x + r && p.y - r <= e.y && e.y <= p.y + r;
  }

  let target: Point | undefined;
  let down = { x: 0, y: 0 };
  let start = { x: 0, y: 0 };

  boardSvg.addEventListener("mousedown", (event: MouseEvent) => {
    for (const p of [p0, p1, p2, p3]) {
      if (isNear(p, event)) {
        target = p;
        break;
      }
    }
    if (target) {
      down = toPoint(event);
      start.x = target.x;
      start.y = target.y;
    }
  });
  boardSvg.addEventListener("mouseup", () => {
    target = undefined;
  });
  boardSvg.addEventListener("mousemove", (event: MouseEvent) => {
    if (target) {
      const move = toPoint(event);
      target.x = start.x + (move.x - down.x);
      target.y = start.y + (move.y - down.y);
      update();
    }
  });
}

update();
makeDraggable();
