/**
 * Created by aghassaei on 4/7/15.
 */


$(function(){//allow the page to load

    $("#globalView").show();

    //wait for all clients to appear
    //build graph from client data and current graph types

    var graphData = {
      "nodes":[
        {"name":"Myriel","group":1},
        {"name":"Napoleon","group":1},
        {"name":"Mlle.Baptistine","group":1},
        {"name":"Mme.Magloire","group":1},
        {"name":"CountessdeLo","group":1},
        {"name":"Geborand","group":1},
        {"name":"Champtercier","group":1},
        {"name":"Cravatte","group":1},
        {"name":"Count","group":1},
        {"name":"OldMan","group":1},
        {"name":"Labarre","group":2},
        {"name":"Valjean","group":2},
        {"name":"Marguerite","group":3},
        {"name":"Mme.deR","group":2}
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

    var d3Graph = new D3Graph();
    d3Graph.setData(graphData.nodes, graphData.links);

    //send graph to clients
    //listen for changes
    //check for solve
    //send solution to clients

});