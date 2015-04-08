// Messaging for all graph communications

function initPubNub(isAdmin) {

	var _clientChannel = 'client'
	var _adminChannel = 'admin'

	var _channel = isAdmin ? _adminChannel : _clientChannel

	// Init
	var pubnub = PUBNUB.init({
		keepalive: 30,
	    publish_key: 'pub-c-2f911019-8b97-402e-a7e3-67de99b0364b',
	    subscribe_key: 'sub-c-5c02bef8-dcae-11e4-9e58-02ee2ddab7fe'
	});

	var _uuid = PUBNUB.uuid();

	// Subscribe to channel
	pubnub.subscribe({
	    channel: _channel,
	    presence: function(m) {
	        //console.log(m)
	        switch (m.action) {
	            case "join":
	                // set the UUID here
	                console.log("received JOIN message - " + m.uuid);
	                if (m.uuid == _uuid) {
	                    console.log("start setup");
	                }
	                break;

	            case "leave":
	                // set this user to no longer focussed...
	                console.log("received LEAVE message - " + m.uuid);
	                // updatePopulation();
	                break;
	        }
	    },
	    message: function(m) {
	        switch (m.action) {

	            case "start":
	                console.log("received START message");
	                break;

	            case "end":
	                console.log("received END message");
	                break;

	            case "solved":
	            	console.log("recieved SOLVED message");
	            	break;

	            case "changeUserColor":
	                console.log("recived USER COLOR message");
	                break;

	            case "updateColors":
	            	console.log("recieved UPDATE COlOR message");
	            	break;

	            default:
	                console.log(m);
	        }
	    }
	});

	// Publish

	// send start message
	function sendStartOfGame() {
	    pubnub.publish({
	        channel: _clientChannel,
	        message: {
	            action: 'start'
	        }
	    });
	}

	// send end message
	function sendEndOfGame() {
	    pubnub.publish({
	        channel: _clientChannel,
	        message: {
	            action: 'end'
	        }
	    });
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
	function sendColorUpdate() {
	    pubnub.publish({
	        channel: _clientChannel,
	        message: {
	        	id: m.uuid,
	            action: 'updateColors'
	        }
	    });
	}

	// send color change message
	function sendColorChange() {
	    pubnub.publish({
	        channel: _adminChannel,
	        message: {
	        	id: m.uuid,
	            action: 'changeUserColor'
	        }
	    });
	}

	if(isAdmin) {
		return {
			sendStartOfGame:sendStartOfGame,
			sendEndOfGame:sendEndOfGame,
			sendColorUpdate:sendColorUpdate
		}
	}
	return {
		sendColorChange:sendColorChange
	}
}