import {Handle, Position} from "@xyflow/react";
import "../styles/CustomNode.css";

export default function CustomNode({ data,selected }){
    return (
        <div className={`custom-node ${selected ? "selected" : ""} ${data.acceptingState ? "accepting":""} ${data.startingState ? "starting":""}`}>
            {data.label}
        <Handle id = "right" type="source" position={Position.Right}/>
        <Handle id ="left" type="source" position={Position.Left}/>
        <Handle id ="top" type="source" position={Position.Top}/>
        <Handle id= "bottom" type="source" position={Position.Bottom}/>
        </div>
    );

}