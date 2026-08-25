import {Handle, Position} from "@xyflow/react";
import "../styles/CustomNode.css";

/**
 * Custom node  
 * 
 * Handles on left and right of node
 * 
 * Adopted template from ReactFlow documentation (React Flow, 2026a) https://reactflow.dev/api-reference/components/handle
 * 
 * @param data node data - acceptingState and startingState determine className to provide different styling for accepting / starting nodes
 * @param selected node selected boolean
 * @returns custom node
 */
export default function CustomNode({ data,selected }){
    return (
        <div className={`custom-node ${selected ? "selected" : ""} ${data.acceptingState ? "accepting":""} ${data.startingState ? "starting":""}`}>
            {data.label}
        <Handle id = "right" type="source" position={Position.Right}/>
        <Handle id ="left" type="source" position={Position.Left}/>
        </div>
    );

}