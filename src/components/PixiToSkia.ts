import * as PIXI from "pixi.js";
import { Canvas } from "skia-canvas";
import { PDFDocument } from "pdf-lib";

export async function convertPixiContainerToSkia(container: PIXI.Container) {
  const canvas = new Canvas(800, 600);
  const ctx = canvas.getContext("2d");

  container.children.forEach((child) => {
    if (child instanceof PIXI.Graphics) {
      // Преобразование графических объектов
      const { x, y, rotation } = child;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      child.geometry.graphicsData.forEach(
        (graphic: { shape: any; fillStyle: { toString: (arg0: number) => any } }) => {
          const shape = graphic.shape;
          ctx.beginPath();
          if (shape.type === PIXI.SHAPES.RECT) {
            ctx.rect(shape.x, shape.y, shape.width, shape.height);
          } else if (shape.type === PIXI.Ellipse) {
            ctx.ellipse(shape.x, shape.y, shape.width / 2, shape.height / 2, 0, 0, 2 * Math.PI);
          }
          ctx.fillStyle = `#${graphic.fillStyle.toString(16)}`;
          ctx.fill();
        }
      );
      ctx.restore();
    }
  });

  // Получаем изображение с канваса
  const imgBytes = await canvas.toBuffer("png"); // Используем await для получения самого буфера

  // Создаем PDF-документ
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([800, 600]);

  // Вставляем изображение в PDF
  const img = await pdfDoc.embedPng(imgBytes); // Теперь передаем буфер, а не промис
  page.drawImage(img, { x: 0, y: 0, width: 800, height: 600 });

  // Сохраняем PDF
  const pdfBytes = await pdfDoc.save();
  require("fs").writeFileSync("output.pdf", pdfBytes);

  console.log("PDF exported");
}
