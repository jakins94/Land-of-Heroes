var cls = require('./Class').Class;
var World = cls.extend({

	init: function() {
		this.plane_w = 3,
		this.plane_h = 3,

		this.mapFile = require('./Map Files/testmap.json'),
		this.mapTest = this.mapFile.layers[0].data;

		this.world_w = this.mapFile.layers[0].width;
		this.world_h = this.mapFile.layers[0].height;

		this.map = {
			mapName: 'Test Land',
			width: this.world_w,
			height: this.world_h,
			data: []
		};



		/*for(let h=0;h<this.world_h/this.plane_h;h++) {
			for(let w=0;w<this.world_w/this.plane_w;w++) {
				this.map.data[h][w] = 0;
			}
		}*/

		//console.log(this.mapTest);
	}

});

exports.World = World;
