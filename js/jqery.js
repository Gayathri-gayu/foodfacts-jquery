$(document).ready(function() {
    var $loc = $('#location');
    var $country = $('#country_Name');
    var $salt = $('#salt_Value');
    var $sugar = $('#sugar_Value');
    drawGraph();

    jQuery.support.cors = true;

    function addValue(item) {
        $loc.append('<tr><td>' + item.country + '</td><td>' + item.salt + '</td><td>' + item.sugar + '</td><td><button id="' + item.country + '" class="remove btn btn-primary">delete</button></td></tr>');

    }
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/name',
        data: "{}",
        contentType: "application/json; charset=utf-8",
        cache: false,
        contentType: "application/json; charset=utf-8",
        cache: false,
        dataType: "json",

        success: function(data) {
            $.each(data, function(i, item) {
                addValue(item);
            });
        },
        error: function() {
            alert("error getting data");
        }
    });
    $('#add_value').on('click', function() {
        var item = {
            country: $country.val(),
            sugar:parseFloat($sugar.val()),
            salt: parseFloat($salt.val()),
        }
        $.ajax({
            type: 'POST',
            url: ' http://localhost:3000/name',
            data: item,
            contentType: "application/json; charset=utf-8",
            data : JSON.stringify(item),
            dataType: "json",
            success: function(newValue) {

                addValue(newValue);
                $('svg').remove();
                drawGraph();

            },
            error: function() {
                alert("error saving values");
            }
        });
    });

    $loc.delegate('.remove', 'click', function() {
        var $tr = $(this).closest('tr');

        $.ajax({
            type: 'DELETE',
            url: 'http://localhost:3000/name/' + $(this).attr('id'),
            success: function() {
                $('svg').remove();
                drawGraph();
                $tr.remove();
            },
            error: function() {
                alert("error deleting the row");
            }
        });
    });

    //graph
    function drawGraph() {

        margin = {
                top: 40,
                bottom: 100,
                left: 150,
                right: 90
            },
            width = 700 - margin.left - margin.right,
            height = 700 - margin.top - margin.bottom;

        // define x and y scales

        var horizontal = d3.scale.ordinal().rangeRoundBands([0, width], 0.12),
            vertical = d3.scale.linear().rangeRound([height, 0]);

        var color = d3.scale.category20();

        var xAxis = d3.svg.axis()
            .scale(horizontal)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(vertical)
            .orient("left");

        // scalable vector graphics

        var svg = d3.select("#graphWrap").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // import convertedTojsonfile

        d3.json("http://localhost:3000/name", function(err, data) {
            if (err) console.log("data not loaded");
            data.forEach(function(d) {
                // d.country = d.country;
                // d.salt = parseInt(d.salt);
                // d.sugar = parseInt(d.sugar);
            });

            var xData = ["sugar", "salt"];
            var dataIntermediate = xData.map(function(c) {
                return data.map(function(d) {
                    return {
                        x: d.country,
                        y: d[c]
                    };
                });
            });
            var dataStackLayout = d3.layout.stack()(dataIntermediate);

            // specify x and y scales domain

            horizontal.domain(dataStackLayout[0].map(function(d) {
                return d.x;
            }));
            vertical.domain([0,
                    d3.max(dataStackLayout[dataStackLayout.length - 1],
                        function(d) {
                            return d.y0 + d.y;
                        })
                ])
                .nice();
            var layer = svg.selectAll(".stack")
                .data(dataStackLayout)
                .enter().append("g")
                .attr("class", "stack")
                .style("fill", function(d, i) {
                    return color(i);
                });

            // draw the bars

            layer.selectAll("rect")
                .data(function(d) {
                    return d;
                })
                .enter().append("rect")
                .attr("x", function(d) {
                    return horizontal(d.x);
                })
                .attr("y", function(d) {
                    return vertical(d.y + d.y0);
                })
                .attr("height", function(d) {
                    return vertical(d.y0) - vertical(d.y + d.y0);
                })
                .transition().duration(3000)
                .delay(function(d, i) {
                    return i * 200;
                })
                .attr("width", horizontal.rangeBand());

            // draw the xaxis
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll('text')
                .attr("transform", "translate(" + width + ",0)")
                .attr("transform", "rotate(-70)")
                .attr("dy", "-0.5em")
                .attr("dx", "-.60em")
                .style("font-size", "15px")
                .style("font-weight", "bold")
                .style("text-anchor", "end")

            svg.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", "520")
                .attr("y", "600")
                .style('fill', 'rgb(31, 119, 180)')
                .style("font-size", "15px")
                .text("countries");
                
            svg.append("g")
                .attr("class", "axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("dy", "1em")
                .style("text-anchor", "end")
                .style("font-size", "15px")
                .style("font-weight", "bold")
                .style('fill', 'rgb(31, 119, 180)')
                .text("Sugar,salt");

            var legend = svg.selectAll(".legend")
                .data(color.domain().slice())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                    return "translate(0," + i * 20 + ")";
                });

            legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 15)
                .attr("height", 15)
                .style("fill", color);

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .style("fill", "black")
                .text(function(d, i) {
                    return xData[i];
                });

        });
    }
});