/**
 * Created by aghassaei on 4/7/15.
 */


function ColorGraph(graphType, viewType, isAdmin, nodeId) {
    if (graphType === undefined || viewType === undefined || isAdmin === undefined) {
        console.warn("not enough args to init ColorGraph");
        return;
    }
    this.graphType = graphType;
    this.viewType = viewType;
    this.isAdmin = isAdmin;
    if (!this.isAdmin) this.nodeId = nodeId;
    this.d3Graph = new D3Graph();
    this.nodes = [];
    this.links = [];
}

ColorGraph.prototype.setNodes = function(nodes){
    this.nodes = nodes;
};

ColorGraph.prototype.setLinks = function(links){
    this.links = links;
};

ColorGraph.prototype._sendMessage = function(message){
    //todo
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
    for (var i=0;i<this.nodes.length;i++){
        var node = this.nodes[i];
        if (node.nodeId != nodeId) continue;
        if (node.group == newColorGroup) return;//no change
        node.group = newColorGroup;
        this.d3Graph.changeNodeColor(nodeId, newColorGroup);
        if (this._checkForSolve()) {
            this.stop();
            this._sendMessage({solved:true});
        }
        else this._sendMessage(this._allColorInfoJSON());
        return;
    }
};

ColorGraph.prototype._checkForSolve = function(){//check if the graph is solved
    if (!this._checkAdmin()) return false;
    //todo
    return false;
};

ColorGraph.prototype._allColorInfoJSON = function(){
    if (!this._checkAdmin()) return {};
    return {
        nodes: null
    };
};

ColorGraph.prototype._allGraphInfoJSON = function(){
    if (!this._checkAdmin()) return {};
    return {
        graphType:this.graphType,
        viewType:this.viewType,
        nodes: null,
        links: null
    };
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
        this.d3Graph.changeNodeColor(incomingNode.nodeId, incomingNode.group);
        //todo update local graph as well
    }
};

ColorGraph.prototype.changeNodeColor = function(newColorGroup){//ui action triggers node color change
    if (!this._checkClient()) return;
    if (newColorGroup == this._colorForNodeId(this.nodeId)) return;//no change
    this._sendMessage(this._colorInfoJSON());
};

ColorGraph.prototype._colorInfoJSON = function(){
    if (!this._checkClient()) return {};
    return {
        nodeId: this.nodeId,
        color: this._colorForNodeId(this.nodeId)
    };
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

ColorGraph.prototype.start = function(){
    this.d3Graph.setData(this.nodes, this.links);
    if (this.isAdmin) this._renderAsAdmin();
    else if (this.viewType == "global") this._renderAsGlobal();
    else if (this.viewType == "local") this._renderAsLocal();
    else console.warn("unrecognized view type");
};

ColorGraph.prototype._renderAsLocal = function(){
    $("#globalView").hide();
    $("#localView").show();
    //todo render local node view
};

ColorGraph.prototype._renderAsGlobal = function(){
    $("#localView").hide();
    $("#globalView").show();
    //todo highlight node
};

ColorGraph.prototype._renderAsAdmin = function(){
    $("#globalView").show();
    this._sendMessage(this._allGraphInfoJSON());
};

//STOP - time is up

ColorGraph.prototype.stop = function(){//show global view on stop
    $("#localView").hide();
    $("#globalView").show();
    if (this.isAdmin){
        this._sendMessage({stop:true});
    }
};

//DEALLOCATE

ColorGraph.prototype.destroy = function(){
    this.graphType = null;
    this.viewType = null;
    this.isAdmin = null;
    this.d3Graph = null;
    this.nodes = null;
    this.links = null;
};

