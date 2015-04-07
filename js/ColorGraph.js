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

//ADMIN FUNCTIONALITY (should only hit these methods if isAdmin == true

ColorGraph.prototype._checkAdmin = function(){
    if (!this.isAdmin) {
        console.warn("attempting to admin action from non-admin graph");
        return false;
    }
    return true;
};

ColorGraph.prototype.changeGraphType = function(newGraphType){
    if (!this._checkAdmin()) return;
    if (newGraphType == this.graphType) return;
    this.graphType = newGraphType;
    //todo stop d3 and redo graph
    this._pingClients();
};

ColorGraph.prototype.changeViewType = function(newViewType){
    if (!this._checkAdmin()) return;
    if (newViewType == this.viewType) return;
    this.viewType = newViewType;
    this._pingClients();
};

ColorGraph.prototype._pingClients = function(){
    if (!this._checkAdmin) return;
    var message = this._constructMessage();
    //todo ping graph about color change
};

ColorGraph.prototype._constructMessage = function(){
    if (!this._checkAdmin) return {};
    return {
        graphType:this.graphType,
        viewType:this.viewType,
        nodes: null,
        links: null
    };
};

//CLIENT MESSAGES




//RENDERING - only called once, otherwise just change coloring of graph

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
    //todo ping start to clients
};

