import { findIndex, max, min, flatten, zip,toString, toNumber, floor} from 'lodash';
import { Chart } from '@antv/g2';
import DataSet from '@antv/data-set';
import {
  VisualizationBase,
  IKeyValues,
  OutputMode,
  IDataset,
} from "@qn-pandora/visualization-sdk";
import { getItemColor } from './untils';
import { IColors, DefaultColors, Type } from './constants';

import "./styles.less";

export default class VisualizationStore extends VisualizationBase {
  radar: Chart | null = null;

  getInitialDataParams() {
    return {
      outputMode: OutputMode.JsonRows,
      count: 10000
    };
  }

  getLabel(value:any,colors:IColors){
  const color=getItemColor(value,colors)
    return {
      content:value,
      rotate:0,
      autoRotate:false,
      style:{
       fill:color
       }
      }
  }

  getBucketData(dataset:IDataset,metrics:string[],bucket:string,precision:number){
     const {rows,fields}=dataset
     const bucketFieldIndex=findIndex(fields,(field)=>field.name===bucket)
     return rows.map((row)=>{
       const result={
        [`bucket-${bucket}`]:row[bucketFieldIndex],
       }
       metrics.forEach((metric)=>{
        const metricFieldIndex=findIndex(fields,(field)=>field.name===metric)
        const value=toNumber(row[metricFieldIndex])
        result[metric]= isNaN(value)? row[metricFieldIndex]:floor(value,precision?precision:2) as any
       })
       return result
     })
  }

  getMetricData(dataset:IDataset,metrics:string[],bucket:string,precision:number){
    const {rows,fields}=dataset
    const zipData = zip(...rows)
    const bucketFieldIndex=findIndex(fields,(field)=>field.name===bucket)
    return metrics.map((metric)=>{
    const metricFieldIndex=findIndex(fields,(field)=>field.name===metric)
     const result={metric} as any
     const bucketFieldData=zipData[bucketFieldIndex]
     const metricFieldData=zipData[metricFieldIndex]
     if(metricFieldData.length>0&&bucketFieldData.length>0){
      bucketFieldData.forEach((field:any,index)=>{
        const value=toNumber(metricFieldData[index])
        result[toString(field)]= isNaN(value)?metricFieldData[index]:floor(value,precision?precision:2) as any
       })
     }
     return result
    })
 }

 getMetricDatas(dataset: IDataset, config: IKeyValues,precision:number){
  const { rows,fields } = dataset;
  const { metrics,type,maxIndicators} = config;
  const metricData=rows.map(line => {
    const data=[] as any
    metrics.forEach((metric:string) => {
     const metricIndex=findIndex(fields,(field)=>field.name===metric)
     const value=toNumber(line[metricIndex]||0)
     data.push(isNaN(value)?line[metricIndex]||0:floor(value,precision?precision:2) as any)
    });
     return data
   })
   return flatten(type===Type.BUCKET? metricData.slice(0,maxIndicators?maxIndicators:10):metricData)
 }

  updateView(dataset: IDataset, config: IKeyValues) {
    const { rows,fields } = dataset;
    const { DataView } = DataSet;
    const { metrics,bucket,maxIndicators,indicatorOffset,
      indicatorRotatet,indicatorFontSize,showGrid,showScale,
      gridShap,stroke,lineWidth,legend_position,lineColors,
      lineSize,showColor,type,maxFields,showNumber,precision,dataMax,dataMin} = config;
    if (!metrics||!metrics.length ||!rows.length||!bucket) {
      return;
    }
    const zipData = zip(...rows)
    const bucketFieldIndex=findIndex(fields,(field)=>field.name===bucket)
    const realData=type===Type.BUCKET? this.getBucketData(dataset,metrics,bucket,precision):this.getMetricData(dataset,metrics,bucket,precision)
    const metricData=this.getMetricDatas(dataset,config,precision)
    const maxValue =dataMax?dataMax: max(metricData)
    const minValue =dataMin?dataMin: min(metricData)
    const dv = new DataView().source(realData.slice(0,maxIndicators?maxIndicators:10));
    dv.transform({
      type: 'fold',
      fields: type===Type.BUCKET? metrics&&metrics.length>0?metrics:[]:zipData[bucketFieldIndex]&&zipData[bucketFieldIndex].length>0?zipData[bucketFieldIndex].slice(0,maxFields||maxFields===0?maxFields:10):[], // 展开字段集
      key: 'user', // key字段
      value: 'data', // value字段
    });
    this.element.innerHTML = "";
    this.radar = new Chart({
      container: this.element,
      autoFit: true,
      height: 500,
    });
    this.radar.data(dv.rows);
    this.radar.scale('data', {
      max:maxValue,
      min:minValue,
      minLimit:maxValue,
      maxLimit:minValue
    });
    this.radar.coordinate('polar', {
      radius: 0.8,
    });
    this.radar.tooltip({
      shared: true,
      enterable:true,
      showCrosshairs: true,
      crosshairs: {
        line: {
          style: {
            lineDash: [4, 4],
            stroke: '#333'
          }
        },
      }
    });
    this.radar.axis(type===Type.BUCKET? `bucket-${bucket}`:'metric', {
      line: null,
      tickLine: null,
      label:{
        offset:indicatorOffset?indicatorOffset:0,
         rotate:indicatorRotatet?indicatorRotatet:0,
        style:{
         fontSize:indicatorFontSize?indicatorFontSize:12
        }
      },
      grid: showGrid&&showGrid==='true'?{
        line: {
          style: {
            lineDash: null,
          },
        },
      }:null,
    });
    this.radar.axis('data', {
      line: null,
      tickLine: null,
      label:{
        formatter:(text:string)=>{
          return !showScale||showScale==='false'?'':text
        }
      },
      grid: {
        line: {
          type: gridShap?gridShap:'line',
          style: {
            lineDash: null,
            stroke:stroke?stroke:'rgba(0, 0, 0, 0.65)',
            lineWidth:lineWidth?lineWidth:1
          },
        },
      },
    });
    this.radar.legend({ 
      position: legend_position?legend_position:'right', // 设置图例的显示位置
    });
     
    this.radar
    .line()
    .position(type===Type.BUCKET? `bucket-${bucket}*data`:`metric*data` ) 
    .color('user',(field:string)=>{
      const fieldIndex=findIndex(type===Type.BUCKET? metrics:zipData[bucketFieldIndex],(item)=>item===field)
      return lineColors&&lineColors.length>fieldIndex?lineColors.split(',')[fieldIndex]:DefaultColors[fieldIndex%DefaultColors.length]
    })
    .size(lineSize?lineSize:2) 
    .label('value');
    this.radar.point()
    .position(type===Type.BUCKET? `bucket-${bucket}*data`:`metric*data` ) 
    .color('user',(field)=>{
      const fieldIndex=findIndex(type===Type.BUCKET? metrics:zipData[bucketFieldIndex],(item)=>item===field)
      return lineColors&&lineColors.length>fieldIndex?lineColors.split(',')[fieldIndex]:DefaultColors[fieldIndex%DefaultColors.length]
    })
    .shape('circle')
    .size(4)
    .style({
    stroke: '#fff',
    lineWidth: 1,
    fillOpacity: 1})
    .label('data', (value)=>{  return !showNumber||showNumber==='false'?null: this.getLabel(value,config.colors)});
    if(showColor==='true'){
     this.radar.area().position(type===Type.BUCKET? `bucket-${bucket}*data`:`metric*data` )  .color('user',(field)=>{
      const fieldIndex=findIndex(type===Type.BUCKET? metrics:zipData[bucketFieldIndex],(item)=>item===field)
      return lineColors&&lineColors.length>fieldIndex?lineColors.split(',')[fieldIndex]:DefaultColors[fieldIndex%DefaultColors.length]
     });
    }
    this.radar.render();
  }
}
