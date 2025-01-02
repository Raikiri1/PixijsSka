import * as PIXI from "pixi.js";
import * as SkiaCanvas from "skia-canvas";
const { Canvas } = SkiaCanvas;
import { PDFDocument } from "pdf-lib";

/**
 * Конвертирует Pixi.Container в Skia.Canvas
 */
// Функция для конвертации PixiJS контейнера в Skia Canvas
export const convertPixiToSkia = (container: PIXI.Container): SkiaCanvas.Canvas => {
    const skiaCanvas = new Canvas(800, 600); // Создание холста Skia
    const context = skiaCanvas.getContext('2d') as unknown as  CanvasRenderingContext2D;  // Получаем контекст для рисования

  const drawObject = (
    object: PIXI.DisplayObject,
    context: CanvasRenderingContext2D
  ) => {
    if (object instanceof PIXI.Graphics) {
      const graphicsData = object.geometry.graphicsData;
      const transform = object.worldTransform;

      context.save();
      context.setTransform(
        transform.a,
        transform.b,
        transform.c,
        transform.d,
        transform.tx,
        transform.ty
      );

      graphicsData.forEach((data) => {
        const { shape } = data;

        if (shape.type === PIXI.SHAPES.RECT) {
          const { x, y, width, height } = shape;
          const fillColor = data.fillStyle?.color || 0x000000;
          context.fillStyle = `#${fillColor.toString(16).padStart(6, "0")}`;
          context.fillRect(x, y, width, height);
        } else if (shape.type === PIXI.SHAPES.ELIP) {
          const { x, y, width, height } = shape;
          const fillColor = data.fillStyle?.color || 0x000000;
          context.fillStyle = `#${fillColor.toString(16).padStart(6, "0")}`;
          context.beginPath();
          context.ellipse(x, y, width, height, 0, 0, 2 * Math.PI);
          context.fill();
        }
      });

      context.restore();
    }

    if (object instanceof PIXI.Container) {
      object.children.forEach((child) => drawObject(child, context));
    }
  };

  drawObject(container, context);

  return skiaCanvas;
};

export const exportToPDF = async (canvas: SkiaCanvas.Canvas) => {
  // Создаем новый PDF
  const pdfDoc = await PDFDocument.create();

  // Добавляем страницу
  const page = pdfDoc.addPage([800, 600]);

  // Получаем контекст страницы для рисования
  // const pdfCtx = page.getContext();

  // Рисуем канвас Skia на PDF
  const imgBytes = canvas.toBuffer("png");
  const img = await pdfDoc.embedPng(await imgBytes);

  // Добавляем изображение на страницу
  page.drawImage(img, { x: 0, y: 0, width: 800, height: 600 });

  // Сохраняем PDF
  const pdfBytes = await pdfDoc.save();

  // Скачиваем PDF файл
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([pdfBytes], { type: "application/pdf" })
  );
  link.download = "export.pdf";
  link.click();
};
