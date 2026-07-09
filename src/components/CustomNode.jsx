import {Handle, Position} from "@xyflow/react";
import "../styles/CustomNode.css";

export default function CustomNode({ data }){
    return (
        <div className="custom-node">
            {data.label}
        <Handle type="source" position={Position.Right}/>
        <Handle type="target" position={Position.Left}/>
        </div>
    );

}