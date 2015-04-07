/**
 * Created by aghassaei on 4/7/15.
 */


function ColorNode(color) {
    this.color = color;
    this.clientId = 1;//todo get client id from pubnub
}

ColorNode.prototype.changeColor = function(newColor){
    if (newColor == this.color) return;
    this.color = newColor;
    var message = this._constructMessage();
    //todo ping graph about color change
};

ColorNode.prototype._constructMessage = function(){
    return {
        id:this.clientId,
        color:this.color
    };
};