import React, { useEffect, useRef } from 'react';
import { Graph } from '@antv/g6';


const GraphDemo = () => {
  const containerRef = useRef(null); // 用来绑定G6的容器
 // 添加节点和边数据
 const data = {
    nodes: [
      {
        id: 'node-1',
        label: '节点1',
        style: { x: 100, y: 100, fill: '#FF5733' }, // 设置不同的颜色
        state: 'active', // 节点状态
      },
      {
        id: 'node-2',
        label: '节点2',
        style: { x: 250, y: 100, fill: '#33FF57' }, // 设置不同的颜色
        state: 'inactive', // 节点状态
      },
      {
        id: 'node-3',
        label: '节点3',
        style: { x: 400, y: 100, fill: '#3357FF' }, // 设置不同的颜色
        state: 'disabled', // 节点状态
      },
      {
        id: 'node-4',
        label: '节点4',
        style: { x: 100, y: 200, fill: '#FFB733' }, // 设置不同的颜色
        state: 'active', // 节点状态
      },
      {
        id: 'node-5',
        label: '节点5',
        style: { x: 250, y: 200, fill: '#33FFB7' }, // 设置不同的颜色
        state: 'inactive', // 节点状态
      },
      {
        id: 'node-6',
        label: '节点6',
        style: { x: 400, y: 200, fill: '#3357FF' }, // 设置不同的颜色
        state: 'disabled', // 节点状态
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        label: '边1',
        style: {
          lineWidth: 2,
          stroke: '#A3B1BF',
          endArrow: true,
        },
      },
      {
        id: 'edge-2',
        source: 'node-2',
        target: 'node-3',
        label: '边2',
        style: {
          lineWidth: 2,
          stroke: '#A3B1BF',
          endArrow: true,
        },
      },
      {
        id: 'edge-3',
        source: 'node-1',
        target: 'node-4',
        label: '边3',
        style: {
          lineWidth: 2,
          stroke: '#A3B1BF',
          endArrow: true,
        },
      },
      {
        id: 'edge-4',
        source: 'node-4',
        target: 'node-5',
        label: '边4',
        style: {
          lineWidth: 2,
          stroke: '#A3B1BF',
          endArrow: true,
        },
      },
      {
        id: 'edge-5',
        source: 'node-5',
        target: 'node-6',
        label: '边5',
        style: {
          lineWidth: 2,
          stroke: '#A3B1BF',
          endArrow: true,
        },
      },
    ],
  };
  
  useEffect(() => {
    // 初始化 G6 图形实例
    const graph = new Graph({
      container: containerRef.current, // 图形容器
      width: containerRef.current.offsetWidth, // 图形宽度
      height: containerRef.current.offsetHeight, // 图形高度
      modes: {
        default: ['drag-node', 'zoom-canvas'], // 可拖拽节点和缩放画布
      },
      layout: {
        type: 'dagre', // 使用 dagre 布局（有向无环图布局）
        rankdir: 'LR', // 从左到右的布局
      },
      data,
      defaultNode: {
        size: [120, 60], // 节点大小
        style: {
          fill: '#9EC9FF', // 默认节点背景颜色
          stroke: '#5B8FF9', // 默认节点边框颜色
        },
        labelCfg: {
          style: {
            fill: '#fff', // 节点标签文字颜色
            fontSize: 14,
          },
        },
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
      defaultEdge: {
        style: {
          stroke: '#A3B1BF', // 边颜色
        },
      },
    });

   

    // 设置不同状态的节点颜色
 
    graph.render(); // 渲染图形

    // graph.getNodes().forEach((node) => {
    //   const model = node.getModel();
    //   const status = model.status;

    //   // 根据节点状态修改颜色
    //   const colorMap = {
    //     active: '#5B8FF9',
    //     inactive: '#B7B7B7',
    //   };

    //   graph.updateItem(node, {
    //     style: {
    //       fill: colorMap[status] || '#9EC9FF',
    //       stroke: '#000',
    //     },
    //   });
    // });

    return () => {
      graph.destroy(); // 清理图形实例
    };
  }, []);

  return (
   
      <div
        ref={containerRef}
        style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}
      ></div>
    
  );
};

export default GraphDemo;
