import { useState } from 'react';
import { ReactFlow, 
        ReactFlowProvider, 
        Background, 
        BackgroundVariant,
        Panel } from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import "../styles/AutomataCanvas.css";



function AutomataCanvasGraph(){
    return(
        <div className="canvas-graph">
            <ReactFlow>
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
                    <button>Add node</button>
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