/**
 * Created by aghassaei on 4/7/15.
 */


$(function(){//allow the page to load

    var graph = new ColorGraph("cycle", "global", true);
    var ui = new AdminUI(graph);

    //wait for all clients to appear

    $("#startButton").click(function(e){
        e.preventDefault();
        //build graph from client data and current graph types
        var graphData = {
          "nodes":[
            {"nodeId":"Myriel","group":1},
            {"nodeId":"Napoleon","group":1},
            {"nodeId":"Mlle.Baptistine","group":1},
            {"nodeId":"Mme.Magloire","group":1},
            {"nodeId":"CountessdeLo","group":1},
            {"nodeId":"Geborand","group":1},
            {"nodeId":"Champtercier","group":1},
            {"nodeId":"Cravatte","group":1},
            {"nodeId":"Count","group":1},
            {"nodeId":"OldMan","group":1},
            {"nodeId":"Labarre","group":2},
            {"nodeId":"Valjean","group":2},
            {"nodeId":"Marguerite","group":3},
            {"nodeId":"Mme.deR","group":2}
          ],
          "links":[
            {"source":1,"target":0,"value":1},
            {"source":2,"target":0,"value":1},
            {"source":3,"target":0,"value":1},
            {"source":3,"target":2,"value":1},
            {"source":4,"target":0,"value":1},
            {"source":5,"target":0,"value":1},
            {"source":6,"target":0,"value":1},
            {"source":7,"target":0,"value":1},
            {"source":8,"target":0,"value":1},
            {"source":9,"target":0,"value":1},
            {"source":11,"target":10,"value":1},
            {"source":11,"target":3,"value":1},
            {"source":11,"target":2,"value":1},
            {"source":11,"target":0,"value":1},
            {"source":12,"target":11,"value":1},
            {"source":13,"target":11,"value":1}
          ]
        };

        graph.setNodes(graphData.nodes);
        graph.setLinks(graphData.links);

        graph.start();
    });

    $("#startButton").click();


    //send graph to clients
    //listen for changes
    //check for solve
    //send solution to clients

});