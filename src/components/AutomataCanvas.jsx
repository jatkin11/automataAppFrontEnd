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
import edgeSymbolValidation from "../validators/edgeSymbolValidation.js"
import regexValidation from '../validators/regexValidation.js';

const initialNodes = [];
const initialEdges = [];

const nodeWidth = 70;
const nodeHeight = 70;
 
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

const edgeTypes = { default: SmartFloatingEdge
 };

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
    const [helpPanelToggle, setHelpPanelToggle] = useState(false);
 
    //NEED TO ADD VALIDATION - NEED TO MAKE SURE ONLY ONE SELF LOOP PER NODE
    const onConnect = useCallback((params) => {
        const userInput = window.prompt("Enter Symbol") //NEED TO ADD SYMBOL VALIDATION HERE (inc comma serparate values + trimmed)

        const validatedUserInput = edgeSymbolValidation(userInput);

        if(validatedUserInput == null){
            return null;
        }

        setEdges((edgesSnapshot) => 
            addEdge(
                {...params,
                label:validatedUserInput,
                markerEnd:{type: MarkerType.ArrowClosed, width:25, height: 25}}, 
                edgesSnapshot))},
                [setEdges]);
    
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
        try{
        const convertedGraph = await apiConvertToDFA(currentGraph)
        applyBackendGraph(convertedGraph);
        } catch (error){
            window.alert(error.message);
        }
    }, [nodes,edges,applyBackendGraph]);

    const convertToString = useCallback (async () =>{
        const currentGraph ={
            nodes,
            edges,
        }
        try{
        const regexStringResponse = await apiConvertToString(currentGraph);
        console.log(regexStringResponse);
        setRegexString(regexStringResponse.regex);
        } catch (error){
            window.alert(error.message);
        }
    },[nodes,edges])

    //NEED TO ADD REGEX STRING VALIDATION, COULD POSSIBLY DO IT IN BACK END
    const convertToNFA = useCallback (async () => {
        if(!regexValidation(regexString)){
            window.alert("Invalid Regex! Must consist of A-Z, a-z, 0-9, '()', 'ε', '∅', '|', '*'")
            return;
        }
        try{
        const convertedGraph = await apiRegexToNFA(regexString)
        applyBackendGraph(convertedGraph);
        } catch (error){
            window.alert(error.message);
        }
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
                label: `q${nodeId}`,
                startingState: false,
                acceptingState: false,
                },
            }
            return [...r,newNode];
        });

        }, [setNodes]

    );

    const onEdgeDoubleClick = useCallback((event,edgeToAmend) =>{
        event.preventDefault();

        const userInput = window.prompt("Edit Symbol", String(edgeToAmend.label ?? ""))

        const validatedUserInput = edgeSymbolValidation(userInput);

        if(validatedUserInput == null){
            return null;
        }

        setEdges((edges) =>
            edges.map((edge) =>
                edge.id === edgeToAmend.id ?
        {
            ...edge,
            label: validatedUserInput,
        } : edge

            )
        );
    },[setEdges])

    //NEED TO ADD VALIDATION HERE
    const testWordOnAutomata = useCallback(async () => {
        setWordAcceptedOnAutomata(null);
        const currentGraph = {
            nodes,
            edges,
        };
        try{
        const acceptedString = await apiTestWordOnAutomata(currentGraph,wordTest)
        console.log(acceptedString.accepted);
        setWordAcceptedOnAutomata(acceptedString.accepted);
        } catch (error){
            window.alert(error.message);
        }
    }, [nodes,edges,wordTest]);

    //NEED TO ADD VALIDATION HERE
    const testWordOnRegex = useCallback(async () => {
        setWordAcceptedOnRegex(null);
        if(!regexValidation(regexString)){
            window.alert("Invalid Regex! Must consist of A-Z, a-z, 0-9, '()','ε','∅','|', '*'")
            return;
        }
        try{
        const acceptedString = await apiTestWordOnRegex(regexString,wordTest)
        console.log(acceptedString.accepted);
        setWordAcceptedOnRegex(acceptedString.accepted);
        } catch (error){
            window.alert(error.message);
        }
    }, [wordTest,regexString]);

    //NEED TO ADD VALIDATION HERE
    const minimiseDFA = useCallback (async () => {
        const currentGraph = {
            nodes,
            edges,
        };
        try{
        const responseGraph = await apiMinimiseDFA(currentGraph);
        applyBackendGraph(responseGraph);
        console.log(responseGraph)
        } catch (error){
            window.alert(error.message);
        }
    },[nodes,edges,applyBackendGraph]);

    const toggleHelpPanel = useCallback(() =>
        setHelpPanelToggle(r => !r)
   )

    const closeHelpPanel = useCallback(() =>
        setHelpPanelToggle(false)
    )

    const downloadFile = useCallback(({data, fileName, fileType}) => {
        const blob = new Blob([data], {type: fileType});
        const a = document.createElement('a');
        a.download = fileName;
        a.href = window.URL.createObjectURL(blob);
        a.click()
        a.remove();
    }
)
 
    const downloadJson = useCallback((e)=> {
        e.preventDefault()
        const userInput = window.prompt("Enter filename");
        const currentGraph = {
            nodes,
            edges,
        };
        downloadFile({
            data: JSON.stringify(currentGraph),
            fileName: userInput,
            fileType: 'text/json',
        })
    })

    return(
        <div className="canvas-graph">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDoubleClick={setStartState}
                onNodeContextMenu={setAcceptingState}
                onEdgeDoubleClick={onEdgeDoubleClick}
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
                    value={regexString}
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
                    <button onClick={downloadJson}>Download JSON</button>
                </div>
            </Panel>

            <Panel position="top-right">
                <div className="help-panel">
                    <button onClick={toggleHelpPanel}>?</button>
                </div>

            </Panel>


            {helpPanelToggle && (
            <Panel position="top-center">
                <div className="help-menu">
                    <h2>
                        HELP
                    </h2>
                    <button onClick={closeHelpPanel}>x</button>
                    <p>‣ Right click a node to make an 'accepting' state</p>
                    <p>‣ Double click a node to make it a 'starting' state</p>
                    <p>‣ Double click a transition to edit the symbol</p>
                    <p>‣ Delete node/transition by selecting and pressing 'del'</p>
                    <p></p>
                </div>
            </Panel>
            )}

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