/**
 * Created by aghassaei on 4/7/15.
 */

function D3Graph(elSelector, color){

    //init d3 force graph

    var width = window.innerWidth, height = window.innerHeight;
    $("#statusMessage").html(width);

    var force = d3.layout.force()
        .charge(-800)
        .linkDistance(160)
        .size([width, height]);

    var svg;

    function setData(nodes, links, shouldPinToCircle){

        $("#statusMessage").html(width);

        if (shouldPinToCircle === undefined) shouldPinToCircle = false;
        var radius = (Math.min(width, height)-200)/2;
        var numNodes = nodes.length;
        for (var i=0;i<numNodes;i++){
            if (shouldPinToCircle) nodes[i].fixed = true;
            var theta = Math.PI*2/numNodes*i;
            nodes[i].px = radius*Math.cos(theta)+width/2;
            nodes[i].py = radius*Math.sin(theta)+height/2;
            nodes[i].x = radius*Math.cos(theta)+width/2;
            nodes[i].y = radius*Math.sin(theta)+height/2;
        }

        destroy();//remove any lingering graphs from dom

        svg = d3.select(elSelector).append("svg")
        .attr("width", width)
        .attr("height", height);

        force.nodes(nodes)
          .links(links)
          .start();

        var link = svg.selectAll(".link")
          .data(links)
        .enter().append("line")
          .attr("class", "link");
//          .style("stroke-width", function(d) { return Math.sqrt(d.value+2); });

        var node = svg.selectAll(".node")
          .data(nodes)
        .enter().append("circle")
          .attr("class", "node")
          .attr("r", 20)
          .attr("id", function(d){
                return "id"+d.nodeId;
            })
          .style("fill", function(d) { return color(d.group); });
        if (!shouldPinToCircle) node.call(force.drag);

        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        });
    }

    function destroy(){
        if (svg) svg.selectAll("*").remove();
        d3.select(elSelector + ">svg").remove();
    }

    function highlightNode(nodeId){
        var node = _getNode(nodeId);
        if (!node) return;
        node.attr("r", 35);
        node.style("stroke-width", 7);
        node.style("stroke", "#dadada");
    }

    function changeNodeColor(nodeId, colorGroup){
        var node = _getNode(nodeId);
        if (!node) return;
        node.style("fill", color(colorGroup));
    }

    function _getNode(nodeId){
        if (!svg) {
            console.warn("no svg object available");
            return null;
        }
        var node = svg.select("#id" + nodeId);
        if (node.length == 0 || node.length > 1){
            console.warn("no node found with unique id = " + nodeId);
            return null;
        }
        return node;
    }

    return {
        setData:setData,
        highlightNode:highlightNode,
        changeNodeColor:changeNodeColor
    }
}





