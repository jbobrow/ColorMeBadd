/**
 * Created by aghassaei on 4/7/15.
 */

var allGraphTypes = {
    cycle: "Cycle",
    pref: "Preferential Attachment"
};

var allViewTypes = {
    local: "Local View",
    global: "Global View"
};


function ColorGraph(graphType, viewType, isAdmin) {
    if (graphType === undefined || viewType === undefined || isAdmin === undefined) {
        console.warn("not enough args to init ColorGraph");
        return;
    }
    this.graphType = graphType;
    this.viewType = viewType;
    this.isAdmin = isAdmin;
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

ColorGraph.prototype.receiveNodeColorChange = function(nodeId, newColorGroup){//parse updated coloring from client
    for (var i=0;i<this.nodes.length;i++){
        var node = this.nodes[i];
        if (node.nodeId != nodeId) continue;
        if (node.group == newColorGroup) return;//no change
        node.group = newColorGroup;
        this.d3Graph.changeNodeColor(nodeId, newColorGroup);
        this._sendMessage(this._allColorInfoJSON());
        return;
    }
};

//todo maybe these go somewhere else
//ColorGraph.prototype.changeGraphType = function(newGraphType){
//    if (!this._checkAdmin()) return;
//    if (newGraphType == this.graphType) return;
//    this.graphType = newGraphType;
//    //todo stop d3 and redo graph
//};
//
//ColorGraph.prototype.changeViewType = function(newViewType){
//    if (!this._checkAdmin()) return;
//    if (newViewType == this.viewType) return;
//    this.viewType = newViewType;
//    this._sendMessage(this._allGraphInfoJSON());
//};

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
    if (globals === undefined || !globals || globals.nodeId == undefined) {
        console.warn("no nodeId found for this client");
        return false;
    }
    return true;
};

ColorGraph.prototype.receiveUpdatedNodeColors = function(nodes){//parse updated coloring from admin
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
    if (newColorGroup == this._colorForNodeId(globals.nodeId)) return;//no change
    this._sendMessage(this._colorInfoJSON());
};

ColorGraph.prototype._colorInfoJSON = function(){
    if (!this._checkClient()) return {};
    return {
        nodeId: globals.nodeId,
        color: this._colorForNodeId(globals.nodeId)
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
};

