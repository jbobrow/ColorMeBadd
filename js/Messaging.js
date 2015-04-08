// Messaging for all graph communications

function initPubNub(isAdmin, callbacks) {

	var _channel = 'global_channel'
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

	// Subscribe to channel
	pubnub.subscribe({
	    channel: _channel,
	    presence: function(m) {
	        //console.log(m)
	        switch (m.action) {
	            case "join":
	                // set the UUID here
	                console.log("received JOIN message - " + m.uuid);
	                if(isAdmin) {
	                	_players.push(m.uuid);
	                	$("#players").html(_players.join("<br/>"));
	                	
		    //             if(callbacks.updateGraph) {
						// 	callbacks.updateGraph(_players);
						// }
						// else
						// 	console.warn("callbacks object not found");
	                }
	                break;

	            case "leave":
	                // set this user to no longer focussed...
	                console.log("received LEAVE message - " + m.uuid);
	                var index = _players.indexOf(m.uuid);
	                
	                if (index > -1) {
    					_players.splice(index, 1);
	                	$("#players").html(_players.join("<br/>"));
					}
	                break;
	        }
	    },
	    message: function(m) {
	        switch (m.action) {

	            case "start":
	                console.log("received START message + data: ");
	            	if(!isAdmin) {
		                console.log(m.data);
		                // tell client to stop
		                if(callbacks.onReceiveStartMessage) {
		                	if(m.data) {
			                	if( m.data.links && m.data.nodes && m.data.viewType )
				            		callbacks.onReceiveStartMessage(m.data.links, m.data.nodes, m.data.viewType);
				            	else
				            		console.warn("not receiving all of our start data");
				            }
				            else
				            	console.warn("not receiving data at all");
		                }
		            	else
		            		console.warn("callbacks object not found");
		            }
	                break;

	            case "end":
	                console.log("received END message");
	            	if(!isAdmin) {
						// tell client to stop
		                if(callbacks.onReceiveStopMessage)
		            		callbacks.onReceiveStopMessage();
		            	else
		            		console.warn("callbacks object not found");
		            }
	                break;

	            case "solved":
	            	console.log("recieved SOLVED message");
	            	if(!isAdmin) {
		            	// update client
		            	if(callbacks.onReceiveSolvedMessage)
		            		callbacks.onReceiveSolvedMessage();
		            	else
		            		console.warn("callbacks object not found");
		            }
	            	break;

	            case "reset":
	            	console.log("recieved RESET message");
	            	if(!isAdmin) {
	            		// boot the user from the game
					}
	            	break;

	            case "changeUserColor":
	                console.log("received USER COLOR message");
	            	if(isAdmin) {
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
					}
	                break;

	            case "updateColors":
	            	console.log("recieved UPDATE COLOR message");
	            	if(!isAdmin) {
		            	// update client
		            	if(callbacks.onReceiveAdminColorUpdates)
		            		callbacks.onReceiveAdminColorUpdates(m.data.nodes);
		            	else
		            		console.warn("callbacks object not found");
		            }
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

		_players.splice(0,_players.length);

		pubnub.publish({
			channel: _clientChannel,
			message: {
				action: 'reset'
			}
		});

    	$("#players").html(_players.join("<br/>"));
	}

	// send solved message
	function sendSolved() {
		pubnub.publish({
			channel: _clientChannel,
			message: {
				action: 'solved'
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

	if(isAdmin) {
		return {
			sendStart:sendStart,
			sendEnd:sendEnd,
			sendReset:sendReset,
			sendSolved:sendSolved,
			sendColorUpdate:sendColorUpdate,
			getPresence:getPresence,
			players:_players,
			uuid:_uuid
		}
	}
	return {
		sendColorChange:sendColorChange,
		players:_players,
		uuid:_uuid
	}
}