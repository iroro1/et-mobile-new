declare module 'react-native-table-component' {
  import { Component } from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  export interface TableProps {
    borderStyle?: ViewStyle;
    children?: React.ReactNode;
  }

  export interface RowProps {
    data: string[];
    style?: ViewStyle;
    textStyle?: TextStyle;
    widthArr?: number[];
  }

  export interface RowsProps {
    data: string[][];
    style?: ViewStyle;
    textStyle?: TextStyle;
    widthArr?: number[];
  }

  export interface TableWrapperProps {
    style?: ViewStyle;
  }

  export interface CellProps {
    data?: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
    width?: number;
  }

  export class Table extends Component<TableProps> {}
  export class Row extends Component<RowProps> {}
  export class Rows extends Component<RowsProps> {}
  export class TableWrapper extends Component<TableWrapperProps> {}
  export class Cell extends Component<CellProps> {}
}
