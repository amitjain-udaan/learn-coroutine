import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';

type DrawingTool = 'pen' | 'line' | 'rectangle' | 'ellipse' | 'eraser';
type DrawingPoint = { x: number; y: number };

@Component({
  selector: 'app-drawing-overlay',
  standalone: true,
  imports: [ButtonModule, FormsModule, SliderModule],
  template: `
    <canvas
      #drawingCanvas
      class="drawing-canvas"
      [class.drawing-enabled]="isDrawingEnabled"
      (pointerdown)="startDrawing($event)"
      (pointermove)="continueDrawing($event)"
      (pointerup)="finishDrawing($event)"
      (pointercancel)="finishDrawing($event)"
      (pointerleave)="finishDrawing($event)"
    ></canvas>

    <aside class="drawing-toolbar" [class.expanded]="isPanelOpen" aria-label="Drawing tools">
      <button
        pButton
        type="button"
        icon="pi pi-pencil"
        rounded
        [severity]="isDrawingEnabled ? 'primary' : 'secondary'"
        [attr.aria-pressed]="isDrawingEnabled"
        aria-label="Toggle drawing mode"
        (click)="toggleDrawing()"
      ></button>

      @if (isPanelOpen) {
        <div class="tool-panel">
          <div class="tool-group" aria-label="Drawing shapes">
            @for (tool of tools; track tool.value) {
              <button
                pButton
                type="button"
                [icon]="tool.icon"
                rounded
                text
                [class.selected]="selectedTool === tool.value"
                [attr.aria-label]="tool.label"
                [attr.aria-pressed]="selectedTool === tool.value"
                (click)="selectTool(tool.value)"
              ></button>
            }
          </div>

          <div class="swatches" aria-label="Drawing colors">
            @for (color of colors; track color) {
              <button
                type="button"
                class="swatch"
                [class.selected]="selectedColor === color"
                [style.background]="color"
                [attr.aria-label]="'Use color ' + color"
                [attr.aria-pressed]="selectedColor === color"
                (click)="selectColor(color)"
              ></button>
            }
          </div>

          <div class="size-control">
            <i class="pi pi-minus" aria-hidden="true"></i>
            <p-slider
              [(ngModel)]="strokeSize"
              orientation="vertical"
              [min]="2"
              [max]="22"
              [step]="1"
              ariaLabel="Stroke size"
            />
            <i class="pi pi-plus" aria-hidden="true"></i>
          </div>

          <div class="actions">
            <button
              pButton
              type="button"
              icon="pi pi-undo"
              rounded
              text
              severity="secondary"
              aria-label="Undo last stroke"
              [disabled]="history.length === 0"
              (click)="undo()"
            ></button>
            <button
              pButton
              type="button"
              icon="pi pi-trash"
              rounded
              text
              severity="danger"
              aria-label="Clear drawing"
              (click)="clear()"
            ></button>
          </div>
        </div>
      }
    </aside>
  `,
  styles: [`
    :host {
      position: fixed;
      inset: 0;
      z-index: 1000;
      pointer-events: none;
    }

    .drawing-canvas {
      width: 100vw;
      height: 100vh;
      display: block;
      pointer-events: none;
      touch-action: none;
    }

    .drawing-canvas.drawing-enabled {
      cursor: crosshair;
      pointer-events: auto;
    }

    .drawing-toolbar {
      position: fixed;
      top: 50%;
      right: 1rem;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: .75rem;
      pointer-events: auto;
    }

    .tool-panel {
      width: 4rem;
      padding: .5rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #ffffff;
      box-shadow: 0 1rem 2.5rem rgba(17, 24, 39, .16);
      display: grid;
      gap: .75rem;
    }

    .tool-group,
    .actions {
      display: grid;
      gap: .25rem;
      justify-items: center;
    }

    .swatches {
      display: grid;
      grid-template-columns: repeat(2, 1.25rem);
      justify-content: center;
      gap: .4rem;
    }

    .swatch {
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid transparent;
      border-radius: 50%;
      box-shadow: inset 0 0 0 1px rgba(17, 24, 39, .18);
      cursor: pointer;
    }

    .swatch.selected {
      border-color: #111827;
    }

    .size-control {
      min-height: 8.5rem;
      display: grid;
      justify-items: center;
      gap: .5rem;
      color: #4b5563;
    }

    :host ::ng-deep .size-control .p-slider {
      height: 6rem;
    }

    :host ::ng-deep .size-control .p-slider.p-slider-vertical {
      width: .25rem;
    }

    :host ::ng-deep .p-button.selected {
      background: #eef2ff;
      color: #4338ca;
    }

    @media (max-width: 760px) {
      .drawing-toolbar {
        right: .75rem;
      }

      .tool-panel {
        width: 3.75rem;
      }
    }
  `]
})
export class DrawingOverlayComponent implements AfterViewInit {
  @ViewChild('drawingCanvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  protected isPanelOpen = false;
  protected isDrawingEnabled = false;
  protected selectedTool: DrawingTool = 'pen';
  protected selectedColor = '#2563eb';
  protected strokeSize = 5;
  protected history: string[] = [];

  protected readonly tools: ReadonlyArray<{ value: DrawingTool; icon: string; label: string }> = [
    { value: 'pen', icon: 'pi pi-pencil', label: 'Free draw' },
    { value: 'line', icon: 'pi pi-minus', label: 'Draw line' },
    { value: 'rectangle', icon: 'pi pi-stop', label: 'Draw rectangle' },
    { value: 'ellipse', icon: 'pi pi-circle', label: 'Draw ellipse' },
    { value: 'eraser', icon: 'pi pi-eraser', label: 'Erase' }
  ];

  protected readonly colors = ['#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#111827', '#ffffff'];

  private context!: CanvasRenderingContext2D;
  private startPoint: DrawingPoint | null = null;
  private lastPoint: DrawingPoint | null = null;
  private shapeSnapshot: ImageData | null = null;
  private readonly maxHistorySize = 30;

  ngAfterViewInit(): void {
    const context = this.canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas drawing context is unavailable.');
    }

    this.context = context;
    this.resizeCanvas();
  }

  @HostListener('window:resize')
  protected resizeCanvas(): void {
    const snapshot = this.canvas.width > 0 && this.canvas.height > 0 ? this.canvas.toDataURL() : null;
    const ratio = window.devicePixelRatio || 1;

    this.canvas.width = Math.floor(window.innerWidth * ratio);
    this.canvas.height = Math.floor(window.innerHeight * ratio);

    if (snapshot) {
      const image = new Image();
      image.onload = () => {
        this.context.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
      };
      image.src = snapshot;
    }
  }

  protected toggleDrawing(): void {
    this.isDrawingEnabled = !this.isDrawingEnabled;
    this.isPanelOpen = this.isDrawingEnabled;
  }

  protected selectTool(tool: DrawingTool): void {
    this.selectedTool = tool;
    this.isDrawingEnabled = true;
  }

  protected selectColor(color: string): void {
    this.selectedColor = color;
    this.isDrawingEnabled = true;

    if (this.selectedTool === 'eraser') {
      this.selectedTool = 'pen';
    }
  }

  protected startDrawing(event: PointerEvent): void {
    if (!this.isDrawingEnabled) {
      return;
    }

    event.preventDefault();
    this.canvas.setPointerCapture(event.pointerId);
    this.pushHistory();

    const point = this.pointFromEvent(event);
    this.startPoint = point;
    this.lastPoint = point;
    this.shapeSnapshot = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

    if (this.selectedTool === 'pen' || this.selectedTool === 'eraser') {
      this.configureStroke();
      this.context.beginPath();
      this.context.moveTo(point.x, point.y);
    }
  }

  protected continueDrawing(event: PointerEvent): void {
    if (!this.startPoint || !this.lastPoint || !this.isDrawingEnabled) {
      return;
    }

    event.preventDefault();
    const nextPoint = this.pointFromEvent(event);

    if (this.selectedTool === 'pen' || this.selectedTool === 'eraser') {
      this.drawFreehand(nextPoint);
      this.lastPoint = nextPoint;
      return;
    }

    this.drawShapePreview(nextPoint);
  }

  protected finishDrawing(event: PointerEvent): void {
    if (!this.startPoint) {
      return;
    }

    event.preventDefault();

    if (this.selectedTool !== 'pen' && this.selectedTool !== 'eraser') {
      this.drawShapePreview(this.pointFromEvent(event));
    }

    this.context.closePath();

    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId);
    }

    this.startPoint = null;
    this.lastPoint = null;
    this.shapeSnapshot = null;
  }

  protected undo(): void {
    const previous = this.history.pop();

    if (!previous) {
      return;
    }

    this.restoreImage(previous);
  }

  protected clear(): void {
    this.pushHistory();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawFreehand(point: DrawingPoint): void {
    this.configureStroke();
    this.context.lineTo(point.x, point.y);
    this.context.stroke();
  }

  private drawShapePreview(endPoint: DrawingPoint): void {
    if (!this.startPoint || !this.shapeSnapshot) {
      return;
    }

    this.context.putImageData(this.shapeSnapshot, 0, 0);
    this.configureStroke();
    this.context.beginPath();

    const width = endPoint.x - this.startPoint.x;
    const height = endPoint.y - this.startPoint.y;

    if (this.selectedTool === 'line') {
      this.context.moveTo(this.startPoint.x, this.startPoint.y);
      this.context.lineTo(endPoint.x, endPoint.y);
    }

    if (this.selectedTool === 'rectangle') {
      this.context.rect(this.startPoint.x, this.startPoint.y, width, height);
    }

    if (this.selectedTool === 'ellipse') {
      this.context.ellipse(
        this.startPoint.x + width / 2,
        this.startPoint.y + height / 2,
        Math.abs(width / 2),
        Math.abs(height / 2),
        0,
        0,
        Math.PI * 2
      );
    }

    this.context.stroke();
  }

  private configureStroke(): void {
    const ratio = window.devicePixelRatio || 1;

    this.context.globalCompositeOperation = this.selectedTool === 'eraser' ? 'destination-out' : 'source-over';
    this.context.strokeStyle = this.selectedTool === 'eraser' ? 'rgba(0, 0, 0, 1)' : this.selectedColor;
    this.context.lineWidth = this.strokeSize * ratio;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
  }

  private pointFromEvent(event: PointerEvent): DrawingPoint {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    return {
      x: (event.clientX - rect.left) * ratio,
      y: (event.clientY - rect.top) * ratio
    };
  }

  private pushHistory(): void {
    this.history.push(this.canvas.toDataURL());

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  private restoreImage(dataUrl: string): void {
    const image = new Image();

    image.onload = () => {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
    };

    image.src = dataUrl;
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
}
