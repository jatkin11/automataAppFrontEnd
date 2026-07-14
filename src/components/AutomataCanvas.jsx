import { useState, useCallback } from 'react';
import { ReactFlow, 
        ReactFlowProvider, 
        Background, 
        BackgroundVariant,
        useNodesState,
        useEdgesState, 
        addEdge,
        MarkerType,
        ConnectionMode,
        Panel } from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import "../styles/AutomataCanvas.css";
import { nextId } from './GlobalNodeIdGenerator';
import { apiConvertToDFA, apiRegexToNFA, apiTestWordOnRegex, apiTestWordOnAutomata, apiMinimiseDFA, apiConvertToString } from '../api/automataApi';
import  CustomNode  from './CustomNode.jsx';
import dagre from '@dagrejs/dagre';
import { SmartFloatingEdge } from "@tisoap/react-flow-smart-edge";

const initialNodes = [];
const initialEdges = [];

const nodeWidth = 172;
const nodeHeight = 36;
 
const getLayoutedElements = (nodes, edges, direction) => {
  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });
 
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
 
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
 
  dagre.layout(dagreGraph);
 
  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
 
    return newNode;
  });
 
  return { nodes: newNodes, edges };
};

const edgeTypes = { default: SmartFloatingEdge };

const nodeTypes = {
    custom : CustomNode
}

function AutomataCanvasGraph(){
    
    const [wordTest, setWordTest] = useState("");
    //const [transitionSymbols, setTransitionSymbols] = useState("");
    const [regexString, setRegexString] = useState("");   //need to use this to get the symbol from user input to add to the edge labels to pass to the back end
    const [wordAcceptedOnRegex, setWordAcceptedOnRegex] = useState(null);
    const [wordAcceptedOnAutomata, setWordAcceptedOnAutomata] = useState(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
    //NEED TO ADD VALIDATION - NEED TO MAKE SURE ONLY ONE SELF LOOP PER NODE
    const onConnect = useCallback((params) => setEdges((edgesSnapshot) => addEdge({...params,label:"a",markerEnd:{type: MarkerType.ArrowClosed, width:25, height: 25}}, edgesSnapshot)),[setEdges],);
    
    const setStartState = useCallback((event,node)=>{
        setNodes((r)=> 
            r.map((e) => ({
                ...e,
                data: {
                    ...e.data,
                    startingState: e.id === node.id,
                },
            })))},[setNodes]);


    const applyBackendGraph = useCallback(
    (graph) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        graph.nodes,
        graph.edges,
        'LR',
      );

      const edgesWithArrows = layoutedEdges.map((edge) => ({
        ...edge,
        type: "default",
        markerEnd: {type: MarkerType.ArrowClosed, width:25, height: 25}
    }));
      setWordAcceptedOnAutomata(null);
      setNodes([...layoutedNodes]);
      setEdges([...edgesWithArrows]);
    },
    [setNodes, setEdges],
  );

    const convertToDFA = useCallback (async () => {
        const currentGraph = {
            nodes,
            edges,
        };
        const convertedGraph = await apiConvertToDFA(currentGraph)
        applyBackendGraph(convertedGraph);
    }, [nodes,edges,applyBackendGraph]);

    const convertToString = useCallback (async () =>{
        const currentGraph ={
            nodes,
            edges,
        }
        const regexString = await apiConvertToString(currentGraph);
        console.log(regexString);
    },[nodes,edges])

    //NEED TO ADD REGEX STRING VALIDATION, COULD POSSIBLY DO IT IN BACK END
    const convertToNFA = useCallback (async () => {

        const convertedGraph = await apiRegexToNFA(regexString)
        applyBackendGraph(convertedGraph);
    }, [regexString,applyBackendGraph]);


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
                        acceptingState: !e.data.acceptingState,
                    }}
            }))},[setNodes])

    const addNode = useCallback(()=> {
        setWordAcceptedOnAutomata(null);
        setNodes((r)=> {
            const nodeId = nextId(r);
            const newNode = {
                id: nodeId,
                type: "custom",
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

    //NEED TO ADD VALIDATION HERE
    const testWordOnAutomata = useCallback(async () => {
        setWordAcceptedOnAutomata(null);
        const currentGraph = {
            nodes,
            edges,
        };
        const acceptedString = await apiTestWordOnAutomata(currentGraph,wordTest)
        console.log(acceptedString.accepted);
        setWordAcceptedOnAutomata(acceptedString.accepted);
    }, [nodes,edges,wordTest]);

    //NEED TO ADD VALIDATION HERE
    const testWordOnRegex = useCallback(async () => {
        setWordAcceptedOnRegex(null);
        const acceptedString = await apiTestWordOnRegex(regexString,wordTest)
        console.log(acceptedString.accepted);
        setWordAcceptedOnRegex(acceptedString.accepted);
    }, [wordTest,regexString]);

    //NEED TO ADD VALIDATION HERE
    const minimiseDFA = useCallback (async () => {
        const currentGraph = {
            nodes,
            edges,
        };
        const responseGraph = await apiMinimiseDFA(currentGraph);
        applyBackendGraph(responseGraph);
        console.log(responseGraph)
    },[nodes,edges,applyBackendGraph]);


    return(
        <div className="canvas-graph">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDoubleClick={setStartState}
                onNodeContextMenu={setAcceptingState}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                onConnect={onConnect}
                edgeTypes={edgeTypes}
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
                    onChange={e => {setRegexString(e.target.value); setWordAcceptedOnRegex(null); setWordAcceptedOnAutomata(null)}}
                    placeholder="Enter Regex here"
                    className="regex-input"/>
                    <button onClick={convertToNFA}>Regex → NFA</button>
                    <button onClick={convertToDFA}>NFA → DFA</button>
                    <button onClick={convertToString}>Automata → Regex</button>       
                    <button onClick={addNode}>Add Node</button>
                    <button onClick={minimiseDFA}>Minimise DFA</button>
                    <input type="text"
                    onChange={e => {setWordTest(e.target.value); setWordAcceptedOnRegex(null);setWordAcceptedOnAutomata(null)}}
                    placeholder="Enter Word to test here"
                    className="regex-input"/>
                    <button onClick={testWordOnAutomata} className={wordAcceptedOnAutomata === true ? "word-test accepted" : wordAcceptedOnAutomata === false ? "word-test rejected" : "word-test"}
                    >{wordAcceptedOnAutomata=== true ? "Accepted!" : wordAcceptedOnAutomata === false ? "Rejected!" : "Test Word On Automata"}</button>
                    <button onClick={testWordOnRegex} className={wordAcceptedOnRegex=== true ? "word-test accepted" : wordAcceptedOnRegex === false ? "word-test rejected" : "word-test"}
                    >{wordAcceptedOnRegex=== true ? "Accepted!" : wordAcceptedOnRegex === false ? "Rejected!" : "Test Word On Regex"}</button>
                
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