import { FieldDataItem, IField } from "@qn-pandora/visualization-sdk";

export const DefaultSplits = [
    {
      number: 30,
      color: '#1C7BDC',
    },
    {
      number: 60,
      color: '#42526e',
    },
    {
      number: 100,
      color: '#FF0077',
    },
  ]

  export const DefaultColors = [
    "#1989fa",
    "#00bcd4",
    "#7087e4",
    "#96cf79",
    "#cddc39",
    "#ffbb32",
    "#ff9472",
    "#c490da",
    "#4fc3f7",
    "#8be6b1",
    "#f7ea74",
    "#f4aaa0",
    "#f971a0",
    "#ef5350",
    "#FF8A65",
    "#FFCE3D",
    "#3DBD7D",
    "#3DB8C1",
    "#91A7FF",
    "#DA77F2",
    "#FAA2C1",
    "#7a869a",
    "#7a869b",
    "#42526e",
    "#ebecf0",
    "#232c3b",
    "#b3bac5",
    "#8d9199",
    "#c1c7d0"
  ];
  

 export interface IDataset{
    rows:FieldDataItem
    fields:IField[]
  }
  
  export interface ISplitter{
    number:number
    color:string
  }
  
  export interface IColors{
    max:number
    min:number
    splitters:ISplitter[]
  }

  export enum Type{
    BUCKET='bucket',
    METRIC='metric'
  }