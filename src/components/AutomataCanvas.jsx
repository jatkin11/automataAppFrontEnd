import { useState, useCallback } from 'react';
import { ReactFlow, 
        ReactFlowProvider, 
        Background, 
        BackgroundVariant,
        useNodesState,
        useEdgesState, 
        addEdge,
        Panel } from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import "../styles/AutomataCanvas.css";
import { nextId } from './GlobalNodeIdGenerator';

const initialNodes = [];
const initialEdges = [];


function AutomataCanvasGraph(){
    
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
    const onConnect = useCallback((params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),[],);
    
    const setStartState = useCallback((event,node)=>{
        setNodes((r)=> 
            r.map((e) => ({
                ...e,
                data: {
                    ...e.data,
                    start: e.id === node.id,
                },
            })))},[setNodes]);


    const setAcceptingState = useCallback((event,node)=>{
        setNodes((r)=> 
            r.map((e) => {
                if(e.id !== node.id){
                    return e;
                }
                return{
                    ...e,
                    data: {
                        ...e.data,
                        start: !e.data.accepting,
                    }}
            }))},[setNodes])

    const addNode = useCallback(()=> {
        
        setNodes((r)=> {
            const nodeId = nextId(r);
            const newNode = {
                id: nodeId,
                type: "default",
                position: {
                x: 100 + r.length * 200,
                y: 100,
                },
                data: {
                label: nodeId,
                start: true,
                accepting: false,
                },
            }
            return [...r,newNode];
        });

        }, [setNodes]

    );

    return(
        <div className="canvas-graph">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDoubleClick={setStartState}
                onNodeContextMenu={setAcceptingState}
                onConnect={onConnect}
                fitView>
            <Background color="#a8a49c" variant={BackgroundVariant.Dots} />

            <Panel position="top-left">
                <div className="app-title">
                    <h1>AutomataApp</h1>
                </div>
            </Panel>

            <Panel position="bottom-left">
                <div className="tool-panel">
                    <input type="text"
                    placeholder="Enter Regex here"
                    className="regex-input"/>
                    <button>Regex → NFA</button>
                    <button>NFA → DFA</button>
                    <button onClick={addNode}>Add Node</button>
                    <button>Minimise DFA</button>
                    <button>Delete Tool</button>
                </div>
            </Panel>

            </ReactFlow>
        </div>
    );
}


export default function AutomataCanvas(){
    return(
        <ReactFlowProvider>
            <AutomataCanvasGraph/>
        </ReactFlowProvider>
    )
}