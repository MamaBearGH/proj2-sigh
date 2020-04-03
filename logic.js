// Attribution to https://pokeapi.co/
function getPokemon(id, callback){
    $.ajax({
      url: "https://pokeapi.co/api/v2/pokemon/" + id + "/",
      method: "GET",
      cache: true,
      type: "JSON",
      success: function(data){
        callback(data);
      },
      error: function(err){
        console.error("[getPokemon.ajax] Error: ", err);
      }
    });
  }
  function fillSide(pokeData, target){
    var $p = $(target);
    var t = $("#pokeDetails")[0].content.cloneNode(true);
    $p.html("");
    $p.append(t);
    $p.find("#forms.sprites.front_default").attr("title", pokeData.name);
    $p.find("[name='id']").text(pokeData.id);
    $p.find("[name='name']").text(pokeData.name);
    if ($("#chkIncludeImage")[0].checked){
      $p.find("[name='sprites.front_default']").attr("src", pokeData.sprites.front_default); 
    }else{
      $p.find("[name='sprites.front_default']").attr("src", "na");
    }
  }
  function comparePokemon(poke1, poke2){
    getPokemon(poke1, function(data1){
      fillSide(data1, "#poke1");
      $("#poke1")[0]["pokemon"] = data1;
      getPokemon(poke2, function(data2){
        fillSide(data2, "#poke2");
        $("#poke2")[0]["pokemon"] = data2;
        
        var canv = $("#stats")[0];
        var ctx = canv.getContext("2d");
        var canvBox = canv.getBoundingClientRect();
        var s = {w: canvBox.width, h: canvBox.height};
        canv.width = canvBox.width;
        canv.height = canvBox.height;
        
        var m = {top: 0.1, left: 0.01, right: 0.01, bottom: 0.01};
        var ma = {top: s.h * m.top, left: s.w * m.left, right: s.w - (s.w * m.right), bottom: s.h - (s.h * m.bottom)};//, width: (m.left + m.right) * s.w, height: (m.top + m.bottom) * s.h};
        ma["width"] = ma.right - ma.left;
        ma["height"] = ma.bottom - ma.top;
  
        var stats = {}
        for(var len = data1.stats.length,n=0;n<len;n++){
          stats[data1.stats[n].stat.name] = {
            "poke1": data1.stats[n].base_stat,
            "poke2": 0
          }
        }
        for(var len = data2.stats.length,n=0;n<len;n++){
          stats[data1.stats[n].stat.name]["poke2"] = data2.stats[n].base_stat;
        }
        var statKeys = Object.getOwnPropertyNames(stats);
        for(var len = statKeys.length,n=0;n<len;n++){
          var k = statKeys[n];
          var s = stats[k];
          s["_total"] = s.poke1 + s.poke2;
          var b1 = {
            x: ma.left,
            y: ma.top + (n * (ma.height / 6)),
            w: (s.poke1 / s._total) * ma.width,
            h: ma.height / 12
          }
          var b2 = {
            x: ma.left + b1.w,
            y: ma.top + (n * (ma.height / 6)),
            w: (s.poke2 / s._total) * ma.width,
            h: ma.height / 12
          }
          var bh = {
            x: (ma.right - ma.left) / 2,
            y1: b1.y,
            y2: b1.y + b1.h
          }
          var bt = {
            x: (ma.right - ma.left) /2,
            y: b1.y - (b1.h / 4),
            w: ma.width,
            h: b1.h * 0.9
          };
          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.font = bt.h.toString() + "px Georgia";
          ctx.fillText(k, bt.x, bt.y);
          
          ctx.fillStyle = "blue";
          ctx.fillRect(b1.x, b1.y, b1.w, b1.h);
          
          ctx.fillStyle = "red";
          ctx.fillRect(b2.x, b2.y, b2.w, b2.h);
          
          ctx.strokeStyle = "white";
          ctx.moveTo(bh.x, bh.y1);
          ctx.lineTo(bh.x, bh.y1 + 5);
          ctx.moveTo(bh.x, bh.y2);
          ctx.lineTo(bh.x, bh.y2 - 5);
          ctx.stroke();
        }
        
      });
    });//Get Bulbasaur
  }
  
  $(document).ready(function(){
    $.ajax({
      url: "https://pokeapi.co/api/v2/pokedex/1/",
      cache: true,
      dataType: "json",
      type: "GET",
      success: function(pokedex){
        var items = new Array();
        for(var len = pokedex.pokemon_entries.length,n=0;n<len;n++){
          var id = pokedex.pokemon_entries[n].entry_number;
          var txt = pokedex.pokemon_entries[n].pokemon_species.name;
          txt = txt.substr(0, 1).toUpperCase() + txt.substr(1);
          items.push({id: id, text: txt});
        }
        var selOptions = {
          minimumInputLength: 1,
          width: "25%",
          data: items
        };
        $("#selPoke1").select2(selOptions);
        $("#selPoke2").select2(selOptions);
        $("#selPoke1").on("change", processSelect2);
        $("#selPoke2").on("change", processSelect2);
      }
    });
    $("#selPoke1").val("1");
    $("#selPoke2").val("7");
    processSelect2();
  });
  function processSelect2(){
    var p1 = $("#selPoke1").val();
    var p2 = $("#selPoke2").val();
    if (p1 !== "" && p2 !== ""){
      comparePokemon(p1, p2);
    }
  }