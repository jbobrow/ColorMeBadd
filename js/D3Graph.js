/**
 * Created by aghassaei on 4/7/15.
 */


function D3Graph(){

    //init d3 force graph

    var width = window.innerWidth,
    height = window.innerHeight;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .charge(-800)
        .linkDistance(120)
        .size([width, height]);

    var svg;

    function setData(nodes, links){

        destroy();//remove any lingering graphs from dom

        svg = d3.select("#globalView").append("svg")
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
                return d.nodeId;
            })
          .style("fill", function(d) { return color(d.group); })
          .call(force.drag);

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
        d3.select("svg").remove();
    }

    function highlightNode(nodeId){
        var node = _getNode(nodeId);
        if (!node) return;
        node.style("stroke-width", 3);
        node.style("stroke", "#ff0");
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
        var node = svg.select("#"+nodeId);
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





