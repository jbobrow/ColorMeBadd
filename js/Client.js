/**
 * Created by aghassaei on 4/7/15.
 */

$(function(){//allow the page to load

    // Pubnub messaging
    globalPubNub = initPubNub(false,
                             { onReceiveStartMessage:onReceiveStartMessage,
                               onReceiveAdminColorUpdates:onReceiveAdminColorUpdates, 
                               onReceiveStopMessage:onReceiveStopMessage,
                               onReceiveSolvedMessage:onReceiveSolvedMessage });

    var graph = null;

    //wait for start message from admin
   function onReceiveStartMessage(links, nodes, viewType){

        if (graph) graph.destroy();

        graph = new ColorGraph(viewType, false, "id5");

        graph.setNodes(nodes);
        graph.setLinks(links);

       $.each($(".colorSelector"), function(index){
           var object = $($(".colorSelector")[index]);
           var color = graph.getColorForGroup(object.data("type"));
           object.css('background-color', color);
       });

       var id = globalPubNub.uuid
       $("#statusMessage").html(id);

        graph.start();
    }

    //listen for color updates from admin
    function onReceiveAdminColorUpdates(nodes){
        if (graph) graph.receiveNodeColorsFromAdmin(nodes);
        else console.warn("client graph object not found");
    }

    //listen for stop message from admin
    function onReceiveStopMessage(){
        if (graph) graph.stop();
        else console.warn("client graph object not found");
    }

    //listen for stop message from admin
    function onReceiveSolvedMessage(){
        console.log("SOLVED!!! Now go celebrate!");
    }

    //listen for color updates from user
    $(".colorSelector").click(function(e){
        e.preventDefault();
        var num = $(e.target).data("type");
        if (graph) graph.changeNodeColor(num);
    });


});