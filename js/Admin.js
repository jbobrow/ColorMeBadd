/**
 * Created by aghassaei on 4/7/15.
 */


$(function(){//allow the page to load

    // Pubnub messaging
    globalPubNub = initPubNub(true, {onReceiveClientColorUpdates:onReceiveClientColorUpdates,
                                     updateGraph:updateGraph});

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
        graph = new ColorGraph(viewType, true);

        //build graph from client data and current graph types
        var nodes = [
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
        ];

        var links  = [
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
        ];

        graph.setNodes(nodes);
        graph.setLinks(links);

        graph.start();//sends start message to clients with graph data
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
    });

    function updateGraph(playerIds){
        
        if (graph) graph.destroy();
        
        graph = new ColorGraph(viewType, true);

        //build graph from client data and current graph types
        var nodes = constructNodes(playerIds, true);

        var links  = null; //constructLinks(nodes, "cycle");

        graph.setNodes(nodes);
        graph.setLinks(links);

        graph.start();//sends start message to clients with graph data
    }

    function constructNodes(playerIds, isSimilar){
        var nodes = [];
        for (var i=0;i<playerIds.length;i++){
            var group = isSimilar?1:Math.floor(Math.random(1,4));

            var node = {
                "nodeId":playerIds[i],
                "group":group
            }
        }
        return nodes;
    }


    function constructLinks(nodes, type){
        var links = [];
        if (type == "cycle"){
            for (var i=0;i<nodes.length;i++){
                var targetNum = i+1;
                if (targetNum == nodes.length) targetNum = 0;
                var link = {"source":i, "target":targetNum, "value":1};
                links.push(link);
            }
            //todo add crosslinks
        } else if (type == "pref"){

        }
        return links;
    }

    //reset
    $("#resetButton").click(function(e){
        e.preventDefault();
        globalPubNub.sendReset();
    })

});