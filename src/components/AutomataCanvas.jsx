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

const initialNodes = [];
const initialEdges = [];


function AutomataCanvasGraph(){
    
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
    const onConnect = useCallback((params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),[],);
    
    const addNode = useCallback(()=> {
        
        setNodes((r)=> {

            const newNode = {
                id: "q0",
                type: "automata",
                position: {
                x: 100,
                y: 100,
                },
                data: {
                label: "q0",
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
                    <button>Regex → NFA</button>
                    <button>NFA → DFA</button>
                    <button onClick={addNode}>Add node</button>
                    <button>Minimise DFA</button>
                    <button>Accepting State</button>
                    <button>Start State</button>
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