/**
 * Created by aghassaei on 4/7/15.
 */

$(function(){//allow the page to load

    $('body').bind('touchmove', function (ev) {
      ev.preventDefault();
    });

    // Pubnub messaging
    globalPubNub = initPubNub(false, {
                               onReceiveInstructions:onReceiveInstructions,
                               onReceiveStartMessage:onReceiveStartMessage,
                               onReceiveAdminColorUpdates:onReceiveAdminColorUpdates, 
                               onReceiveStopMessage:onReceiveStopMessage,
                               onReceiveSolvedMessage:onReceiveSolvedMessage,
                               onValidationRequest:onValidationRequest
                             });

    var graph = null;

    function onReceiveInstructions(instructions){
        $("#statusMessage").html(instructions);
    }

    //wait for start message from admin
    function onReceiveStartMessage(links, nodes, viewType, graphType, chromaticNumber){

        if (graph) graph.destroy();

        graph = new ColorGraph(viewType, graphType, false, globalPubNub.uuid);

        graph.setNodes(nodes);
        graph.setLinks(links);

       $.each($(".colorSelector"), function(index){
           var object = $($(".colorSelector")[index]);
           var color = graph.getColorForGroup(object.data("type"));
           object.css('background-color', color);
           if (parseFloat(object.data("type"))>chromaticNumber) object.hide();
           else object.show();
       });

       $("#statusMessage").html(globalPubNub.uuid);
//        $("#statusMessage").html("");

        $("#clientUI").show();
        $("#localGlobalToggle").hide();

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
        $("#statusMessage").html("ran out of time!");
        showStopUI();
    }

    //listen for stop message from admin
    function onReceiveSolvedMessage(nodes){
        if (graph) {
            graph.stop();
            graph.receiveNodeColorsFromAdmin(nodes);
        } else console.warn("client graph object not found");
        $("#statusMessage").html("SOLVED!");
        showStopUI();
    }

    //listen for validationRequest
    function onValidationRequest(message){
        $("#statusMessage").html(message);
        globalPubNub.validationResponse();
    }

    //listen for color updates from user
    $(".colorSelector").click(function(e){
        e.preventDefault();
        var num = $(e.target).data("type");
        if (graph) graph.changeNodeColor(num);
    });

    function showStopUI(){
        $("#clientUI").hide();
        $("#localGlobalToggle").show();
    }

    $(".localGlobal").click(function(e){
        e.preventDefault();
        if (!graph) return;
        var viewType = $(e.target).data("type");
        if (viewType == "local") graph.showLocalView();
        else if (viewType == "global") graph.showGlobalView();
        else console.warn("view type not recognized " + viewType);
    })

});