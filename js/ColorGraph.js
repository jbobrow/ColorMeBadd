/**
 * Created by aghassaei on 4/7/15.
 */

var allGraphTypes = {
    cycle: "Cycle",
    pref: "Preferential Attachment"
};

var allViewType = {
    local: "Local View",
    global: "Global View"
};


function ColorGraph(graphType, viewType, isAdmin) {
    this.graphType = graphType;
    this.viewType = viewType;
    this.isAdmin = isAdmin;
}



//ADMIN FUNCTIONALITY

ColorGraph.prototype.changeGraphType = function(newGraphType){
    if (newGraphType == this.graphType) return;
    this.graphType = newGraphType;
    this._pingClients();
};

ColorGraph.prototype.changeViewType = function(newViewType){
    if (newViewType == this.viewType) return;
    this.viewType = newViewType;
    this._pingClients();
};

ColorGraph.prototype._pingClients = function(){
    if (!this.isAdmin) {
        console.warn("attempting to ping clients from non-admin graph");
        return;
    }
    var message = this._constructMessage();
    //todo ping graph about color change
};

ColorGraph.prototype._constructMessage = function(){
    return {
        graphType:this.graphType,
        viewType:this.viewType,
        graph: null
    };
};



//RENDERING

ColorGraph.prototype.renderAsClient = function(){

};

ColorGraph.prototype.renderAsAdmin = function(){

};

