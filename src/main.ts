import { Application, Container, Graphics } from "pixi.js";
import * as PIXI from 'pixi.js';
import { convertPixiToSkia, exportToPDF } from "./utils/skiaUtils";

const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
});

// Добавляем view (канвас) на страницу
document.body.appendChild(app.view as HTMLCanvasElement) ;





// Константы и настройки
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const containers: Container[] = [];
let currentContainerIndex = 0;

// === Графика ===

// Создание графического объекта
const createGraphics = (
  type: "ellipse" | "rectangle",
  color: number,
  x: number,
  y: number,
  angle: number,
  scale: number
): Graphics => {
  const g = new Graphics();
  g.beginFill(color);

  if (type === "ellipse") {
    g.drawEllipse(0, 0, Math.random() * 100 + 50, Math.random() * 100 + 50);
  } else {
    g.drawRect(-50, -75, Math.random() * 150 + 50, Math.random() * 150 + 50);
  }

  g.endFill();
  g.position.set(x, y);
  g.angle = angle;
  g.scale.set(scale);
  g.interactive = true;
  g.on("pointerdown", () => console.log("Shape pointerdown!"));
  g.on("pointerup", () => console.log("Shape pointerup!"));

  return g;
};

// Создание контейнера с графикой
const createContainerWithGraphics = (): Container => {
  const container = new Container();
  const subContainer = new Container();

  const g1 = createGraphics("ellipse", 0xff0000, 200, 100, 30, 1);
  const g2 = createGraphics("rectangle", 0x0000ff, 120, 60, 15, 1.5);

  subContainer.addChild(g1, g2);
  container.addChild(subContainer);

  return container;
};

// === Управление контейнерами ===

// Переключение активного контейнера
const switchContainer = (index: number) => {
  app.stage.removeChild(containers[currentContainerIndex]);
  currentContainerIndex = index;
  app.stage.addChild(containers[currentContainerIndex]);
};

// Добавление контейнеров в массив
containers.push(createContainerWithGraphics());
containers.push(createContainerWithGraphics());
app.stage.addChild(containers[currentContainerIndex]);

// === Функции ===

// Генерация случайной фигуры
const generateRandomShape = () => {
  const randomType = Math.random() > 0.5 ? "ellipse" : "rectangle";
  const randomColor = Math.random() * 0xffffff;
  const randomX = Math.random() * CANVAS_WIDTH;
  const randomY = Math.random() * CANVAS_HEIGHT;
  const randomAngle = Math.random() * 360;
  const randomScale = Math.random() * 2 + 0.5;

  const shape = createGraphics(
    randomType,
    randomColor,
    randomX,
    randomY,
    randomAngle,
    randomScale
  );

  containers[currentContainerIndex].addChild(shape);
};

// Очистка фигур
const clearShapes = () => {
  containers[currentContainerIndex].removeChildren();
};

// Экспорт в PDF
const exportSceneToPDF = () => {
  const skiaCanvas = convertPixiToSkia(containers[currentContainerIndex]);
  exportToPDF(skiaCanvas);
};

// === UI ===

// Создание кнопки
const createButton = (text: string, onClick: () => void): HTMLButtonElement => {
  const button = document.createElement("button");
  button.innerText = text;
  button.onclick = onClick;
  document.body.appendChild(button);
  return button;
};

// Кнопки управления
createButton("Генерировать случайную фигуру", generateRandomShape);
createButton("Очистить фигуры", clearShapes);
createButton("Экспорт в PDF", exportSceneToPDF);
createButton("Предыдущий контейнер", () => {
  const prevIndex =
    (currentContainerIndex - 1 + containers.length) % containers.length;
  switchContainer(prevIndex);
});
createButton("Следующий контейнер", () => {
  const nextIndex = (currentContainerIndex + 1) % containers.length;
  switchContainer(nextIndex);
});
