import { useState, useCallback, useRef } from 'react';
import { ReactFlow, 
        ReactFlowProvider, 
        Background, 
        BackgroundVariant,
        useNodesState,
        useEdgesState, 
        addEdge,
        MarkerType,
        ConnectionMode,
        Panel,
        useReactFlow } from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import "../styles/AutomataCanvas.css";
import { nextId } from '../utilties/GlobalNodeIdGenerator.js';
import { apiConvertToDFA, apiRegexToNFA, apiTestWordOnRegex, apiTestWordOnAutomata, apiMinimiseDFA, apiConvertToString } from '../api/automataApi';
import  CustomNode  from './CustomNode.jsx';
import { SmartFloatingEdge } from "@tisoap/react-flow-smart-edge";
import edgeSymbolValidation from "../validators/edgeSymbolValidation.js"
import regexValidation from '../validators/regexValidation.js';
import filenameValidation from '../validators/filenameValidation.js';
import wordValidation from '../validators/wordValidation.js';
import { validateGraph } from '../validators/graphValidation.js';
import getLayoutedElements from '../utilties/layoutGraph.js';

const initialNodes = [];
const initialEdges = [];

const edgeTypes = { default: SmartFloatingEdge
 };

const nodeTypes = {
    custom : CustomNode
}

function AutomataCanvasGraph(){
    
    const [wordTest, setWordTest] = useState("");
    const [regexString, setRegexString] = useState(""); 
    const [wordAcceptedOnRegex, setWordAcceptedOnRegex] = useState(null);
    const [wordAcceptedOnAutomata, setWordAcceptedOnAutomata] = useState(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [helpPanelToggle, setHelpPanelToggle] = useState(false);
    const inputRef = useRef(null);
    const { screenToFlowPosition } = useReactFlow();
 
    const onConnect = useCallback((params) => {
        try{

        const existingEdge = edges.find( (edge) => edge.source === params.source && edge.target === params.target)

        if(existingEdge){
            const userInput = window.prompt("Edit Symbol", String(existingEdge.label ?? ""))

            const validatedUserInput = edgeSymbolValidation(userInput);

            if(validatedUserInput === null){
                return;
            }

            setEdges((edges) =>
                edges.map((edge) =>
                    edge.id === existingEdge.id ?
            {
                ...edge,
                label: validatedUserInput,
            } : edge

                ));
            setWordAcceptedOnAutomata(null);
            return;
        }

        const userInput = window.prompt("Enter Symbol")
        const validatedUserInput = edgeSymbolValidation(userInput);

        if(validatedUserInput === null){
            return;
        }

        setEdges((edgesSnapshot) => 
            addEdge(
                {...params,
                label:validatedUserInput,
                style: {
                    strokeWidth: 1.5
                },
                labelStyle:{
                    fontFamily: "'Courier New', monospace"
                },
                markerEnd:{type: MarkerType.ArrowClosed, width:15, height: 15}}, 
                edgesSnapshot))
                setWordAcceptedOnAutomata(null);
            }catch(error){
                    window.alert(error.message);
            }}, [setEdges,edges]);
    
    const setStartState = useCallback((event,node)=>{
        setNodes((r)=> 
            r.map((e) => ({
                ...e,
                data: {
                    ...e.data,
                    startingState: e.id === node.id,
                },
            })))
            setWordAcceptedOnAutomata(null);
        },[setNodes]);


    const applyBackendGraph = useCallback(
    (graph) => {
        validateGraph(graph);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        graph.nodes,
        graph.edges,
        'LR',
      );

      const edgesWithArrows = layoutedEdges.map((edge) => ({
        ...edge,
        type: "default",
        sourceHandle: "right",
        targetHandle: "left",
        style: {
            strokeWidth: 1.5
                },
        labelStyle:{
            fontFamily: "'Courier New', monospace"
        },
        markerEnd: {type: MarkerType.ArrowClosed, width:15, height: 15}
    }));
      setWordAcceptedOnAutomata(null);
      setNodes([...layoutedNodes]);
      setEdges([...edgesWithArrows]);
        },
    [setNodes, setEdges],
  );

    const convertToDFA = useCallback (async () => {      
        try{        
        const currentGraph = {
            nodes,
            edges,
        };
        validateGraph(currentGraph);
        const convertedGraph = await apiConvertToDFA(currentGraph)
        applyBackendGraph(convertedGraph);
        } catch (error){
            window.alert(error.message);
        }
    }, [nodes,edges,applyBackendGraph]);

    const convertToString = useCallback (async () =>{

        try{        
        const currentGraph ={
            nodes,
            edges,
        }
        validateGraph(currentGraph);
        const regexStringResponse = await apiConvertToString(currentGraph);
        console.log(regexStringResponse);
        setRegexString(regexStringResponse.regex);
        } catch (error){
            window.alert(error.message);
        }
    },[nodes,edges])

    const convertToNFA = useCallback (async () => {
        try{
        const validatedRegex = regexValidation(regexString);
        const convertedGraph = await apiRegexToNFA(validatedRegex)
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
            }))
            setWordAcceptedOnAutomata(null);
        },[setNodes])

    const addNode = useCallback((e)=> {
        e.preventDefault();
        const position = screenToFlowPosition({x: e.clientX, y: e.clientY})
        setWordAcceptedOnAutomata(null);
        setNodes((r)=> {
            const nodeId = nextId(r);
            const newNode = {
                id: nodeId,
                type: "custom",
                position: {
                    x:position.x - 35,
                    y:position.y -35
                },
                data: {
                label: `q${nodeId}`,
                startingState: false,
                acceptingState: false,
                },
            }
            return [...r,newNode];
        });

        }, [setNodes, screenToFlowPosition]

    );

    const onEdgeDoubleClick = useCallback((event,edgeToAmend) =>{
        event.preventDefault();
        try{
        const userInput = window.prompt("Edit Symbol", String(edgeToAmend.label ?? ""))

        const validatedUserInput = edgeSymbolValidation(userInput);

        if(validatedUserInput === null){
            return;
        }

        setEdges((edges) =>
            edges.map((edge) =>
                edge.id === edgeToAmend.id ?
        {
            ...edge,
            label: validatedUserInput,
        } : edge ));
        setWordAcceptedOnAutomata(null);
    }catch(error){
        window.alert(error.message);
    }},[setEdges])

    const testWordOnAutomata = useCallback(async () => {
        setWordAcceptedOnAutomata(null);
        try{
        const word = wordValidation(wordTest); 
        if(word=== null){
            window.alert("Invalid word! Must consist of A-Z, a-z, 0-9 (no spaces)");
            return;
        }
        const currentGraph = {
            nodes,
            edges,
        };        
        validateGraph(currentGraph);
        const acceptedString = await apiTestWordOnAutomata(currentGraph,word)
        console.log(acceptedString.accepted);
        setWordAcceptedOnAutomata(acceptedString.accepted);
        } catch (error){
            window.alert(error.message);
        }
    }, [nodes,edges,wordTest]);

    const testWordOnRegex = useCallback(async () => {
        setWordAcceptedOnRegex(null);
        try{
        const validatedWord = wordValidation(wordTest);
        const validatedRegex = regexValidation(regexString);
        const acceptedString = await apiTestWordOnRegex(validatedRegex,validatedWord)
        setWordAcceptedOnRegex(acceptedString.accepted);
        } catch (error){
            window.alert(error.message);
        }
    }, [wordTest,regexString]);


    const minimiseDFA = useCallback (async () => {
        try{
        const currentGraph = {
            nodes,
            edges,
        };
        validateGraph(currentGraph);
        const responseGraph = await apiMinimiseDFA(currentGraph);
        applyBackendGraph(responseGraph);
        setWordAcceptedOnAutomata(null);
        } catch (error){
            window.alert(error.message);
        }
    },[nodes,edges,applyBackendGraph]);

    const toggleHelpPanel = useCallback(() =>
        setHelpPanelToggle(r => !r)
   ,[setHelpPanelToggle])

    const closeHelpPanel = useCallback(() =>
        setHelpPanelToggle(false)
    ,[setHelpPanelToggle])

    const downloadFile = useCallback(({data, filename, fileType}) => {
        const blob = new Blob([data], {type: fileType});
        const a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.click()
        a.remove();
    },[])  

    const importJson = useCallback(async (event) => {
        const file = event.target.files?.[0];

        if(!file){
            return;
        }
        try{
        const jsonFile = await file.text();
        const graph = JSON.parse(jsonFile);
        applyBackendGraph(graph);
}
        catch(error){
            window.alert(error.message);
        }finally{
            event.target.value = "";   
        }

    },[applyBackendGraph])

    const downloadJson = useCallback((e)=> {
        e.preventDefault()
        try{
        const userInput = window.prompt("Enter filename");
        const filename = filenameValidation(userInput);

        if(filename === null){
            return;
        }
        const currentGraph = {
            nodes,
            edges,
        };
        downloadFile({
            data: JSON.stringify(currentGraph),
            filename: filename,
            fileType: 'application/json',
        })
    }catch(error){
        window.alert(error.message);
    }},[nodes, edges, downloadFile])

    const clearScreen = useCallback(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
        setRegexString("");
        setWordTest("");
        setWordAcceptedOnAutomata(null);
        setWordAcceptedOnRegex(null);
    },[setNodes,setEdges,setRegexString,setWordTest,setWordAcceptedOnAutomata,setWordAcceptedOnRegex]);

    return(
        <div className="canvas-graph">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDoubleClick={setStartState}
                onNodeContextMenu={setAcceptingState}
                onPaneContextMenu={addNode}
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
                    <button onClick={minimiseDFA}>Minimise DFA</button>
                    <input type="text"
                    value={wordTest}
                    onChange={e => {setWordTest(e.target.value); setWordAcceptedOnRegex(null);setWordAcceptedOnAutomata(null)}}
                    placeholder="Enter Word to test"
                    className="word-input"/>
                    <button onClick={testWordOnAutomata} className={wordAcceptedOnAutomata === true ? "word-test accepted" : wordAcceptedOnAutomata === false ? "word-test rejected" : "word-test"}
                    >{wordAcceptedOnAutomata=== true ? "Accepted!" : wordAcceptedOnAutomata === false ? "Rejected!" : "Test Word On Automata"}</button>
                    <button onClick={testWordOnRegex} className={wordAcceptedOnRegex=== true ? "word-test accepted" : wordAcceptedOnRegex === false ? "word-test rejected" : "word-test"}
                    >{wordAcceptedOnRegex=== true ? "Accepted!" : wordAcceptedOnRegex === false ? "Rejected!" : "Test Word On Regex"}</button>
                    <button onClick={downloadJson}>Download JSON</button>
                    <input type="file" ref={inputRef} accept=".json,application/json" onChange={importJson} hidden></input>
                    <button onClick={() => inputRef.current?.click()}>Import JSON</button>
                    <button onClick={clearScreen}>Clear All</button>
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
                    <p>‣ Right click on screen to add a node</p>
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