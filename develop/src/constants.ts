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