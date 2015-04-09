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
    var numChords = 5;//todo might not get this exact amount, can mess with this more if time
    var prefConnectivity = 2;
    setGraphTypeUI(graphType, numChords, prefConnectivity);
    var viewType = "local";
    setViewTypeUI(viewType);
    var isConsensus = false;
    var chromaticNumber = getDefaultChromaticNumber();
    $("#chromNum").val(chromaticNumber);

    //listen for graph type changes
    $(".graphType").click(function(e){
        e.preventDefault();
        graphType = $(e.target).data("type");
        setGraphTypeUI(graphType, numChords, prefConnectivity);
    });
    $("#numChords").change(function(e){
        e.preventDefault();
        var newVal = $(e.target).val();
        if (isNaN(parseFloat(newVal))) return;
        numChords = parseFloat(newVal);
        setGraphTypeUI(graphType, numChords, prefConnectivity)
    });
    $("#chromNum").change(function(e){
        e.preventDefault();
        var newVal = $(e.target).val();
        if (isNaN(parseFloat(newVal))) return;
        chromaticNumber = parseFloat(newVal);
    });
    $("#calcChromNum").click(function(e){
        e.preventDefault();
        chromaticNumber = findChromaticNumber(graph.getNodes(), graph.getLinks());
        $("#chromNum").val(chromaticNumber);
    });
    $("#resetChromNum").click(function(e){
        e.preventDefault();
        chromaticNumber = getDefaultChromaticNumber();
        $("#chromNum").val(chromaticNumber);
    });
    $("#connectivity").change(function(e){
        e.preventDefault();
        var newVal = $(e.target).val();
        if (isNaN(parseFloat(newVal))) return;
        prefConnectivity = parseFloat(newVal);
        setGraphTypeUI(graphType, numChords, prefConnectivity)
    });
    $("#consensus").change(function(e){
        e.preventDefault();
        isConsensus = $(e.target).prop("checked");
        console.log(isConsensus);
    });
    function setGraphTypeUI(_graphType, _numChords, _prefConnectivity){
        $("#graphType").html(allGraphTypes[_graphType]);
        $("#numChords").val(_numChords);
        $("#connectivity").val(_prefConnectivity);
        if (graphType == "cycle") {
            $(".numChordsClass").show();
            $(".connectivityClass").hide();
        }
        else {
            $(".numChordsClass").hide();
            $(".connectivityClass").show();
        }
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
        if (graphType == "cycle" && globalPubNub.getPlayers().length%2 != 0) {
            $("#statusMessage").html("Need one more player for cycle puzzle");
            return;
        }
        updateGraph(globalPubNub.getPlayers());
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

        graph = new ColorGraph(viewType, graphType, true, null, isConsensus);

        //build graph from client data and current graph types
        if (isConsensus) {
            chromaticNumber = getDefaultChromaticNumber();
            $("#chromNum").val(chromaticNumber);
        }
        var nodes = constructNodes(playerIds, !isConsensus);
        graph.setNodes(nodes);
        graph.setLinks(constructLinks(nodes, graphType));

        graph.start(chromaticNumber);//sends start message to clients with graph data
    }

    function getDefaultChromaticNumber(){
        if (isConsensus) return 5;
        else if (graphType == "cycle") return 2;
        else if (graphType == "pref") return prefConnectivity+1;
    }

    function constructNodes(playerIds, isSimilar){
        var nodes = [];
        for (var i=0;i<playerIds.length;i++){
            var group = isSimilar ? 1 : Math.floor(Math.random()*getDefaultChromaticNumber()+1);
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
            for (var i=0;i<numChords;i++){
                if (nodes.length < 5) continue;
                var source = Math.floor(Math.random()*nodes.length);
                var dist = (1 + Math.floor(Math.random()*(Math.floor((nodes.length-2)/2)-1)))*2 + 1;
                if (source+dist >= nodes.length) dist -= nodes.length;
                if (dist%2 == 0 || source+dist >= nodes.length) {
                    console.warn("problem initing cycle chords");
                    continue;
                }
                for (var j=0;j<links.length;j++){
                    if ((links[j].source == source && links[j].target == source+dist) ||
                        (links[j].source == source+dist && links[j].target == source)) continue;
                    links.push({source:source, target:source+dist, value:1});
                }
            }
        } else if (type == "pref"){
            for (var i=1;i<nodes.length;i++){
                //num links per new node given by prefConnectivity
                if (i == 1) {
                    links.push({source:1, target:0, value:1});
                    continue;
                }
                if (i <= prefConnectivity){
                    for (var k=0;k<i;k++){
                        links.push({source:i, target:k, value:1});
                    }
                    continue;
                }
                var pool = buildAttachmentPool(nodes, links);
                var draws = [];
                for (var j=0;j<prefConnectivity;j++){
                    var draw = drawRandomFromPool(pool, draws, i, 0);
                    if (draw === null) continue;
                    draws.push(draw);
                    links.push({source:i, target:draw, value:1});
                }
            }
        }
        return links;
    }

    function buildAttachmentPool(nodes, links){//add a node number in the pool for each of its connections
        var pool = [];
        for (var j=0;j<links.length;j++){
            pool.push(links[j].source);
            pool.push(links[j].target);
        }
        return pool;
    }
    function drawRandomFromPool(pool, previousDraws, nodeIndex, numRecurse){
        var index = Math.floor(Math.random()*pool.length);
        var draw = pool[index];
        if (++numRecurse > 50){
            console.warn("too much recursion in pref drawing");
            return null;
        }
        for (var i=0;i<previousDraws.length;i++){
            if (draw == previousDraws[i] || draw == nodeIndex) return drawRandomFromPool(pool, previousDraws, numRecurse);
        }
        return draw;
    }

    function findChromaticNumber(nodes, links){
        var _chromaticNumber = nodes.length;
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
                if(nodeLinks[i] == null) nodeLinks[i] = [];
                // get all of the links attached to this node
                if(links[j].target == i){
                    nodeLinks[i].push(links[j].source);
                } 
                else if(links[j].source == i){
                    nodeLinks[i].push(links[j].target);
                }
            }
        }

        // FOR DEBUGGIN'
        // console.log("nodeLinks");
        // console.log(nodeLinks);

        var localNodes = nodes;

        // try coloring the graph starting from each node
        // the chromatic number is the order of coloring that uses the least colors
        for (var i=0;i<localNodes.length;i++){
            // start from each node
            var colors = [1];
            var startNode = localNodes[i];
            localNodes = colorAllNodesSame(localNodes);
            // clear nodes

            for(var j=0;j<localNodes.length;j++){
                // go through all nodes starting at start node
                var index = (i+j)%localNodes.length;
                var node = localNodes[index];
                var testedColors = [];

                //Object.keys(nodeLinks).length
//                console.log("colors: ");

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
            if(colors.length < _chromaticNumber) {
                // console.log("colors");
                // console.log(colors);
                _chromaticNumber = colors.length;
                
                // copy nodes into best solution
                bestSolution = [];
                for (var i=0;i<localNodes.length;i++){
                    bestSolution[i] = localNodes[i];
                }
//                console.log("best solution");
//                console.log(bestSolution);
            }
        }

//        console.log("chromaticNumber");
//        console.log(_chromaticNumber);

        return _chromaticNumber;
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