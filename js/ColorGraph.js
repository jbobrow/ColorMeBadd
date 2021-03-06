/**
 * Created by aghassaei on 4/7/15.
 */


function ColorGraph(viewType, graphType, isAdmin, nodeId, isConsensus) {
    if (graphType === undefined || viewType === undefined || isAdmin === undefined) {
        console.warn("not enough args to init ColorGraph");
        return;
    }
    this.sampleColors = d3.scale.category20();
    this.viewType = viewType;
    this.graphType = graphType;
    this.isAdmin = isAdmin;
    if (!this.isAdmin) {
        this.localGraph = new D3Graph("#localView", this.sampleColors);
        this.localNodes = [];
        this.localLinks = [];
        this.nodeId = nodeId;
    } else {
        this.isConsensus = isConsensus;
    }
    this.isSolved = false;
    this.d3Graph = new D3Graph("#globalView", this.sampleColors);
    this.nodes = [];
    this.links = [];
}

ColorGraph.prototype.setNodes = function(nodes){
    this.nodes = nodes;
    if (!this.isAdmin && this.links.length > 0 && this.localNodes.length == 0) this._createLocalGraphNodesLinks(nodes, this.links);
};

ColorGraph.prototype.setLinks = function(links){
    this.links = links;
    if (!this.isAdmin && this.nodes.length > 0 && this.localNodes.length == 0) this._createLocalGraphNodesLinks(this.nodes, links);
};

ColorGraph.prototype._createLocalGraphNodesLinks = function(globalNodes, globalLinks){
    var index;
    for (var i=0;i<globalNodes.length;i++){
        if (globalNodes[i].nodeId == this.nodeId) {
            index = i;
            this.localNodes.push(globalNodes[i]);
            break;
        }
    }
    var nodeIndex = 1;
    for (var i=0;i<globalNodes.length;i++){
        if (i == index) continue;
        for (var j=0;j<globalLinks.length;j++){
            if (globalLinks[j].source == index && globalLinks[j].target == i){
                var link = {"source":0, "target":nodeIndex, "value":1};
                this.localNodes.push(this.nodes[globalLinks[j].target]);
                this.localLinks.push(link);
                nodeIndex += 1;
                break;
            } else if (globalLinks[j].target == index && globalLinks[j].source == i) {
                var link = {"source":0, "target":nodeIndex, "value":1};
                this.localNodes.push(this.nodes[globalLinks[j].source]);
                this.localLinks.push(link);
                nodeIndex += 1;
                break;
            }
        }
    }

};

ColorGraph.prototype._cloneNodes = function(nodes){
    var clone = [];
    for (var i=0;i<nodes.length;i++){
        var node = {"nodeId":nodes[i].nodeId, "group":nodes[i].group};
        clone.push(node);
    }
    return clone;
};

ColorGraph.prototype._cloneLinks = function(links){
    var clone = [];
    for (var i=0;i<links.length;i++){
        var link = {"source":links[i].source, "target":links[i].target, "value":links[i].value};
        clone.push(link);
    }
    return clone;
};

ColorGraph.prototype.getNodes = function(){
    return this._cloneNodes(this.nodes);
};

ColorGraph.prototype.getLinks = function(){
    return this._cloneLinks(this.links);
};

ColorGraph.prototype.getColorForGroup = function(group){
    return this.sampleColors(group);
};

//ADMIN FUNCTIONALITY (should only hit these methods if isAdmin == true)

ColorGraph.prototype._checkAdmin = function(){
    if (!this.isAdmin) {
        console.warn("attempting to do admin action from non-admin user");
        return false;
    }
    return true;
};

ColorGraph.prototype.receiveNodeColorFromClient = function(nodeId, newColorGroup){//parse updated coloring from client
    if (!this._checkAdmin()) return;
    if (this.isSolved) return;
    for (var i=0;i<this.nodes.length;i++){
        var node = this.nodes[i];
        if (node.nodeId != nodeId) continue;
        if (node.group == newColorGroup) return;//no change
        node.group = newColorGroup;
        this.d3Graph.changeNodeColor(nodeId, newColorGroup);
        var nodesClone = this._cloneNodes(this.nodes);
        this.isSolved = this._checkForSolve(nodesClone, this.links);
        if (this.isSolved) {
            $("#statusMessage").html("SOLVED!");
            var data = {
                nodes: nodesClone
            };
            globalPubNub.sendSolved(data);
        }
        else {
            var data = {nodes:this.nodes};
            globalPubNub.sendColorUpdate(data);
        }
        return;
    }
};

ColorGraph.prototype._checkForSolve = function(nodes, links){//check if the graph is solved
    if (!this._checkAdmin()) return false;
    for (var i=0;i<nodes.length;i++){
        var color = nodes[i].group;
        for (var j=0;j<links.length;j++){
            if (links[j].source == i){
                if (!this.isConsensus && nodes[links[j].target].group == color) return false;
                if (this.isConsensus && nodes[links[j].target].group != color) return false;
            } else if (links[j].target == i){
                if (!this.isConsensus && nodes[links[j].source].group == color) return false;
                if (this.isConsensus && nodes[links[j].source].group != color) return false;
            }
        }
    }
    return true;
};


//CLIENT FUNCTIONALITY (should only hit these if isAdmin == false)

ColorGraph.prototype._checkClient = function(){
    if (this.isAdmin) {
        console.warn("attempting to do client action from admin user");
        return false;
    }
    if (this.nodeId === undefined) {
        console.warn("no nodeId found for this client");
        return false;
    }
    return true;
};

ColorGraph.prototype.receiveNodeColorsFromAdmin = function(nodes){//parse updated coloring from admin
    if (!this._checkClient()) return;
    if (nodes.length != this.nodes.length) {
        console.warn("nodes arrays out of sync");
        return;
    }
    for (var i=0;i<this.nodes.length;i++){
        var myNode = this.nodes[i];
        var incomingNode = nodes[i];
        if (myNode.nodeId != incomingNode.nodeId) {
            console.warn("nodes arrays out of sync");
            return;
        }
        if (myNode.group == incomingNode.group) continue;
        myNode.group = incomingNode.group;
        this.d3Graph.changeNodeColor(incomingNode.nodeId, incomingNode.group);
        this.localGraph.changeNodeColor(incomingNode.nodeId, incomingNode.group);
    }
};

ColorGraph.prototype.changeNodeColor = function(newColorGroup){//ui action triggers node color change
    if (!this._checkClient()) return;
    if ((newColorGroup == this._colorForNodeId(this.nodeId))) return;//no change
    var data = {
        nodeId: this.nodeId,
        newColorGroup: newColorGroup
    };
    globalPubNub.sendColorChange(data);
};

ColorGraph.prototype._colorForNodeId = function(nodeId){
    for (var i=0;i<this.nodes.length;i++){
        var node = this.nodes[i];
        if (node.nodeId == nodeId) return node.group;
    }
    console.warn("no node found with nodeId = " + nodeId);
    return null;
};

//START - only called once per new graph topology, otherwise just change coloring of graph

ColorGraph.prototype.start = function(chromaticNumber){
    console.log("chromatic number = " + chromaticNumber);
    this.isSolved = false;
    this.d3Graph.setData(this._cloneNodes(this.nodes),this._cloneLinks(this.links), this.graphType == "cycle");
    if (this.isAdmin) {
        this._renderAsAdmin(chromaticNumber);
        return
    }
    this.localGraph.setData(this._cloneNodes(this.localNodes), this._cloneLinks(this.localLinks));
    this.localGraph.highlightNode(this.nodeId);
    this.d3Graph.highlightNode(this.nodeId);
    if (this.viewType == "global") this.showGlobalView();
    else if (this.viewType == "local") this.showLocalView();
    else console.warn("unrecognized view type");
};

ColorGraph.prototype.showLocalView = function(){
    $("#globalView").hide();
    $("#localView").show();
};

ColorGraph.prototype.showGlobalView = function(){
    $("#localView").hide();
    $("#globalView").show();
};

ColorGraph.prototype._renderAsAdmin = function(chromaticNumber){
    $("#globalView").show();
    var data = {
        viewType:this.viewType,
        graphType: this.graphType,
        nodes: this.nodes,
        links: this.links,
        chromaticNumber: chromaticNumber
    };
    console.log(data);
    globalPubNub.sendStart(data);
};

//STOP - time is up

ColorGraph.prototype.stop = function(){//show global view on stop
    if (this.isAdmin){
        globalPubNub.sendEnd();
    }
};

//DEALLOCATE

ColorGraph.prototype.destroy = function(){
    this.viewType = null;
    this.isAdmin = null;
    this.d3Graph = null;
    this.localGraph = null;
    this.nodes = null;
    this.links = null;
    this.localNodes = null;
    this.localLinks = null;
};

