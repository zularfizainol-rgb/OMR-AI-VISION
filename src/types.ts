export type Option = 'A' | 'B' | 'C' | 'D' | 'E' | '-';
export type AnswerStatus = Option | 'BLANK' | 'ERROR';

export interface Calibration {
  xStart: number;
  colSpacing: number;
  yStart: number;
  rowSpacing: number;
  sensitivity: number;
}

export interface Point {
  x: number;
  y: number;
}
