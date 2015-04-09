/**
 * Messaging for all graph communications
 * Created by Jonathan Bobrow on 4/7/15.
 */

function initPubNub(isAdmin, callbacks) {

	var _channel = 'jon_channel'//'global_channel'
	var _clientChannel = _channel
	var _adminChannel = _channel

	// my unique ID
	var _uuid = PUBNUB.uuid();

	// Init
	var pubnub = PUBNUB.init({
	    publish_key: 'pub-c-2f911019-8b97-402e-a7e3-67de99b0364b',
	    subscribe_key: 'sub-c-5c02bef8-dcae-11e4-9e58-02ee2ddab7fe',
	    uuid: _uuid
	});

	var _players = [];
    var _validatedPlayers = [];
    var _playersToIgnore = [];

	// Subscribe to channel
	pubnub.subscribe({
	    channel: _channel,
	    presence: function(m) {
	        //console.log(m)
//	        switch (m.action) {
//	            case "join":
//	                // set the UUID here
//	                console.log("received JOIN message - " + m.uuid);
//	                if(isAdmin && m.uuid != _uuid) {	// don't add the admin as a player
//	                	_players.push(m.uuid);
////	                	showPlayersList(_players);
//
//		    //             if(callbacks.updateGraph) { d
//						// 	callbacks.updateGraph(_players);
//						// }
//						// else
//						// 	console.warn("callbacks object not found");
//	                }
//	                break;
//
//	            case "leave":
//	                // set this user to no longer focussed...
//	                console.log("received LEAVE message - " + m.uuid);
//	                var index = _players.indexOf(m.uuid);
//
//	                if (index > -1) {
//    					_players.splice(index, 1);
////	                	showPlayersList(_players);
//					}
//	                break;
//	        }
	    },
	    message: function(m) {
	        switch (m.action) {

	            case "start":
                    if (isAdmin) break;
	                console.log("received START message + data: ");
                    console.log(m.data);
                    // tell client to start
                    if(callbacks.onReceiveStartMessage) {
                        if(m.data) {
                            if( m.data.links && m.data.nodes && m.data.viewType )
                                callbacks.onReceiveStartMessage(m.data.links, m.data.nodes, m.data.viewType, m.data.graphType, m.data.chromaticNumber);
                            else
                                console.warn("not receiving all of our start data");
                        } else
                            console.warn("not receiving data at all");
                    } else
                        console.warn("callbacks object not found");
	                break;

	            case "end":
                    if (isAdmin) break;
	                console.log("received END message");
                    // tell client to stop
                    if(callbacks.onReceiveStopMessage)
                        callbacks.onReceiveStopMessage();
                    else
                        console.warn("callbacks object not found");
	                break;

	            case "solved":
                    if (isAdmin) break;
	            	console.log("received SOLVED message");
                    // update client
                    if(callbacks.onReceiveSolvedMessage)
                        if (m.data) callbacks.onReceiveSolvedMessage(m.data.nodes);
                        else console.warn("no data found for solved graph");
                    else
                        console.warn("callbacks object not found");
	            	break;

	            case "reset":
	            	console.log("received RESET message");
	            	// reset the players array
	            	if(!isAdmin) {
	            		// boot the user from the game
					}
					else {
                        _players.splice(0,_players.length);
//				    	showPlayersList(_players);
					}
	            	break;

	            case "changeUserColor":
                    if (!isAdmin) break;
	                console.log("received USER COLOR message");
                    // update admin
                    if(callbacks.onReceiveClientColorUpdates) {
                        if(m.data) {
                            if( m.data.nodeId && m.data.newColorGroup )
                                callbacks.onReceiveClientColorUpdates(m.data.nodeId, m.data.newColorGroup);
                            else
                                console.warn("not receiving all of our data");
                        }
                        else
                            console.warn("not receiving data at all");

                    }
                    else
                        console.warn("callbacks object not found");
	                break;

	            case "updateColors":
                    if (isAdmin) break;
	            	console.log("recieved UPDATE COLOR message");
                    // update client
                    if(callbacks.onReceiveAdminColorUpdates)
                        callbacks.onReceiveAdminColorUpdates(m.data.nodes);
                    else
                        console.warn("callbacks object not found");
	            	break;

	            case "instructions":
                    if (isAdmin) break;
	            	console.log("received INSTRUCTIONS message");
                    if(callbacks.onReceiveInstructions)
                        callbacks.onReceiveInstructions(m.data.instructions);
                    else
                        console.warn("callbacks object not found");
	            	break;

                case "validateClient":
                    if (isAdmin) break;
                    console.log("received validation request");
                    if (callbacks.onValidationRequest) {
                        if (m.data && m.data.message) callbacks.onValidationRequest(m.data.message);
                        else callbacks.onValidationRequest("");
                    }
                    else console.warn("callback not found");
                    break;

                case "validationResponse":
                    if (!isAdmin) break;
                    console.log("received validation from client " + m.data.id);
                    if (m.data && m.data.id) {
                        if (m.data.id == _uuid) {
                            console.warn("attempted to add admin as player, something is funky");
                            break;
                        }
                        if (_playersToIgnore.indexOf(m.data.id) > -1){
                            console.log("ignoring id " + m.data.id);
                            break;
                        }
                        _validatedPlayers.push(m.data.id);
                        showPlayersList(_validatedPlayers);
                    } else console.log("id not found");
                    break;

	            default:
	                console.log(m);
	        }
	    }
	});

	// presence
	function getPresence() {
		pubnub.here_now({
			channel : _channel,
			callback : function(m){console.log(m)}
		});
	}

	// Publish

	// send start message
	function sendStart(data) {
	    pubnub.publish({
	        channel: _clientChannel,
	        message: {
	            action: 'start',
	            data: data
	        }
	    });
	}

	// send end message
	function sendEnd() {
	    pubnub.publish({
	        channel: _clientChannel,
	        message: {
	            action: 'end'
	        }
	    });
	}

	// send reset message
	function sendReset() {
		pubnub.publish({
			channel: _clientChannel,
			message: {
				action: 'reset'
			}
		});
	}

    // send validate client message
	function validateClient(message) {
        _validatedPlayers = [];
		pubnub.publish({
			channel: _clientChannel,
			message: {
				action: 'validateClient',
                data:{message:message}
			}
		});
	}

     // clients responds to validation request
	function validationResponse() {
		pubnub.publish({
			channel: _adminChannel,
			message: {
				action: 'validationResponse',
                data: {id:_uuid}
			}
		});
	}

	// send solved message
	function sendSolved(data) {
		pubnub.publish({
			channel: _clientChannel,
			message: {
				action: 'solved',
                data:data
			}
		});
	}

	// send color update message
	function sendColorUpdate(data) {
	    pubnub.publish({
	        channel: _clientChannel,
	        message: {
	            action: 'updateColors',
	            data: data
	        }
	    });
	}

	// send color change message
	function sendColorChange(data) {
	    pubnub.publish({
	        channel: _adminChannel,
	        message: {
	            action: 'changeUserColor',
	            data: data
	        }
	    });
	}

	// send color change message
	function sendInstructions(data) {
	    pubnub.publish({
	        channel: _clientChannel,
	        message: {
	            action: 'instructions',
	            data: data
	        }
	    });
	}

    function showPlayersList(list){
        var ignoreLink = "  <a class='ignorePlayer' href='#'>ignore</a><br/></span><span>";
        $("#players").html("<span>" + list.join(ignoreLink) + ignoreLink + "</span>");
        $(".ignorePlayer").click(function(e){
            e.preventDefault();
            var parent = $(e.target).parent("span");
            var ignoreId = parent.text().split(" ")[0];
            console.warn("set to ignore " + ignoreId);
            _playersToIgnore.push(ignoreId);
        });
        $("#numClients").html(list.length);
    }

    function getValidPlayers(){
        var clone = [];
        for (var i=0;i<_validatedPlayers.length;i++){
            clone.push(_validatedPlayers[i]);
        }
        return clone;
    }


	if(isAdmin) {
		return {
			sendStart:sendStart,
			sendEnd:sendEnd,
			sendReset:sendReset,
			sendSolved:sendSolved,
			sendColorUpdate:sendColorUpdate,
			sendInstructions:sendInstructions,
			getPresence:getPresence,
            validateClient:validateClient,
            getPlayers:getValidPlayers,
			uuid:_uuid
		}
	}
	return {
		sendColorChange:sendColorChange,
        validationResponse:validationResponse,
		uuid:_uuid
	}
}