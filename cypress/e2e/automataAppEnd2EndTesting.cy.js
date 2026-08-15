describe("End-to-End testing:", () => {


beforeEach( () => { cy.visit("https://automata.help")} );


    it("correctlyAddsNodeToCanvas", ()=>{
        cy.get(".canvas-graph").rightclick();
        cy.get(".custom-node").should("have.length.at.least",1)
    })


    it("correctlyAddsAcceptingStateToRightClickedNode", ()=>{
        cy.get(".canvas-graph").rightclick();
        cy.get(".custom-node").rightclick();
        cy.get(".custom-node.accepting").should("have.length",1)
    })

    it("correctlyAddsStartingStateToDoubleClickedNode", ()=>{
        cy.get(".canvas-graph").rightclick();
        cy.get(".custom-node").dblclick();
        cy.get(".custom-node.starting").should("have.length",1)
    })


    it("correctlyOpensHelpPanel", ()=>{
        cy.contains("button","?").click();
        cy.get(".help-panel").should("be.visible")

    })

    
    it("correctlyClosesHelpPanel", ()=>{
        cy.contains("button","?").click();
        cy.get(".help-menu").contains("button","x").click();
        cy.get(".help-menu").should("not.exist")
    })

    
    it("correctlyConvertsABCregexToNFA", ()=>{
        cy.get(".regex-input").type("abc");
        cy.contains("button", "Regex → NFA").click();
        cy.get(".react-flow__edge").contains("a").should("exist");
        cy.get(".react-flow__edge").contains("b").should("exist");
        cy.get(".react-flow__edge").contains("c").should("exist");
        cy.get(".custom-node").contains("q0").should("exist");
        cy.get(".custom-node").contains("q1").should("exist");
        cy.get(".custom-node").contains("q2").should("exist");
        cy.get(".custom-node").contains("q3").should("exist");
        cy.get(".custom-node").should("have.length",4)
    })


    it("correctlyConvertsSimpleNFAtoDFA", ()=>{
        cy.get(".canvas-graph").rightclick(300,300);
        cy.get(".custom-node").contains("q0").dblclick();
        cy.get(".canvas-graph").rightclick(600,600);
        cy.get(".custom-node").contains("q1").rightclick();

        cy.window().then((window) => { cy.stub(window,"prompt").returns("a")});

        cy.contains(".custom-node","q0").find('[data-handleid="right"]').trigger("mousedown", {button: 0, force: true});
        cy.contains(".custom-node","q1").find('[data-handleid="left"]').trigger("mousemove", {force: true}).trigger("mouseup", {force: true});
        cy.get(".tool-panel").contains("button", "NFA → DFA").click();
        cy.get(".custom-node").should("have.length",3)
    })

    
    it("correctlyConvertsNFAtoRegex", ()=>{
        cy.get(".canvas-graph").rightclick(300,300);
        cy.get(".custom-node").contains("q0").dblclick();
        cy.get(".canvas-graph").rightclick(600,600);
        cy.get(".custom-node").contains("q1").rightclick();

        cy.window().then((window) => { cy.stub(window,"prompt").returns("a")});

        cy.contains(".custom-node","q0").find('[data-handleid="right"]').trigger("mousedown", {button: 0, force: true});
        cy.contains(".custom-node","q1").find('[data-handleid="left"]').trigger("mousemove", {force: true}).trigger("mouseup", {force: true});

        cy.get(".tool-panel").contains("button", "Automata → Regex").click();
        cy.get(".regex-input").should("have.value","a");

    })


    it("correctlyMinimisesDFA", ()=>{
        cy.get(".canvas-graph").rightclick(300,300);
        cy.get(".custom-node").contains("q0").dblclick();
        cy.get(".canvas-graph").rightclick(600,600);
        cy.get(".custom-node").contains("q1").rightclick();

        cy.window().then((window) => { cy.stub(window,"prompt").returns("a")});

        cy.contains(".custom-node","q0").find('[data-handleid="right"]').trigger("mousedown", {button: 0, force: true});
        cy.contains(".custom-node","q1").find('[data-handleid="left"]').trigger("mousemove", {force: true}).trigger("mouseup", {force: true});
        cy.get(".tool-panel").contains("button", "Minimise DFA").click();
        cy.get(".custom-node").contains("{{{q0}},q3}").should("exist");
        cy.get(".custom-node").contains("{{{q1},q3}}").should("exist");
        cy.get(".custom-node").contains("∅").should("exist");
        cy.get(".custom-node").should("have.length",3)
    })



    it("correctlyReturnsTrueForTrueAutomataWordTest", ()=>{
        cy.get(".regex-input").type("abc");
        cy.get(".tool-panel").contains("button", "Regex → NFA").click();
        cy.get(".word-input").type("abc");
        cy.contains("button", "Test Word On Automata").click();
        cy.contains("button", "Accepted!").should("be.visible");
    })


    it("correctlyReturnsTrueForTrueRegexWordTest", ()=>{
        cy.get(".regex-input").type("abc");
        cy.get(".word-input").type("abc");
        cy.contains("button", "Test Word On Regex").click();
        cy.contains("button", "Accepted!").should("be.visible");
    })


    it("correctlyImportsJSON", ()=>{
        cy.contains("button", "Import JSON").click();
        cy.get('input[type="file"').selectFile("cypress/fixtures/test.json",{force: true})
        cy.get(".custom-node").contains("q0").should("exist");
        cy.get(".custom-node").contains("q1").should("exist");
        cy.get(".react-flow__edge").contains("a").should("exist");
        cy.get(".custom-node").should("have.length",2);
    })


    it("correctlyExportsJSON", ()=>{
        cy.get(".canvas-graph").rightclick(300,300);
        cy.window().then((window) => { cy.stub(window,"prompt").returns("test")});
        cy.contains("button", "Download JSON").click();
        cy.readFile("cypress/downloads/test.json").should("exist");

    })


    it("correctlyClearsScreen", ()=>{
        cy.get(".canvas-graph").rightclick();
        cy.contains("button", "Clear All").click();
        cy.get(".custom-node").should("not.exist");
    })

});