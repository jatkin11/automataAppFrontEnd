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
            <Background color="#ccc" variant={BackgroundVariant.Dots} />

            <Panel position="top-left">
                <div className="app-title">
                    <h1>AutomataApp</h1>
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