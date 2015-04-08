/**
 * Created by aghassaei on 4/7/15.
 */


$(function(){//allow the page to load

    // Pubnub messaging
    globalPubNub = initPubNub(true, {onReceiveClientColorUpdates:onReceiveClientColorUpdates});

    var allGraphTypes = {
        cycle: "Cycle",
        pref: "Preferential Attachment"
    };

    var allViewTypes = {
        local: "Local View",
        global: "Global View"
    };

    //these won't actually update the graph until start is hit again
    var graphType = "cycle";
    setGraphTypeUI(graphType);
    var viewType = "local";
    setViewTypeUI(viewType);

    //listen for graph type changes
    $(".graphType").click(function(e){
        e.preventDefault();
        graphType = $(e.target).data("type");
        setGraphTypeUI(graphType);
    });
    function setGraphTypeUI(graphType){
        $("#graphType").html(allGraphTypes[graphType]);
    }

    //listen for view type changes
    $(".viewType").click(function(e){
        e.preventDefault();
        viewType = $(e.target).data("type");
        setViewTypeUI(viewType);
    });
    function setViewTypeUI(viewType){
        $("#viewType").html(allViewTypes[viewType]);
    }

    var graph;

    //wait for all clients to appear

    //hit start
    $("#startButton").click(function(e){
        e.preventDefault();

        if (graph) graph.destroy();
        graph = new ColorGraph("cycle", "global", true);

        //build graph from client data and current graph types
        var graphData = {
          "nodes":[
            {"nodeId":"id1","group":1},
            {"nodeId":"id2","group":1},
            {"nodeId":"id3","group":1},
            {"nodeId":"id4","group":1},
            {"nodeId":"id5","group":1},
            {"nodeId":"id6","group":1},
            {"nodeId":"id7","group":1},
            {"nodeId":"id8","group":1},
            {"nodeId":"id9","group":1},
            {"nodeId":"id10","group":1},
            {"nodeId":"id11","group":2},
            {"nodeId":"id12","group":2},
            {"nodeId":"id13","group":3},
            {"nodeId":"id14","group":2}
          ],
          "links":[
            {"source":1,"target":0,"value":1},
            {"source":2,"target":0,"value":1},
            {"source":3,"target":0,"value":1},
            {"source":4,"target":0,"value":1},
            {"source":5,"target":0,"value":1},
            {"source":6,"target":0,"value":1},
            {"source":7,"target":0,"value":1},
            {"source":8,"target":0,"value":1},
            {"source":9,"target":0,"value":1},
            {"source":10,"target":0,"value":1},
            {"source":11,"target":0,"value":1},
            {"source":12,"target":2,"value":1},
            {"source":13,"target":2,"value":1},
            {"source":12,"target":2,"value":1},
            {"source":10,"target":2,"value":1},
            {"source":4,"target":2,"value":1}
          ]
//          "links":[
//            {"source":"id2","target":"id1","value":1},
//            {"source":"id3","target":"id1","value":1},
//            {"source":"id4","target":"id1","value":1},
//            {"source":"id4","target":"id3","value":1},
//            {"source":"id5","target":"id1","value":1},
//            {"source":"id5","target":"id1","value":1},
//            {"source":"id6","target":"id1","value":1},
//            {"source":"id7","target":"id1","value":1},
//            {"source":"id8","target":"id1","value":1},
//            {"source":"id9","target":"id1","value":1},
//            {"source":"id10","target":"id12","value":1},
//            {"source":"id11","target":"id5","value":1},
//            {"source":"id12","target":"id3","value":1},
//            {"source":"id13","target":"id1","value":1},
//            {"source":"id14","target":"id2","value":1},
//            {"source":"id13","target":"id2","value":1}
//          ]
        };

        graph.setNodes(graphData.nodes);
        graph.setLinks(graphData.links);

        graph.start();//sends start message to clients with graph data

        // send start message via PubNub
        globalPubNub.sendStart();
    });

    //listen for changes
    function onReceiveClientColorUpdates(nodeId, newColorGroup){
        if (graph) graph.receiveNodeColorFromClient(nodeId, newColorGroup);//also checks for solve
        else console.warn("admin graph object not found");
    }

    //timeout
    $("#stopButton").click(function(e){
        e.preventDefault();
        if (graph) {
            graph.stop();
        } else console.warn("admin graph object not found");

        // send end message via PubNub
        globalPubNub.sendEnd();
    })

});