declare module 'html2canvas' {
  const html2canvas: any
  export default html2canvas
}

declare module 'jspdf' {
  export class jsPDF {
    constructor(opts?: any)
    addImage(...args: any[]): void
    addPage(...args: any[]): void
    save(filename?: string): void
    text(...args: any[]): void
    rect(...args: any[]): void
    setFontSize(size: number): void
    setTextColor(r: number, g?: number, b?: number): void
    setFillColor(r: number, g?: number, b?: number): void
    internal: { pageSize: { getWidth(): number; getHeight(): number } }
  }
}
