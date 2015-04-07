/**
 * Created by aghassaei on 4/7/15.
 */

$(function(){//allow the page to load

    var graph = null;
    var ui = null;


    //wait for start message from admin
   function onReceiveStartMessage(links, nodes, graphType, viewType){

        if (graph) graph.destroy();
        if (ui) ui.destroy();

        graph = new ColorGraph(graphType, viewType, false, "myNodeId");
        ui = new ClientUI(graph);

        graph.setNodes(nodes);
        graph.setLinks(links);

        graph.start();
    }

    //listen for color updates from admin
    function onReceiveColorUpdates(nodes){
        if (graph) graph.receiveUpdatedNodeColors(nodes);
        else console.warn("client graph object not found");
    }

    //listen for stop message from admin
    function onReceiveStopMessage(){
        if (graph) graph.stop();
        else console.warn("client graph object not found");
    }

});