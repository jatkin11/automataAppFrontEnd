//@vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import CustomNode from "../../components/CustomNode";
import {describe,test,expect,afterEach} from "vitest";
import { cleanup, render, screen} from "@testing-library/react"
import { ReactFlowProvider } from "@xyflow/react";


const renderNode = (data) => {
    return render(
        <ReactFlowProvider>
        <CustomNode data = {data} selected = {false} />
        </ReactFlowProvider>
    )};

    afterEach(()=>cleanup());

    describe("CustomNode testing", () => {


        test("showsCorrectLabel" , ()=> {
            renderNode({
                label: "q0",
                startingState: false,
                acceptingState: false,
            })

            expect(screen.getByText("q0")).toBeInTheDocument();
            afterEach(()=>cleanup());
        });


        test("nodeIsStartingClass" , ()=> {
            renderNode({
                label: "q0",
                startingState: true,
                acceptingState: false,
            })

            expect(screen.getByText("q0")).toHaveClass("starting");
        });


        test("nodeIsAcceptingClass" , ()=> {
            renderNode({
                label: "q0",
                startingState: false,
                acceptingState: true,
            })

            expect(screen.getByText("q0")).toHaveClass("accepting");


        });


        test("nodeIsAccepingAndStartingClass" , ()=> {
            renderNode({
                label: "q0",
                startingState: true,
                acceptingState: true,
            })

            expect(screen.getByText("q0")).toHaveClass("starting");
            expect(screen.getByText("q0")).toHaveClass("accepting");

        });



     });



