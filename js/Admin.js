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
        $("#statusMessage").html("");
        updateGraph(globalPubNub.getPlayers());
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

//    //reset
//    $("#resetButton").click(function(e){
//        e.preventDefault();
//        globalPubNub.sendReset();
//    });

    //send a message to clients and listen for response to ensure that they are not ghosts
    $("#validateClients").click(function(e){
        e.preventDefault();
        globalPubNub.validateClient($("#validationMessage").val());
    });

    function updateGraph(playerIds){

        if (graph) graph.destroy();
        
        graph = new ColorGraph(viewType, true);

        //build graph from client data and current graph types
        var nodes = constructNodes(playerIds, true);
        graph.setNodes(nodes);
        graph.setLinks(constructLinks(nodes, graphType));

        // chromatic number
        findChromaticNumber(graph.nodes, graph.links);

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
        var bestSolution;

        // FOR DEBUGGIN'
        // console.log("nodes");
        // console.log(nodes);
        // console.log("links");
        // console.log(links);

        // create a map of node indices with an array of its connected nodes
        for (var i=0;i<nodes.length;i++){
            for(var j=0;j<links.length;j++){
                if(nodeLinks[i] == null)
                    nodeLinks[i] = [];
                // get all of the links attached to this node
                if(links[j].target == i){
                    nodeLinks[i].push(links[j].source);
                } 
                else if(links[j].source == i){
                    nodeLinks[i].push(links[j].target);
                }else
                    continue;
            }
        }

        // FOR DEBUGGIN'
        // console.log("nodeLinks");
        // console.log(nodeLinks);

        var localNodes = [];
        for(var i=0;i<nodes.length;i++){
            localNodes[i] = nodes[i];   
        }

        // try coloring the graph starting from each node
        // the chromatic number is the order of coloring that uses the least colors
        for (var i=0;i<localNodes.length;i++){
            // start from each node
            var colors = [1];
            var startNode = localNodes[i];
            localNodes = colorAllNodesSame(localNodes)
            // clear nodes

            for(var j=0;j<localNodes.length;j++){
                // go through all nodes starting at start node
                var index = (i+j)%localNodes.length;
                var node = localNodes[index];
                var testedColors = [];

                //Object.keys(nodeLinks).length
                console.log("colors: ");

                // create an array of the colors of neighbors
                for(var k=0;k<nodeLinks[index].length;k++){
                        // go through each link and check if colors are the same  
                        var colorIndex = 0;

                        var neighborIDs = nodeLinks[index];
                        var neighborID = neighborIDs[k]
                        // console.log(localNodes[neighborID]);
                        testedColors.push(localNodes[neighborID].group)
                }

                // find the smallest color available
                var smallest = getSmallestWholeNumberNotInArray(testedColors);
                // console.log("smallest");
                // console.log(smallest);

                // set the group to the smallest available
                node.group = smallest;

                // if the smallest available is larger than the color array, add it
                if(smallest > colors.length)
                    colors.push(smallest);
            }

            // if colors.length is lower than current lowest chromatic number, 
            // we have a new lowest chromatic number
            if(colors.length < chromaticNumber) {
                // console.log("colors");
                // console.log(colors);
                chromaticNumber = colors.length;
                
                // copy nodes into best solution
                bestSolution = [];
                for (var i=0;i<localNodes.length;i++){
                    bestSolution[i] = localNodes[i];
                }
                console.log("best solution");
                console.log(bestSolution);
            }
        }

        console.log("chromaticNumber");
        console.log(chromaticNumber);

        return chromaticNumber;
    }

    // Thanks StackOverflow!
    // http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    // Thanks Jonathan Bobrow
    // Warning, this is one weird way to solve this problem
    function getSmallestWholeNumberNotInArray(array){
        
        var isSmallestNumber = false;
        var smallestNumber = 1;
        var safety = 0;

        while(!isSmallestNumber && safety < 100){
            
            var count = 0;

            for (var i=0;i<array.length;i++){
                if(array[i] == smallestNumber)
                    smallestNumber++;
                else
                    count++;
            }

            if(count == array.length)
                isSmallestNumber = true;

            safety++;
        }

        return smallestNumber;
    }

    function colorAllNodesSame(nodes){
        for (var i=0;i<nodes.length; i++){
            nodes[i].group = 1;
        }
        return nodes;
    }


});