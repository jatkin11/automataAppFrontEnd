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
import { apiConvertToDFA, apiRegexToNFA } from '../api/automataApi';

const initialNodes = [];
const initialEdges = [];


function AutomataCanvasGraph(){
    
    const [transitionSymbols, setTransitionSymbols] = useState(""); //need to use this to get the symbol from user input to add to the edge labels to pass to the back end
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
    const onConnect = useCallback((params) => setEdges((edgesSnapshot) => addEdge({...params,label:"a",}, edgesSnapshot)),[],);
    
    const setStartState = useCallback((event,node)=>{
        setNodes((r)=> 
            r.map((e) => ({
                ...e,
                data: {
                    ...e.data,
                    startingState: e.id === node.id,
                },
            })))},[setNodes]);


    const applyBackendGraph = useCallback((graph) => {
      setNodes(graph.nodes);
      setEdges(graph.edges);
    },
    [setNodes, setEdges]
    );

    const convertToDFA = useCallback (async () => {
        const currentGraph = {
            nodes,
            edges,
        };
        const convertedGraph = await apiConvertToDFA(currentGraph)
        applyBackendGraph(convertedGraph);
    }, [nodes,edges,applyBackendGraph]);


    const convertToNFA = useCallback (async () => {

        const convertedGraph = await apiRegexToNFA("ab*cd*ef*")
        applyBackendGraph(convertedGraph);
    }, [applyBackendGraph]);


    const setAcceptingState = useCallback((event,node)=>{
        event.preventDefault();
        setNodes((r)=> 
            r.map((e) => {
                if(e.id !== node.id){
                    return e;
                }
                return{
                    ...e,
                    data: {
                        ...e.data,
                        acceptingState: !e.data.accepting,
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
                startingState: false,
                acceptingState: false,
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
                    <button onClick={convertToNFA}>Regex → NFA</button>
                    <button onClick={convertToDFA}>NFA → DFA</button>
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