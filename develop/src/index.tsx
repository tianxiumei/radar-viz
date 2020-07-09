import { findIndex, max, min } from 'lodash';
import DataSet from '@antv/data-set';
import { Chart } from '@antv/g2';
import {
  VisualizationBase,
  IKeyValues,
  OutputMode,
  IDataset,
} from "@qn-pandora/visualization-sdk";
import { getItemColor } from './untils';
import { IColors } from './constants';

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
      style:{
       fill:color
       }
      }
  }

  getData(dataset:IDataset,metric:string,bucket:string){
     const {rows,fields}=dataset
     const metricFieldIndex=findIndex(fields,(field)=>field.name===metric)
     const bucketFieldIndex=findIndex(fields,(field)=>field.name===bucket)
     return rows.map((row)=>{
       return {
        [bucket]:row[bucketFieldIndex],
        [metric]:row[metricFieldIndex]
       }
     })
  }


  updateView(dataset: IDataset, config: IKeyValues) {
    const { DataView } = DataSet;
    const { rows,fields } = dataset;
    console.log(dataset)
    const { metric,bucket,maxIndicators} = config;
    if (!metric ||  !rows.length||!bucket) {
      return;
    }
    const realData=this.getData(dataset,metric,bucket)
    const metricIndex=findIndex(fields,(field)=>field.name===metric)
    const metricData=rows.map(line => line[metricIndex]||0)
    const dataMax = max(metricData)
    const dataMin = min(metricData)
    const dv = new DataView().source(realData.slice(0,maxIndicators?maxIndicators:10));
    dv.transform({
      type: 'fold',
      fields: [metric], // 展开字段集
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
      min: dataMin,
      max: dataMax,
    });
    this.radar.coordinate('polar', {
      radius: 0.8,
    });
    this.radar.tooltip({
      shared: true,
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
    this.radar.axis(bucket, {
      line: null,
      tickLine: null,
      grid: {
        line: {
          style: {
            lineDash: null,
          },
        },
      },
    });
    this.radar.axis('data', {
      line: null,
      tickLine: null,
      grid: {
        line: {
          type: 'line',
          style: {
            lineDash: null,
          },
        },
      },
    });

    this.radar.line().position(`${bucket}*data`).color('user').size(2).label('value');
    this.radar.point().position(`${bucket}*data`).color('user').shape('circle').size(4).style({
    stroke: '#fff',
    lineWidth: 1,
    fillOpacity: 1,
  }).label('data', (value)=>{  return this.getLabel(value,config.colors)});
    this.radar.area().position(`${bucket}*data`).color('user');
    this.radar.render();
  }
}
