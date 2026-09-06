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

/**
 * maps edge type "default" to the Tisoap Library 'SmartFloatingEdge'
 * 
 * Tisoap library (Puccinelli, 2026) See report references.
 * 
 */
const edgeTypes = { default: SmartFloatingEdge
 };


 /**
  * maps the node type "custom" to the CustomNode from CustomNode.jsx
  */
const nodeTypes = {
    custom : CustomNode
}


/**
 * AutomataCanvasGraph
 * 
 * Handles:
 * - nodes and edges
 * - adding/editing nodes and transitions
 * - setting starting/accepting states
 * - regex input
 * - word input
 * - back-end conversion, minimisation and word-testing
 * - JSON import and export
 * - Dagre graph layout
 * - help panel 
 * 
 * @returns rendered React Flow canvas component (React Flow, 2026a)
 */
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
 
    /**
     * Creates an edge between one node and another by adding and edge to 'edges' state
     * 
     * Process:
     * - if an edge already exists between the same source-target pair in the edges state when drawing a connection
     *      - prompts the user to edit the existing transition symbols
     *      - validates the new comma-separated symbols using edgeSymbolValidation
     *      - updates the existing edge label
     *      - returns
     * - else prompts the user to enter a new transition label for the new drawn connection:
     *      - validates the the new symbols using edgeSymbolValidation
     *      - adds new edge to edges state with the new label and styling (including arrow head in direction of connection)
     * 
     * @param params the default react flow connection parameters containing source and target IDs (React Flow, 2026b)
     */
    const onConnect = useCallback((params) => {
        try{

        const existingEdge = edges.find( (edge) => edge.source === params.source && edge.target === params.target)

        if(existingEdge){
            const userInput = window.prompt("Edit Symbol", String(existingEdge.label ?? ""))

            const validatedUserInput = edgeSymbolValidation(userInput);

            if(validatedUserInput === null){  //returns early if prompt is null i.e. cancelled
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
            setWordAcceptedOnAutomata(null);  //resets the word-test-on-automata result display, as the graph has been updated 
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
                setWordAcceptedOnAutomata(null); //resets the word-test-on-automata result display, as the graph has been updated 
            }catch(error){
                    window.alert(error.message);
            }}, [setEdges,edges]);


    /**
     * Sets the 'startingState' of a node being passed to true and sets all other nodes' 'startingState' to false
     * 
     * ensures always only 1 starting state
     */
    const setStartState = useCallback((event,node)=>{
        setNodes((r)=> 
            r.map((e) => ({
                ...e,
                data: {
                    ...e.data,
                    startingState: e.id === node.id,
                },
            })))
            setWordAcceptedOnAutomata(null); //resets the word-test-on-automata result display, as the graph has been updated 
        },[setNodes]);


    /**
     * Applies a graph to the display by updating the nodes and edges states to the nodes/edges from the passed graph
     * 
     * Also:
     * - validates the passed graph
     * - provides the nodes with new positions automataically generated by the getLayoutedElements from the Dagre Library (Dagre, 2025) 
     * - adds edge styling (+ arrow heads)
     * 
     * @param graph graph to be applied (containing arrays of nodes and edges)
     * 
     */
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
      setWordAcceptedOnAutomata(null); //resets the word-test-on-automata result display, as the graph has been updated 
      setNodes([...layoutedNodes]);
      setEdges([...edgesWithArrows]);
        },
    [setNodes, setEdges],
  );


    /**
     * converts the current graph into a DFA (NFA->DFA)
     * 
     * process:
     * - creates graph from current node/edges states
     * - validates graph
     * - passes graph to API function for conversion in back-end
     * - applies the converted graph using applyBackendGraph
     * - catches any errors and displays them to user in an alert
     */
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


    /**
     * converts the current graph into a regex string (Automata->Regex)
     * 
     * process:
     * - creates graph from current node/edges states
     * - validates graph
     * - passes graph to API function for conversion in back-end
     * - updates the regexString state with the converted regex string
     * - catches any errors and displays them to user in an alert
     */
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

    /**
     * converts the user-inputted regex string into an NFA (Regex->NFA)
     * 
     * process:
     * - validates the regex string
     * - passes the validated regex to API function for conversion in back-end
     * - applies the converted graph using applyBackendGraph
     * - catches any errors and displays them to user in an alert
     */
    const convertToNFA = useCallback (async () => {
        try{
        const validatedRegex = regexValidation(regexString);
        const convertedGraph = await apiRegexToNFA(validatedRegex)
        applyBackendGraph(convertedGraph);
        } catch (error){
            window.alert(error.message);
        }
    }, [regexString,applyBackendGraph]);


    /**
     * Toggles the 'acceptingState' of the passed node
     * 
     * @param event react flow event (right-click will be passed in)
     * @param node node to be toggled, that was right-clicked
     */
    const setAcceptingState = useCallback((event,node)=>{
        event.preventDefault(); //stops the right-click from opening default menu
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
            setWordAcceptedOnAutomata(null); //resets the word-test-on-automata result display, as the graph has been updated 
        },[setNodes])


    /**
     * Adds a node to the nodes state with a position of the right-click
     * 
     * Process:
     * - gets React Flow position using React Flow's screenToFlowPosition (translates browser window location to ReactFlow component location) (React Flow, 2026d)
     * - creates new nodes with new generated node ID from GlobalNodeIdGenerator
     * - sets the label to q + "new id"
     * - startingState and acceptingState false by default
     * - adds new node to nodes state
     * 
     * @param e click event
     */
    const addNode = useCallback((e)=> {
        e.preventDefault();  //stops the right-click from opening default menu
        const position = screenToFlowPosition({x: e.clientX, y: e.clientY})
        setWordAcceptedOnAutomata(null);
        setNodes((r)=> {
            const nodeId = nextId(r);
            const newNode = {
                id: nodeId,
                type: "custom",
                position: {
                    x:position.x - 35, //node size is 70, so offset of 35 centres the node on the right-click position
                    y:position.y -35  //same offset 
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

    /**
     *  When an edge is double clicked prompts the user to edit the transition symbols
     * - validates the new transitions symbols using edgeSymbolValidation
     * - returns early if input is null i.e. cancelled
     * - updates the edge label with the validated transition symbols
     * 
     * @param event mouse double click event
     * @param edgeToAmend clicked edge
     */
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
        setWordAcceptedOnAutomata(null); //resets the word-test-on-automata result display, as the graph has been updated 
    }catch(error){
        window.alert(error.message);
    }},[setEdges])



    /**
     * Tests user-inputted word on the drawn automata
     * 
     * Process:
     * - resets automata-word-test display state
     * - validates the word
     * - creates a graph from the current nodes and edges states
     * - validates the graph
     * - passes the word and graph to the API function and awaits the response
     * - updates the wordAcceptedOnAutomata state to the boolean result of the response
     * - catches any errors and displays them to the user as an alert
     */
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

    /**
     * Tests user-inputted word on a user-inputted regex
     * 
     * Process:
     * - resets regex-word-test display state
     * - validates the word
     * - validates the regex
     * - passes the word and regex to the API function and awaits the response
     * - updates the wordAcceptedOnRegex state to the boolean result of the response
     * - catches any errors and displays them to the user as an alert
     */
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


    /**
     * Turns the current graph into a minimised DFA
     * 
     * Process:
     * - creates graph from current nodes/edges states
     * - validates graph
     * - passes graph to API function and awaits response
     * - applies the returned graph response
     * - resets wordAcceptedOnAutoamta
     * - catches any errors and displays them to the user as an alert
     * 
     */
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


    /**
     * Toggles the Help Panel
     * 
     * - toggles helpPanelToggle state 
     */
    const toggleHelpPanel = useCallback(() =>
        setHelpPanelToggle(r => !r)
   ,[setHelpPanelToggle])


   /**
    * Closes the help panel
    * 
    * - changes helpPanelToggle state to false
    */
    const closeHelpPanel = useCallback(() =>
        setHelpPanelToggle(false)
    ,[setHelpPanelToggle])


    /**
     * Downloads a file of the passed data, filename and filetype
     * 
     * Adapted from the MDN web docs on Blobs (MDN Web Docs, 2019)
     * 
     * Process:
     * - creates blob of data and file type
     * - creates an element in the DOM
     * - sets the download filename
     * - creatse a link for the blob and sets it to the created element
     * - clicks the link to download (file downloads in browser)
     * - removes the created element
     * @param data data to be passed in
     * @param filename filename
     * @param fileType MIME filetype
     */
    const downloadFile = useCallback(({data, filename, fileType}) => {
        const blob = new Blob([data], {type: fileType});
        const a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.click()
        a.remove();
    },[])  

    /**
     * Imports a JSON file and displays the parsed graph
     * 
     * Adapted from the MDN File API docs (MDN Web Docs, 2023)
     * 
     * Process:
     * - gets the first file from the file input
     * - returns early if no file
     * - gets the file text
     * - uses Javascripts JSON.parse to parse the text into a graph
     * - applies the graph
     * - catches any errors and displays to the user an an alert
     * - finally resets the file input 
     */
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

    /**
     * Downloads a JSON of the curernt graph
     * 
     * Process:
     * - prompts the user for a filename
     * - validates/normalises the filename using filenameValidation
     * - returns early if filename is null i.e. user cancelled prompt
     * - creates graph from current nodes/edges states
     * - passes the JSON of the current graph, serialised by the javascript JSON function, 
     * the normalised filename, and MIME filetype (JSON) into the downloadFile function
     * - catches an error and displays to the user as an alert
     */
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

    /**
     * Clears the screen and resets all the states
     */
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

/**
 * Puts the AutomataCanvasGraph in a ReactFlowProvider (React Flow, 2026f)
 *  
 * @returns AutomataCanvasGraph in a ReactFlowProvider
 */
export default function AutomataCanvas(){
    return(
        <ReactFlowProvider>
            <AutomataCanvasGraph/>
        </ReactFlowProvider>
    )
}