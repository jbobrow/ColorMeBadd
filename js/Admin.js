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
        updateGraph(globalPubNub.players);
    });

////        var nodes = [
////            {"nodeId":"id1","group":1},
////            {"nodeId":"id2","group":1},
////            {"nodeId":"id3","group":1},
////            {"nodeId":"id4","group":1},
////            {"nodeId":"id5","group":1},
////            {"nodeId":"id6","group":1},
////            {"nodeId":"id7","group":1},
////            {"nodeId":"id8","group":1},
////            {"nodeId":"id9","group":1},
////            {"nodeId":"id10","group":1},
////            {"nodeId":"id11","group":2},
////            {"nodeId":"id12","group":2},
////            {"nodeId":"id13","group":3},
////            {"nodeId":"id14","group":2}
////        ];
//
////        var links  = [
////            {"source":1,"target":0,"value":1},
////            {"source":2,"target":0,"value":1},
////            {"source":3,"target":0,"value":1},
////            {"source":4,"target":0,"value":1},
////            {"source":5,"target":0,"value":1},
////            {"source":6,"target":0,"value":1},
////            {"source":7,"target":0,"value":1},
////            {"source":8,"target":0,"value":1},
////            {"source":9,"target":0,"value":1},
////            {"source":10,"target":0,"value":1},
////            {"source":11,"target":0,"value":1},
////            {"source":12,"target":2,"value":1},
////            {"source":13,"target":2,"value":1},
////            {"source":12,"target":2,"value":1},
////            {"source":10,"target":2,"value":1},
////            {"source":4,"target":2,"value":1}
////        ];

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

    //send instructions
    $("#instructButton").click(function(e){
        e.preventDefault();
        var data = {
            instructions: "Mission: Make sure you don't have the same color as your neighbors."
        };
        globalPubNub.sendInstructions(data);
    });

    //reset
    $("#resetButton").click(function(e){
        e.preventDefault();
        globalPubNub.sendReset();
    });


    function updateGraph(playerIds){

        if (graph) graph.destroy();
        
        graph = new ColorGraph(viewType, true);

        //build graph from client data and current graph types
        var nodes = constructNodes(playerIds, true);
        graph.setNodes(nodes);
        graph.setLinks(constructLinks(nodes, graphType));

        graph.start();//sends start message to clients with graph data
    }

    function constructNodes(playerIds, isSimilar){
        var nodes = [];
        for (var i=0;i<playerIds.length;i++){
            var group = isSimilar?1:Math.floor(Math.random()*4+1);
            var node = {
                "nodeId":playerIds[i],
                "group":group
            };
            nodes.push(node);
        }
        return nodes;
    }


    function constructLinks(nodes, type){
        var links = [];
        if (type == "cycle"){
            for (var i=0;i<nodes.length;i++){
                var targetNum = i+1;
                if (targetNum == nodes.length) targetNum = 0;
                var link = {source:i, target:targetNum, value:1};
                links.push(link);
            }
            //todo add crosslinks
        } else if (type == "pref"){

        }
        return links;
    }

    function findChromaticNumber(nodes, links){
        var chromaticNumber = nodes.length;

        var nodeLinks = {};

        // create a map of node indices with an array of its connected nodes
        for (var i=0;i<nodes.length;i++){
            for(var j=0;j<links.length;j++){
                nodesLinks[nodes[i].index] = [];
                // get all of the links attached to this node
                if(links[j].target == nodes[i].index){
                    nodeLinks[nodes[i].index].push(links[j].source);
                } 
                else if(links[j].source == nodes[i].index){
                    nodeLinks[nodes[i].index].push(links[j].target);
                }else
                    continue;
            }
        }

        // try coloring the graph starting from each node
        // the chromatic number is the order of coloring that uses the least colors
        for (var i=0;i<nodes.length;i++){
            // start from each node
            var num = 0;
            var startNode = nodes[i];

            for(var j=0;j<nodes.length;j++){
                // go through all nodes starting at start node
                var index = (i+j)%nodes.length;
                var node = nodes[index];

                for(var k=0;k<nodeLinks.length;k++){
                    // go through each link and check if colors are the same  
                    // check color of linked node
                    // if the same, choose a new color from options
                    // if out of options, add an option and increase 'num'
                }
                // if num is lower than current lowest num, 
                // we have a new lowest chromatic number
            }
            if(num < chromaticNumber)
                chromaticNumber = num;
        }

        return chromaticNumber;
    }


});